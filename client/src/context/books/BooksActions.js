import axios from "axios";

// Your own API base (for saved books)
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");
const RAW_KEY = (process.env.REACT_APP_GOOGLE_BOOKS_KEY || "").trim();

// Accept only plausible Google keys; never send GitHub tokens by mistake
function isPlausibleGoogleKey(k) {
  return /^AIza[0-9A-Za-z\-_]{20,}$/.test(k);
}
function looksLikeGitHubToken(k) {
  return /^gh[pous]_|^github_pat_/i.test(k);
}

export function createBooksClient() {
  let controller = null; // active request
  let keyUsable =
    !!RAW_KEY &&
    isPlausibleGoogleKey(RAW_KEY) &&
    !looksLikeGitHubToken(RAW_KEY);

  function cancel() {
    if (controller) controller.abort();
    controller = null;
  }

  function fetchJSON(url, timeoutMs) {
    const outer = new AbortController();
    const timer = setTimeout(() => outer.abort(), timeoutMs || 8000);

    return fetch(url, { signal: outer.signal })
      .then(async (res) => {
        clearTimeout(timer);
        if (!res.ok) {
          let msg = res.statusText || "Request failed";
          try {
            const j = await res.json();
            msg = (j && (j.error?.message || j.message)) || msg;
          } catch {}
          const err = new Error(msg);
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .catch((e) => {
        clearTimeout(timer);
        if (e.name === "AbortError") {
          const err = new Error("aborted");
          err.aborted = true;
          throw err;
        }
        throw e;
      });
  }

  async function searchPaged(q, startIndex, maxResults) {
    const query = (q || "").trim();
    const si = Number(startIndex || 0);
    const mr = Number(maxResults || 20);
    if (!query) return { items: [], nextIndex: 0, hasMore: false, total: 0 };

    // cancel any previous request and create a scoped controller for this call
    cancel();
    controller = new AbortController();

    const params = new URLSearchParams({
      q: query,
      startIndex: String(si),
      maxResults: String(mr),
    });
    if (keyUsable) params.set("key", RAW_KEY);

    const url =
      "https://www.googleapis.com/books/v1/volumes?" + params.toString();

    let data;
    try {
      // hook the scoped controller into fetchJSON via URL + global controller race guard
      const race = Promise.race([
        fetchJSON(url, 8000),
        new Promise((_, rej) =>
          controller.signal.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.aborted = true;
            rej(e);
          })
        ),
      ]);
      data = await race;
    } catch (e) {
      // If Google says the key is invalid, stop sending it and try once without a key.
      const msg = e && e.message ? e.message.toLowerCase() : "";
      const invalid =
        e &&
        (e.status === 400 || e.status === 403) &&
        (msg.indexOf("api key not valid") >= 0 ||
          msg.indexOf("invalid key") >= 0);
      if (invalid && keyUsable) {
        keyUsable = false;
        const params2 = new URLSearchParams({
          q: query,
          startIndex: String(si),
          maxResults: String(mr),
        });
        const url2 =
          "https://www.googleapis.com/books/v1/volumes?" + params2.toString();
        data = await fetchJSON(url2, 8000);
      } else {
        throw e;
      }
    } finally {
      // this request is done; clear controller
      controller = null;
    }

    const total =
      data && typeof data.totalItems === "number" ? data.totalItems : 0;
    const items = data && Array.isArray(data.items) ? data.items : [];
    const nextIndexOut = si + mr;
    const hasMore = nextIndexOut < total;

    return { items, nextIndex: nextIndexOut, hasMore, total };
  }

  return { searchPaged, cancel };
}

/* -------- saved books (unchanged) -------- */
export async function listSaved() {
  const { data } = await axios.get(API_BASE + "/api/books");
  return data || [];
}
export async function saveBook(book) {
  const { data } = await axios.post(API_BASE + "/api/books", book);
  return data;
}
export async function deleteBook(idOrBook) {
  let id = null;
  if (typeof idOrBook === "string") id = idOrBook;
  if (!id && idOrBook && idOrBook.id) id = idOrBook.id;
  if (!id && idOrBook && idOrBook._id) id = idOrBook._id;
  if (!id && idOrBook && idOrBook.volumeId) id = idOrBook.volumeId;
  if (
    !id &&
    idOrBook &&
    idOrBook.volumeInfo &&
    Array.isArray(idOrBook.volumeInfo.industryIdentifiers) &&
    idOrBook.volumeInfo.industryIdentifiers[0] &&
    idOrBook.volumeInfo.industryIdentifiers[0].identifier
  ) {
    id = idOrBook.volumeInfo.industryIdentifiers[0].identifier;
  }
  if (!id) throw new Error("Unable to determine book id");
  const { data } = await axios.delete(
    API_BASE + "/api/books/" + encodeURIComponent(id)
  );
  return data;
}
