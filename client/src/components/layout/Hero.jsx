import React from "react";

export default function Hero() {
  return (
    <section className='relative overflow-hidden rounded-2xl p-10 mb-8 bg-gradient-to-br from-primary/20 via-base-100 to-base-200'>
      <div className='relative z-10 max-w-3xl'>
        <h1 className='text-3xl md:text-4xl font-extrabold leading-tight'>
          Discover your next favorite <span className='text-primary'>book</span>
          .
        </h1>
        <p className='mt-2 opacity-80'>
          Search millions of titles. Save the ones you love. Read smarter.
        </p>
      </div>
      {/* soft halo */}
      <div className='pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl' />
    </section>
  );
}
