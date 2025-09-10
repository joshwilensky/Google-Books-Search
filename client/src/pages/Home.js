import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooksClient, saveBook } from "../context/books/BooksActions";
import SearchBar from "../components/books/SearchBar";
import BookList from "../components/books/BookList";
import ViewToggle from "../components/layout/ViewToggle";

const Skeleton = () => (
  <div className='card bg-base-100 shadow-soft'>
    <div className='card-body grid gap-4 md:grid-cols-[120px_1fr]'>
      <div className='skeleton w-[120px] aspect-[3/4]' />
      <div>
        <div className='skeleton h-5 w-2/3 mb-3' />
        <div className='skeleton h-3 w-full mb-2' />
        <div className='skeleton h-3 w-5/6' />
      </div>
    </div>
  </div>
);

export default function Home() {
  const client = useMemo(() => createBooksClient(), []);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [nextIndex, setNextIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [layout, setLayout] = useState("grid");

  const reqIdRef = useRef(0);
  const mountedRef = useRef(true);
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (client.cancel) client.cancel();
    };
  }, [client]);

  const runSearch = useCallback(
    async (q, reset) => {
      if (!q) return;
      const myId = ++reqIdRef.current;
      setError("");

      if (reset) {
        if (client.cancel) client.cancel();
        setLoading(true);
        setItems([]);
        setNextIndex(0);
        setHasMore(false);
        setTotal(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const start = reset ? 0 : nextIndex;
        const result = await client.searchPaged(q, start, 20);
        if (!mountedRef.current || myId !== reqIdRef.current) return;

        const chunk = (result && result.items) || [];
        const ni =
          result && typeof result.nextIndex === "number"
            ? result.nextIndex
            : start + chunk.length;
        const hm = !!(result && result.hasMore);

        setItems((prev) => (reset ? chunk : prev.concat(chunk)));
        setNextIndex(ni);
        setHasMore(hm);
        setQuery(q);
        setTotal(typeof result?.total === "number" ? result.total : null);
      } catch (e) {
        if (!mountedRef.current || myId !== reqIdRef.current) return;
        if (e && e.aborted) {
          // canceled by a new search
        } else if (e && e.status === 429) {
          setError("Too many requests. Please pause a second and try again.");
        } else if (e && e.timedOut) {
          setError("Request timed out. Please try again.");
        } else {
          setError((e && e.message) || "Search failed.");
        }
      } finally {
        if (!mountedRef.current || myId !== reqIdRef.current) return;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [client, nextIndex]
  );

  const onSearch = useCallback(
    (q, reset = true) => runSearch(q, reset),
    [runSearch]
  );

  const onLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && query) runSearch(query, false);
  }, [loading, loadingMore, hasMore, query, runSearch]);

  const onSaveBook = useCallback(
    async (book) => {
      const v = book?.volumeInfo || {};
      await saveBook({
        volumeId: book?.id,
        title: v.title || "",
        authors: Array.isArray(v.authors) ? v.authors : [],
        image:
          (v.imageLinks &&
            (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
          "",
        infoLink: v.infoLink || "",
        description: String(v.description || "").replace(/<\/?[^>]+>/g, ""),
      });
      navigate("/saved");
    },
    [navigate]
  );


  const shown = items.length;
  const totalLabel =
    typeof total === "number"
      ? `Showing ${shown} of ${total} result${total !== 1 ? "s" : ""}`
      : `Showing ${shown} result${shown !== 1 ? "s" : ""}`;

  return (
    <div className='page-wrap max-w-5xl'>
      <SearchBar onSearch={onSearch} minChars={3} />

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4'>
        <div className='opacity-70 text-sm'>
          {query ? (
            <>
              {totalLabel} for “<span className='font-medium'>{query}</span>”
            </>
          ) : (
            "Start searching to see results"
          )}
        </div>
        <ViewToggle value={layout} onChange={setLayout} />
      </div>

      {error ? (
        <div className='alert alert-warning mb-4'>
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className='grid grid-cols-1 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <BookList books={items} layout={layout} onSave={onSaveBook} />
          {hasMore && (
            <div className='flex justify-center py-6'>
              <button
                className='btn btn-outline'
                onClick={onLoadMore}
                disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
