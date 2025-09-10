import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiSend, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { createBooksClient } from "../../context/books/BooksActions";

function getInitials(name) {
  try {
    var parts = String(name || "")
      .trim()
      .split(/\s+/);
    var a = (parts[0] && parts[0][0]) || "";
    var b = (parts[1] && parts[1][0]) || "";
    var out = a + b || a || "?";
    return out.toUpperCase();
  } catch (_) {
    return "?";
  }
}

function buildSuggestions(items, maxAuthors, maxBooks) {
  maxAuthors = Number(maxAuthors || 6);
  maxBooks = Number(maxBooks || 10);

  var books = [];
  var authorSet = Object.create(null);
  var authors = [];

  for (var i = 0; i < (items ? items.length : 0); i++) {
    var it = items[i] || {};
    var id = it.id;
    var v = it.volumeInfo || {};
    var title = v.title || "Untitled";
    var desc = v.description ? String(v.description) : "";
    var img =
      (v.imageLinks &&
        (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
      null;

    books.push({
      type: "book",
      key: "book_" + (id || i),
      title: title,
      subtitle:
        (Array.isArray(v.authors) && v.authors.join(", ")) || v.publisher || "",
      img: img,
      description: desc.slice(0, 120),
      payload: { id: id },
    });

    if (Array.isArray(v.authors)) {
      for (var j = 0; j < v.authors.length; j++) {
        var name = String(v.authors[j] || "").trim();
        if (name && !authorSet[name]) {
          authorSet[name] = 1;
          authors.push({
            type: "author",
            key: "author_" + name,
            title: name,
            subtitle: "Author",
            img: null,
            description: "Search books by this author",
            payload: { author: name },
          });
        }
      }
    }
  }

  return {
    authors: authors.slice(0, maxAuthors),
    books: books.slice(0, maxBooks),
  };
}

/**
 * ChatGPT-style input with live suggestions dropdown.
 * - Authors: clicking runs an author search
 * - Books: clicking navigates to /book/:id
 */
export default function SearchBar(props) {
  var onSearch = props.onSearch;
  var minChars = typeof props.minChars === "number" ? props.minChars : 3;
  var placeholder = props.placeholder;

  var history = useNavigate();
  var client = useMemo(function () {
    return createBooksClient();
  }, []);
  var [q, setQ] = useState("");
  var [open, setOpen] = useState(false);
  var [loading, setLoading] = useState(false);
  var [suggestions, setSuggestions] = useState({ authors: [], books: [] });
  var [activeIdx, setActiveIdx] = useState(-1);
  var boxRef = useRef(null);
  var inputRef = useRef(null);
  var reqIdRef = useRef(0);

  // Focus with '/'
  useEffect(function () {
    function onKey(e) {
      var tag = (e.target && e.target.tagName) || "";
      var inField = tag === "INPUT" || tag === "TEXTAREA";
      if (!inField && e.key === "/") {
        e.preventDefault();
        if (inputRef.current) inputRef.current.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return function () {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close on outside click
  useEffect(function () {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return function () {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  // Debounced suggestions
  useEffect(
    function () {
      var query = (q || "").trim();
      if (query.length < minChars) {
        setSuggestions({ authors: [], books: [] });
        setOpen(false);
        setActiveIdx(-1);
        return;
      }
      var myId = ++reqIdRef.current;
      setLoading(true);
      var t = setTimeout(function () {
        client
          .searchPaged(query, 0, 20)
          .then(function (res) {
            if (myId !== reqIdRef.current) return;
            var built = buildSuggestions(res && res.items ? res.items : []);
            setSuggestions(built);
            var hasAny = built.authors.length + built.books.length > 0;
            setOpen(hasAny);
            setActiveIdx(hasAny ? 0 : -1);
          })
          .catch(function () {
            if (myId !== reqIdRef.current) return;
            setSuggestions({ authors: [], books: [] });
            setOpen(false);
            setActiveIdx(-1);
          })
          .finally(function () {
            if (myId !== reqIdRef.current) return;
            setLoading(false);
          });
      }, 350);
      return function () {
        clearTimeout(t);
      };
    },
    [q, minChars, client]
  );

  function flattened() {
    return [].concat(suggestions.authors || [], suggestions.books || []);
  }

  function selectSuggestion(sug) {
    if (!sug) return;
    if (sug.type === "author") {
      var authorQuery =
        'inauthor:"' +
        (sug.payload && sug.payload.author ? sug.payload.author : "") +
        '"';
      setQ(authorQuery);
      setOpen(false);
      setActiveIdx(-1);
      if (onSearch) onSearch(authorQuery, true);
    } else {
      var id = sug.payload && sug.payload.id;
      if (id) {
        setOpen(false);
        setActiveIdx(-1);
        history.push("/book/" + encodeURIComponent(id));
      } else {
        var titleQuery = String(sug.title || "").trim();
        setQ(titleQuery);
        setOpen(false);
        setActiveIdx(-1);
        if (onSearch) onSearch(titleQuery, true);
      }
    }
  }

  function onSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    var query = (q || "").trim();
    if (query.length < minChars) return;
    setOpen(false);
    setActiveIdx(-1);
    if (onSearch) onSearch(query, true);
  }

  function onKeyDown(e) {
    if (!open) return;
    var list = flattened();
    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(function (i) {
        return (i + 1) % list.length;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(function (i) {
        return (i - 1 + list.length) % list.length;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectSuggestion(list[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  var list = flattened();

  return (
    <form onSubmit={onSubmit} className='mb-6' ref={boxRef}>
      <div className='max-w-3xl mx-auto'>
        <div className='relative flex items-center rounded-2xl md:rounded-3xl bg-base-100 border border-base-300 shadow-soft hover:shadow-lg transition px-4 py-3 md:px-5 md:py-4'>
          {/* Left icon */}
          <span className='absolute left-4 md:left-5 opacity-70'>
            <FiSearch className='text-xl' aria-hidden='true' />
          </span>

          {/* Input */}
          <input
            ref={inputRef}
            type='text'
            className='w-full bg-transparent outline-none pl-9 md:pl-10 pr-14 md:pr-16 text-base md:text-lg'
            value={q}
            onChange={function (e) {
              setQ(e.target.value);
            }}
            onFocus={function () {
              if (list.length) setOpen(true);
            }}
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
          {open ? (
            <div className='absolute left-0 right-0 top-full mt-2 z-40 rounded-xl border border-base-300 bg-base-100 shadow-xl overflow-hidden'>
              {/* Authors */}
              {suggestions.authors && suggestions.authors.length ? (
                <div className='py-2'>
                  <div className='px-4 pb-1 text-xs uppercase opacity-60'>
                    Authors
                  </div>
                  {suggestions.authors.map(function (sug, idx) {
                    var flatIdx = idx; // authors first
                    var active = activeIdx === flatIdx;
                    return (
                      <button
                        type='button'
                        key={sug.key}
                        onMouseEnter={function () {
                          setActiveIdx(flatIdx);
                        }}
                        onClick={function () {
                          selectSuggestion(sug);
                        }}
                        className={
                          "w-full text-left px-4 py-2 flex items-start gap-3 hover:bg-base-200 " +
                          (active ? "bg-base-200" : "")
                        }>
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
              ) : null}

              {/* Books */}
              {suggestions.books && suggestions.books.length ? (
                <div className='py-2 border-t border-base-300'>
                  <div className='px-4 pb-1 text-xs uppercase opacity-60'>
                    Books
                  </div>
                  {suggestions.books.map(function (sug, idx) {
                    var flatIdx =
                      (suggestions.authors ? suggestions.authors.length : 0) +
                      idx;
                    var active = activeIdx === flatIdx;
                    return (
                      <button
                        type='button'
                        key={sug.key}
                        onMouseEnter={function () {
                          setActiveIdx(flatIdx);
                        }}
                        onClick={function () {
                          selectSuggestion(sug);
                        }}
                        className={
                          "w-full text-left px-4 py-2 flex items-start gap-3 hover:bg-base-200 " +
                          (active ? "bg-base-200" : "")
                        }>
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
              ) : null}

              <div className='px-4 py-2 text-xs opacity-60 border-t border-base-300 flex items-center justify-between'>
                <span>
                  {loading
                    ? "Searching…"
                    : "Use ↑ ↓ to navigate, Enter to select"}
                </span>
                <span>
                  Press <kbd className='kbd kbd-xs'>Esc</kbd> to close
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className='text-center mt-2 text-sm opacity-70'>
          Tip: type at least {minChars} characters. Press{" "}
          <kbd className='kbd'>/</kbd> to focus.
        </div>
      </div>
    </form>
  );
}
