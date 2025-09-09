import React from "react";
import { FiBookOpen } from "react-icons/fi";

export default function EmptyState({
  title = "No results",
  subtitle = "Try a different search or keyword.",
}) {
  return (
    <div className='text-center py-16 rounded-2xl border border-base-300 bg-base-100'>
      <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-base-200 mb-3'>
        <FiBookOpen className='text-2xl opacity-70' />
      </div>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <p className='opacity-70'>{subtitle}</p>
    </div>
  );
}
