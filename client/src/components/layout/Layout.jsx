import React, { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import ThemePicker from "./ThemePicker";
import { listSaved } from "../../context/books/BooksActions";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSavedPage = pathname.startsWith("/saved");
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const data = await listSaved();
      setCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    // initial + on route change (so it's fresh when you land on /search)
    refreshCount();
  }, [refreshCount, pathname]);

  useEffect(() => {
    // Update when other code saves/deletes (same-tab custom event + cross-tab storage)
    const onChanged = () => refreshCount();
    window.addEventListener("gbs:saved-changed", onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("gbs:saved-changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, [refreshCount]);

  return (
    <>
      <div className='navbar bg-base-300'>
        <div className='container mx-auto px-3'>
          <div className='flex-1'>
            <Link className='text-lg font-semibold' to='/'>
              Google Books
            </Link>
          </div>

          <div className='flex-none flex items-center gap-2'>
            {/* Conditional nav */}
            {isSavedPage ? (
              <button
                className='btn btn-ghost btn-sm'
                onClick={() => navigate("/search")}>
                Search
              </button>
            ) : (
              <Link className='btn btn-ghost btn-sm' to='/saved'>
                Saved
                <span className='badge badge-primary ml-2'>{count}</span>
              </Link>
            )}
            <ThemePicker />
          </div>
        </div>
      </div>

      <div className='min-h-screen bg-base-200'>
        <Outlet />
      </div>
    </>
  );
}
