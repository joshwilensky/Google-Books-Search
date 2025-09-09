import React from "react";
export function SkeletonBookCard() {
  return (
    <div className='card shadow bg-base-100 animate-pulse'>
      <div className='card-body flex gap-4'>
        <div className='w-20 h-28 bg-base-300 rounded' />
        <div className='flex-1'>
          <div className='h-4 w-56 bg-base-300 rounded mb-2' />
          <div className='h-3 w-40 bg-base-300 rounded mb-2' />
          <div className='h-3 w-64 bg-base-300 rounded' />
        </div>
      </div>
    </div>
  );
}
