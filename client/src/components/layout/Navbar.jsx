import React from "react";
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className='navbar glass sticky top-0 z-50'>
      <div className='container mx-auto px-3'>
        <div className='flex-1'>
          <Link to='/' className='btn btn-ghost normal-case text-xl gap-2'>
            <FaBookOpen className='text-2xl' />
            Google Books Search
          </Link>
        </div>
        <div className='flex-none gap-2'>
          <Link to='/saved' className='btn btn-ghost hidden sm:inline-flex'>
            Saved
          </Link>
          {/* right aligned dropdown */}
          <div className='dropdown dropdown-end'>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
