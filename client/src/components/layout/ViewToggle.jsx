import React from "react";
import { FiGrid, FiList } from "react-icons/fi";

/**
 * Accessible, controlled toggle using native radios.
 * value: "grid" | "list"
 */
export default function ViewToggle({ value = "grid", onChange }) {
  const v = value === "list" ? "list" : "grid";

  function set(val) {
    if (onChange) onChange(val);
  }

  return (
    <div
      className='flex items-center gap-2'
      role='radiogroup'
      aria-label='Change view'>
      <input
        id='view-grid'
        type='radio'
        name='view'
        className='hidden'
        checked={v === "grid"}
        onChange={() => set("grid")}
      />
      <label
        htmlFor='view-grid'
        className={`btn btn-sm ${v === "grid" ? "btn-primary" : "btn-ghost"}`}
        role='radio'
        aria-checked={v === "grid"}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && set("grid")}>
        <FiGrid className='mr-2' /> Grid
      </label>

      <input
        id='view-list'
        type='radio'
        name='view'
        className='hidden'
        checked={v === "list"}
        onChange={() => set("list")}
      />
      <label
        htmlFor='view-list'
        className={`btn btn-sm ${v === "list" ? "btn-primary" : "btn-ghost"}`}
        role='radio'
        aria-checked={v === "list"}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && set("list")}>
        <FiList className='mr-2' /> List
      </label>
    </div>
  );
}
