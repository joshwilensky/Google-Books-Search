import React, { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const THEMES = ["light", "dark", "cupcake", "forest", "corporate", "dracula"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <label tabIndex={0} className='btn btn-ghost gap-2'>
        {theme === "dark" ? <FiMoon /> : <FiSun />}
        <span className='hidden sm:inline'>Theme</span>
      </label>
      <ul
        tabIndex={0}
        className='dropdown-content menu menu-sm p-2 shadow-xl bg-base-100 rounded-box w-44'>
        {THEMES.map((t) => (
          <li key={t}>
            <button
              className={t === theme ? "active" : ""}
              onClick={() => setTheme(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
