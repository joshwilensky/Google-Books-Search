import React from "react";
import { useTheme } from "../../context/theme/ThemeContext";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "garden",
  "dracula",
];

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <label className='flex items-center gap-2'>
      <span className='text-sm opacity-70 hidden md:inline'>Theme</span>
      <select
        className='select select-sm select-bordered'
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        aria-label='Change theme'>
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
