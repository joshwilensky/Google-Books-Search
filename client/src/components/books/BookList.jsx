import React from "react";
import BookItem from "./BookItem";
import EmptyState from "../layout/EmptyState";

export default function BookList({
  books = [],
  onSave,
  onDelete,
  saved = false,
  layout = "grid",
}) {
  if (!Array.isArray(books) || books.length === 0) {
    return (
      <EmptyState
        title={saved ? "No saved books" : "Nothing yet"}
        subtitle={
          saved
            ? "Books you save will appear here."
            : "Search by title, author, or keyword to see results."
        }
      />
    );
  }

  const isGrid = layout !== "list";

  return (
    <div
      data-view={isGrid ? "grid" : "list"}
      className={
        isGrid
          ? "grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-3"
          : "grid grid-cols-1 gap-6"
      }>
      {books.map((b) => {
        const k = (b && b.id) || (b && b._id) || Math.random().toString(36);
        return (
          <BookItem
            key={k}
            book={b}
            onSave={onSave}
            onDelete={onDelete}
            saved={saved}
            variant={isGrid ? "grid" : "list"}
          />
        );
      })}
    </div>
  );
}
