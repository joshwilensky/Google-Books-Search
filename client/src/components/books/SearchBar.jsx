import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiSend, FiUser } from "react-icons/fi";
import { createBooksClient } from "../../context/books/BooksActions";

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b || a).toUpperCase();
}

function buildSuggestions(items, maxAuthors = 6, maxBooks = 10) {
  const books = [];
  const authorSet = new Set();
  const authors = [];

  for (let i = 0; i < items.length; i++) {
    const v = items[i]?.volumeInfo || {};
    const title = v.title || "Untitled";
    const desc = v.description ? String(v.description) : "";
    const img =
      v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)
        ? v.imageLinks.thumbnail || v.imageLinks.smallThumbnail
        : null;

    books.push({
      type: "book",
      key: "book_" + (items[i]?.id || i),
      title,
      subtitle: v.authors ? v.authors.join(", ") : v.publisher || "",
      img,
      description: desc.slice(0, 120),
      payload: { title },
    });

    if (Array.isArray(v.authors)) {
      v.authors.forEach((a) => {
        const name = String(a).trim();
        if (name && !authorSet.has(name)) {
          authorSet.add(name);
          authors.push({
            type: "author",
            key: "author_" + name,
            title: name,
            subtitle: "Author",
            img: null, // will render initials avatar
            description: "Search books by this author",
            payload: { author: name },
          });
        }
      });
    }
  }

  return {
    authors: authors.slice(0, maxAuthors),
    books: books.slice(0, maxBooks),
  };
}

/**
 * ChatGPT-style input with live suggestions dropdown.
 * - Min chars before suggesting (default 3)
 * - Keyboard: "/" focuses, Up/Down navigate, Enter select.
 */
