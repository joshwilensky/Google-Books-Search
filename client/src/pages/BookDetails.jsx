import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooksClient, saveBook } from "../context/books/BooksActions";
import { FaArrowLeft, FaExternalLinkAlt, FaBookmark } from "react-icons/fa";

function stripTags(s) {
  try {
    return String(s).replace(/<\/?[^>]+>/g, "");
  } catch {
    return "";
  }
}

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useMemo(() => createBooksClient(), []);

  const [vol, setVol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const data = await client.getById(id);
        if (!alive) return;
        setVol(data || null);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load book.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [client, id]);

  if (loading) {
    return (
      <div className='page-wrap max-w-3xl'>
        <div className='skeleton h-10 w-40 mb-4' />
        <div className='card bg-base-100 shadow-soft'>
          <div className='card-body'>
            <div className='skeleton h-6 w-2/3 mb-3' />
            <div className='skeleton h-4 w-1/2 mb-6' />
            <div className='skeleton h-72 w-full' />
          </div>
        </div>
      </div>
    );
  }

  if (err || !vol) {
    return (
      <div className='page-wrap max-w-3xl'>
        <Link to='/' className='btn btn-ghost mb-4'>
          <FaArrowLeft /> <span className='ml-2'>Back</span>
        </Link>
        <div className='alert alert-error'>
          <span>{err || "Book not found."}</span>
        </div>
      </div>
    );
  }

  const v = vol.volumeInfo || {};
  const cover =
    (v.imageLinks &&
      (v.imageLinks.thumbnail ||
        v.imageLinks.small ||
        v.imageLinks.smallThumbnail)) ||
    "";
  const title = v.title || "Untitled";
  const authors = Array.isArray(v.authors) ? v.authors : [];
  const desc = v.description ? stripTags(v.description) : "";
  const categories = Array.isArray(v.categories) ? v.categories : [];
  const published = v.publishedDate || "";
  const publisher = v.publisher || "";
  const pageCount = v.pageCount || null;
  const infoLink = v.infoLink || vol.selfLink || "";
  const previewLink = v.previewLink || "";

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveBook({
        volumeId: vol.id,
        title,
        authors,
        image: cover,
        infoLink: infoLink || previewLink || "",
        description: desc,
      });
      navigate("/saved");
    } catch {
      // optionally show an alert/toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='page-wrap max-w-3xl'>
      <Link to='/' className='btn btn-ghost mb-4'>
        <FaArrowLeft /> <span className='ml-2'>Back</span>
      </Link>

      <div className='card bg-base-100 shadow-soft'>
        <div className='card-body grid gap-6 md:grid-cols-[220px_1fr]'>
          <div className='rounded overflow-hidden'>
            <div className='w-[200px] md:w-[220px] aspect-[3/4] bg-base-300 rounded'>
              {cover ? (
                <img
                  src={cover}
                  alt={title}
                  className='w-full h-full object-cover'
                />
              ) : null}
            </div>
          </div>

          <div>
            <h1 className='text-2xl md:text-3xl font-extrabold leading-tight'>
              {title}
            </h1>
            {authors.length ? (
              <p className='opacity-80 mb-2'>by {authors.join(", ")}</p>
            ) : null}

            <div className='flex flex-wrap gap-2 my-3'>
              {categories.map((c) => (
                <span key={c} className='badge badge-outline'>
                  {c}
                </span>
              ))}
              {published ? (
                <span className='badge badge-ghost'>
                  Published: {published}
                </span>
              ) : null}
              {publisher ? (
                <span className='badge badge-ghost'>
                  Publisher: {publisher}
                </span>
              ) : null}
              {pageCount ? (
                <span className='badge badge-ghost'>{pageCount} pages</span>
              ) : null}
            </div>

            {desc ? (
              <p className='opacity-90 whitespace-pre-line'>{desc}</p>
            ) : null}

            <div className='card-actions mt-6'>
              {infoLink ? (
                <a
                  href={infoLink}
                  target='_blank'
                  rel='noreferrer'
                  className='btn btn-outline'>
                  <FaExternalLinkAlt className='mr-2' /> More info
                </a>
              ) : null}
              {previewLink ? (
                <a
                  href={previewLink}
                  target='_blank'
                  rel='noreferrer'
                  className='btn btn-outline'>
                  Preview
                </a>
              ) : null}
              <button
                className='btn btn-secondary'
                onClick={handleSave}
                disabled={saving}>
                <FaBookmark className='mr-2' /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
