import axios from "axios";

// Your own API base (for saved books)
var API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");
var RAW_KEY = (process.env.REACT_APP_GOOGLE_BOOKS_KEY || "").trim();

// Accept only plausible Google keys; never send GitHub tokens by mistake
function isPlausibleGoogleKey(k) {
  return /^AIza[0-9A-Za-z\-_]{20,}$/.test(k || "");
}
function looksLikeGitHubToken(k) {
  return /^gh[pous]_|^github_pat_/i.test(k || "");
}

// fetch JSON with a hard timeout (so nothing stalls forever)
function fetchJSON(url, timeoutMs) {
  var ac = new AbortController();
  var t = setTimeout(function () {
    ac.abort();
  }, Number(timeoutMs || 8000));
  return fetch(url, { signal: ac.signal })
    .then(function (res) {
      clearTimeout(t);
      if (!res.ok) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (j) {
            var msg =
              (j && j.error && j.error.message) ||
              j.message ||
              res.statusText ||
              "Request failed";
            var err = new Error(msg);
            err.status = res.status;
            throw err;
          });
      }
      return res.json();
    })
    .catch(function (e) {
      clearTimeout(t);
      if (e && e.name === "AbortError") {
        var err = new Error("aborted");
        err.aborted = true;
        throw err;
      }
      throw e;
    });
}

export function createBooksClient() {
  var controller = null; // cancel active search
  var keyUsable =
    !!RAW_KEY &&
    isPlausibleGoogleKey(RAW_KEY) &&
    !looksLikeGitHubToken(RAW_KEY);

  function cancel() {
    if (controller) controller.abort();
    controller = null;
  }

  async function searchPaged(q, startIndex, maxResults) {
    var query = String(q || "").trim();
    var si = Number(startIndex || 0);
    var mr = Number(maxResults || 20);
    if (!query) return { items: [], nextIndex: 0, hasMore: false, total: 0 };

    // cancel previous
    cancel();
    controller = new AbortController();

    var params = new URLSearchParams({
      q: query,
      startIndex: String(si),
      maxResults: String(mr),
    });
    if (keyUsable) params.set("key", RAW_KEY);

    var url =
      "https://www.googleapis.com/books/v1/volumes?" + params.toString();

    var data;
    try {
      // race against cancel
      data = await Promise.race([
        fetchJSON(url, 8000),
        new Promise(function (_res, rej) {
          controller.signal.addEventListener("abort", function () {
            var e = new Error("aborted");
            e.aborted = true;
            rej(e);
          });
        }),
      ]);
    } catch (e) {
      var msg = e && e.message ? e.message.toLowerCase() : "";
      var invalid =
        e &&
        (e.status === 400 || e.status === 403) &&
        (msg.indexOf("api key not valid") >= 0 ||
          msg.indexOf("invalid key") >= 0);
      if (invalid && keyUsable) {
        keyUsable = false; // turn off bad key and retry once
        var params2 = new URLSearchParams({
          q: query,
          startIndex: String(si),
          maxResults: String(mr),
        });
        var url2 =
          "https://www.googleapis.com/books/v1/volumes?" + params2.toString();
        data = await fetchJSON(url2, 8000);
      } else {
        throw e;
      }
    } finally {
      controller = null;
    }

    var total =
      data && typeof data.totalItems === "number" ? data.totalItems : 0;
    var items = data && Array.isArray(data.items) ? data.items : [];
    var nextIndexOut = si + mr;
    var hasMore = nextIndexOut < total;

    return {
      items: items,
      nextIndex: nextIndexOut,
      hasMore: hasMore,
      total: total,
    };
  }

  async function getById(volumeId) {
    if (!volumeId) throw new Error("Missing book id");

    var params = new URLSearchParams();
    if (keyUsable) params.set("key", RAW_KEY);

    var base =
      "https://www.googleapis.com/books/v1/volumes/" +
      encodeURIComponent(String(volumeId));
    var url = base + (params.toString() ? "?" + params.toString() : "");

    try {
      return await fetchJSON(url, 8000);
    } catch (e) {
      var msg = e && e.message ? e.message.toLowerCase() : "";
      var invalid =
        e &&
        (e.status === 400 || e.status === 403) &&
        (msg.indexOf("api key not valid") >= 0 ||
          msg.indexOf("invalid key") >= 0);
      if (invalid && keyUsable) {
        keyUsable = false;
        return await fetchJSON(base, 8000);
      }
      throw e;
    }
  }

  return { searchPaged: searchPaged, getById: getById, cancel: cancel };
}

/* -------- saved books (API with localStorage fallback) -------- */

const LS_KEY = "gbs:saved";

function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLS(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr || []));
  } catch {}
}

// Normalize a Google volume into a compact saved record
export function normalizeSaved(input) {
  const vol = input?.volumeInfo || {};
  const id =
    input?.volumeId ||
    input?.id ||
    (vol.industryIdentifiers &&
      vol.industryIdentifiers[0] &&
      vol.industryIdentifiers[0].identifier) ||
    undefined;

  return {
    id,                               // single id field for matching
    volumeId: id,                     // keep for compatibility
    title: vol.title || input?.title || "",
    authors:
      Array.isArray(vol.authors)
        ? vol.authors
        : Array.isArray(input?.authors)
        ? input.authors
        : [],
    image:
      (vol.imageLinks &&
        (vol.imageLinks.thumbnail || vol.imageLinks.smallThumbnail)) ||
      input?.image ||
      "",
    infoLink: vol.infoLink || input?.infoLink || "",
    description:
      (input?.description ||
        (typeof vol.description === "string" ? vol.description : "")).replace(
        /<\/?[^>]+>/g,
        ""
      ),
    savedAt: Date.now(),
  };
}

function haveAPI() {
  return !!API_BASE; // set REACT_APP_API_BASE to use your real backend
}

export async function listSaved() {
  if (haveAPI()) {
    try {
      const { data } = await axios.get(API_BASE + "/api/books", {
        withCredentials: true,
      });
      // If your API returns array of books, pass through; otherwise normalize
      return Array.isArray(data) ? data : [];
    } catch {
      // fall back to localStorage
    }
  }
  return readLS();
}

export async function saveBook(bookish) {
  const record = normalizeSaved(bookish);

  if (haveAPI()) {
    try {
      const { data } = await axios.post(
        API_BASE + "/api/books",
        record,
        { withCredentials: true }
      );
      return data || record;
    } catch {
      // fall back to localStorage
    }
  }

  // localStorage upsert by id
  const all = readLS();
  const idx = all.findIndex((b) => (b.id || b.volumeId) === record.id);
  if (idx >= 0) all[idx] = { ...all[idx], ...record };
  else all.unshift(record);
  writeLS(all);
  return record;
}

export async function deleteBook(idOrBook) {
  let id = null;
  if (typeof idOrBook === "string") id = idOrBook;
  if (!id && idOrBook && idOrBook.id) id = idOrBook.id;
  if (!id && idOrBook && idOrBook._id) id = idOrBook._id;
  if (!id && idOrBook && idOrBook.volumeId) id = idOrBook.volumeId;

  if (haveAPI()) {
    try {
      const { data } = await axios.delete(
        API_BASE + "/api/books/" + encodeURIComponent(id),
        { withCredentials: true }
      );
      return data || { ok: true };
    } catch {
      // fall back to localStorage
    }
  }

  const all = readLS().filter((b) => (b.id || b.volumeId) !== id);
  writeLS(all);
  return { ok: true };
}

