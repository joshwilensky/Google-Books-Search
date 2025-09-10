import React, { useEffect, useState } from "react";
import { listSaved, deleteBook } from "../context/books/BooksActions";
import BookList from "../components/books/BookList";

export default function Saved() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await listSaved();
        setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed to load saved books.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onDelete = async (b) => {
    try {
      await deleteBook(b);
      const id = b.id || b._id || b.volumeId;
      setBooks((prev) =>
        prev.filter((x) => (x.id || x._id || x.volumeId) !== id)
      );
    } catch (e) {
      setErr(e?.message || "Failed to delete.");
    }
  };

  return (
    <div className='page-wrap max-w-5xl'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Saved</h1>
        <div className='opacity-70'>{books.length} saved</div>
      </div>
      {err && (
        <div className='alert alert-warning mb-4'>
          <span>{err}</span>
        </div>
      )}
      {loading ? (
        <div className='skeleton h-24 w-full' />
      ) : (
        <BookList books={books} layout='list' saved onDelete={onDelete} />
      )}
    </div>
  );
}
