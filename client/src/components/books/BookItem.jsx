import React, { memo } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaBookmark, FaTrash } from "react-icons/fa";

function BookItem(props) {
  const { book, onSave, onDelete, saved, variant = "grid" } = props;

  // Support BOTH shapes:
  // - Google API item: { id, volumeInfo: { title, authors, description, infoLink, imageLinks } }
  // - Saved record:     { id|volumeId, title, authors, description, infoLink, image }
  const v = book?.volumeInfo || {};
  const title = v.title ?? book?.title ?? "Untitled";

  const authors = Array.isArray(v.authors)
    ? v.authors
    : Array.isArray(book?.authors)
    ? book.authors
    : null;

  const description =
    (typeof v.description === "string" && v.description) ||
    (typeof book?.description === "string" && book.description) ||
    "";

  const infoLink = v.infoLink || book?.infoLink || "";

  const thumb =
    (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
    book?.image ||
    null;

  const id = book?.id || book?.volumeId; // for details page
  const detailsHref = id ? `/book/${encodeURIComponent(id)}` : "#";

  const handleSave = () => onSave && onSave(book);
  const handleDelete = () => onDelete && onDelete(book);

  if (variant === "grid") {
    return (
      <article className='card bg-base-100 shadow-soft card-hover h-full'>
        <figure className='p-4'>
          <Link to={detailsHref} className='block w-full' aria-label={title}>
            <div className='w-full aspect-[3/4] bg-base-300 rounded overflow-hidden'>
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  loading='lazy'
                  className='w-full h-full object-cover'
                />
              ) : null}
            </div>
          </Link>
        </figure>
        <div className='card-body'>
          <Link to={detailsHref} className='card-title text-base md:text-lg'>
            {title}
          </Link>
          {authors ? (
            <p className='opacity-80 text-sm'>by {authors.join(", ")}</p>
          ) : null}
          <div className='card-actions justify-between items-center mt-2'>
            {infoLink ? (
              <a
                href={infoLink}
                target='_blank'
                rel='noreferrer'
                className='btn btn-outline btn-sm'>
                <FaExternalLinkAlt className='mr-2' /> View
              </a>
            ) : (
              <span />
            )}
            {saved ? (
              <button className='btn btn-error btn-sm' onClick={handleDelete}>
                <FaTrash className='mr-2' /> Delete
              </button>
            ) : (
              <button className='btn btn-secondary btn-sm' onClick={handleSave}>
                <FaBookmark className='mr-2' /> Save
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // list (long) variant
  return (
    <article className='card bg-base-100 shadow-soft card-hover'>
      <div className='card-body grid gap-4 md:grid-cols-[120px_1fr]'>
        <div className='rounded overflow-hidden'>
          <Link
            to={detailsHref}
            className='block w-[90px] md:w-[120px]'
            aria-label={title}>
            <div className='w-[90px] md:w-[120px] aspect-[3/4] bg-base-300 rounded'>
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  loading='lazy'
                  className='w-full h-full object-cover'
                />
              ) : null}
            </div>
          </Link>
        </div>
        <div>
          <Link to={detailsHref} className='card-title leading-snug'>
            {title}
          </Link>
          {authors ? (
            <p className='opacity-80 mb-2'>by {authors.join(", ")}</p>
          ) : null}
          {description ? (
            <p className='opacity-80 line-clamp-3'>{description}</p>
          ) : null}
          <div className='card-actions justify-end mt-4'>
            {infoLink ? (
              <a
                href={infoLink}
                target='_blank'
                rel='noreferrer'
                className='btn btn-outline btn-sm'>
                <FaExternalLinkAlt className='mr-2' /> More info
              </a>
            ) : null}
            {saved ? (
              <button className='btn btn-error btn-sm' onClick={handleDelete}>
                <FaTrash className='mr-2' /> Delete
              </button>
            ) : (
              <button className='btn btn-secondary btn-sm' onClick={handleSave}>
                <FaBookmark className='mr-2' /> Save
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(BookItem);