export default function SearchBar({ onSearch, minChars = 3, placeholder }) {
  const client = useMemo(() => createBooksClient(), []);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ authors: [], books: [] });
  const [activeIdx, setActiveIdx] = useState(-1); // flattened index
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const reqIdRef = useRef(0);

  // focus with "/" like ChatGPT
  useEffect(() => {
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || "";
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if (!inField && e.key === "/") {
        e.preventDefault();
        inputRef.current && inputRef.current.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // debounced suggestions
  useEffect(() => {
    const query = (q || "").trim();
    if (query.length < minChars) {
      setSuggestions({ authors: [], books: [] });
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    const myId = ++reqIdRef.current;
    setLoading(true);

    const t = setTimeout(async () => {
      try {
        // small, fast request for suggestions
        const res = await client.searchPaged(query, 0, 20);
        if (myId !== reqIdRef.current) return; // stale
        const built = buildSuggestions(res.items || []);
        setSuggestions(built);
        const hasAny = built.authors.length + built.books.length > 0;
        setOpen(hasAny);
        setActiveIdx(hasAny ? 0 : -1);
      } catch (_) {
        // ignore errors in suggestions; just hide
        if (myId !== reqIdRef.current) return;
        setSuggestions({ authors: [], books: [] });
        setOpen(false);
        setActiveIdx(-1);
      } finally {
        if (myId !== reqIdRef.current) return;
        setLoading(false);
      }
    }, 350); // debounce

    return () => clearTimeout(t);
  }, [q, minChars, client]);

  function flattened() {
    return [...suggestions.authors, ...suggestions.books];
  }

  function selectSuggestion(sug) {
    if (!sug) return;
    if (sug.type === "author") {
      const authorQuery = `inauthor:"${sug.payload.author}"`;
      setQ(authorQuery);
      setOpen(false);
      setActiveIdx(-1);
      onSearch && onSearch(authorQuery, true);
    } else {
      const titleQuery = (sug.payload.title || "").trim();
      setQ(titleQuery);
      setOpen(false);
      setActiveIdx(-1);
      onSearch && onSearch(titleQuery, true);
    }
  }

  function onSubmit(e) {
    e && e.preventDefault();
    const query = (q || "").trim();
    if (query.length < minChars) return;
    setOpen(false);
    setActiveIdx(-1);
    onSearch && onSearch(query, true);
  }

  function onKeyDown(e) {
    if (!open) return;
    const list = flattened();
    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + list.length) % list.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectSuggestion(list[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  const list = flattened();

  return (
    <form onSubmit={onSubmit} className='mb-6' ref={boxRef}>
      <div className='max-w-3xl mx-auto'>
        <div
          className='
            relative flex items-center
            rounded-2xl md:rounded-3xl
            bg-base-100 border border-base-300
            shadow-soft hover:shadow-lg
            transition
            px-4 py-3 md:px-5 md:py-4
          '>
          {/* Left icon */}
          <span className='absolute left-4 md:left-5 opacity-70'>
            <FiSearch className='text-xl' aria-hidden />
          </span>

          {/* Input */}
          <input
            ref={inputRef}
            type='text'
            className='
              w-full bg-transparent outline-none
              pl-9 md:pl-10 pr-14 md:pr-16
              text-base md:text-lg
            '
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => list.length && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={
              placeholder ||
              "Ask for a book, author, or topic…  (press / to focus)"
            }
            aria-label='Search books'
            autoComplete='off'
          />

          {/* Right button */}
          <button
            type='submit'
            className='absolute right-2 md:right-3 btn btn-primary btn-circle'
            aria-label='Search'
            title='Search'>
            <FiSend />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className='
                absolute left-0 right-0 top-full mt-2
                z-40 rounded-xl border border-base-300 bg-base-100
                shadow-xl overflow-hidden
              '>
              {/* Authors section */}
              {suggestions.authors.length > 0 && (
                <div className='py-2'>
                  <div className='px-4 pb-1 text-xs uppercase opacity-60'>
                    Authors
                  </div>
                  {suggestions.authors.map((sug, idx) => {
                    const flatIdx = idx; // authors come first
                    const active = activeIdx === flatIdx;
                    return (
                      <button
                        type='button'
                        key={sug.key}
                        onMouseEnter={() => setActiveIdx(flatIdx)}
                        onClick={() => selectSuggestion(sug)}
                        className={
                          "w-full text-left px-4 py-2 flex items-start gap-3 hover:bg-base-200 " +
                          (active ? "bg-base-200" : "")
                        }>
                        {/* Initials avatar */}
                        <div className='avatar placeholder'>
                          <div className='w-10 rounded-full bg-base-300'>
                            <span className='text-sm'>
                              {getInitials(sug.title)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className='font-medium'>{sug.title}</div>
                          <div className='text-xs opacity-70'>
                            {sug.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Books section */}
              {suggestions.books.length > 0 && (
                <div className='py-2 border-t border-base-300'>
                  <div className='px-4 pb-1 text-xs uppercase opacity-60'>
                    Books
                  </div>
                  {suggestions.books.map((sug, idx) => {
                    const flatIdx = suggestions.authors.length + idx;
                    const active = activeIdx === flatIdx;
                    return (
                      <button
                        type='button'
                        key={sug.key}
                        onMouseEnter={() => setActiveIdx(flatIdx)}
                        onClick={() => selectSuggestion(sug)}
                        className={
                          "w-full text-left px-4 py-2 flex items-start gap-3 hover:bg-base-200 " +
                          (active ? "bg-base-200" : "")
                        }>
                        {/* Cover image or placeholder */}
                        <div className='w-10 h-14 rounded overflow-hidden bg-base-300 flex-shrink-0'>
                          {sug.img ? (
                            <img
                              src={sug.img}
                              alt={sug.title}
                              loading='lazy'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center opacity-60'>
                              <FiUser />
                            </div>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <div className='font-medium truncate'>
                            {sug.title}
                          </div>
                          {sug.subtitle ? (
                            <div className='text-xs opacity-70 truncate'>
                              {sug.subtitle}
                            </div>
                          ) : null}
                          {sug.description ? (
                            <div className='text-xs opacity-70 line-clamp-2'>
                              {sug.description}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className='px-4 py-2 text-xs opacity-60 border-t border-base-300 flex items-center justify-between'>
                <span>
                  {loading
                    ? "Searching…"
                    : "Use ↑ ↓ to navigate, Enter to search"}
                </span>
                <span>
                  Press <kbd className='kbd kbd-xs'>Esc</kbd> to close
                </span>
              </div>
            </div>
          )}
        </div>

        <div className='text-center mt-2 text-sm opacity-70'>
          Tip: type at least {minChars} characters. Press{" "}
          <kbd className='kbd'>/</kbd> to focus.
        </div>
      </div>
    </form>
  );
}
