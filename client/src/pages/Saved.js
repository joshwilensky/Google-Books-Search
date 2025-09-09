import React from "react";
import { useContext, useEffect } from "react";
import BooksContext from "../context/books/BooksContext";
import { listSaved, deleteBook } from "../context/books/BooksActions";
import BookList from "../components/books/BookList";

export default function Saved() {
  const { saved, dispatch } = useContext(BooksContext);

  useEffect(() => {
    (async () => {
      dispatch({ type: "SET_LOADING" });
      try {
        const items = await listSaved();
        dispatch({ type: "SET_SAVED", payload: items });
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: e.message || "Load failed" });
        dispatch({ type: "SET_SAVED", payload: [] });
      }
    })();
  }, [dispatch]);

  const onDelete = async (book) => {
    dispatch({ type: "SET_LOADING" });
    try {
      await deleteBook(book);
      const items = await listSaved();
      dispatch({ type: "SET_SAVED", payload: items });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: e.message || "Delete failed" });
      dispatch({ type: "SET_LOADING" }); // clear spinner
      dispatch({ type: "SET_SAVED", payload: saved });
    }
  };

  return <BookList books={saved} onDelete={onDelete} saved />;
}
