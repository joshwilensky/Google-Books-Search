import React, { memo } from "react";
import { FaExternalLinkAlt, FaBookmark, FaTrash } from "react-icons/fa";

function BookItem({ book, onSave, onDelete, saved, variant = "grid" }) {
  const info = (book && book.volumeInfo) || {};
  const title = info.title || "Untitled";
  const authors = info.authors || null;
  const description = info.description || "";
  const infoLink = info.infoLink || "";
  const imageLinks = info.imageLinks || null;
  const thumb =
    imageLinks && imageLinks.thumbnail ? imageLinks.thumbnail : null;

  const handleSave = () => onSave && onSave(book);
  const handleDelete = () => onDelete && onDelete(book);

  if (variant === "grid") {
    return (
      <article className='card bg-base-100 shadow-soft card-hover h-full'>
        <figure className='p-4'>
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
        </figure>
        <div className='card-body'>
          <h3 className='card-title text-base md:text-lg'>{title}</h3>
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

  // list
  return (
    <article className='card bg-base-100 shadow-soft card-hover'>
      <div className='card-body grid gap-4 md:grid-cols-[120px_1fr]'>
        <div className='rounded overflow-hidden'>
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
        </div>
        <div>
          <h3 className='card-title leading-snug'>{title}</h3>
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
                <FaExternalLinkAlt className='mr-2' /> View
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
