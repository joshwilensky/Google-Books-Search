import React from "react";
import { FaExternalLinkAlt, FaBookmark, FaTrash } from "react-icons/fa";

export default function BookItem({ book, onSave, onDelete, saved }) {
  const volumeInfo = (book && book.volumeInfo) || {};
  const title = volumeInfo.title || "Untitled";
  const authors = volumeInfo.authors || null;
  const description = volumeInfo.description || "";
  const infoLink = volumeInfo.infoLink || "";
  const imageLinks = volumeInfo.imageLinks || null;
  const thumb =
    imageLinks && imageLinks.thumbnail ? imageLinks.thumbnail : null;

  const handleSave = () => {
    if (onSave) onSave(book);
  };
  const handleDelete = () => {
    if (onDelete) onDelete(book);
  };

  return (
    <div className='card bg-base-100 shadow hover:shadow-lg transition'>
      <div className='card-body md:flex md:gap-4'>
        <div className='flex-shrink-0 mb-4 md:mb-0'>
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              className='w-24 h-32 object-cover rounded'
            />
          ) : (
            <div className='w-24 h-32 bg-base-200 rounded' />
          )}
        </div>

        <div className='flex-1'>
          <h3 className='card-title'>{title}</h3>
          {authors && (
            <p className='opacity-80 mb-2'>by {authors.join(", ")}</p>
          )}
          {description && (
            <p className='opacity-80 line-clamp-3'>{description}</p>
          )}

          <div className='card-actions justify-end mt-4'>
            {infoLink && (
              <a
                href={infoLink}
                target='_blank'
                rel='noreferrer'
                className='btn btn-outline btn-sm'>
                <FaExternalLinkAlt className='mr-2' /> View
              </a>
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
      </div>
    </div>
  );
}
