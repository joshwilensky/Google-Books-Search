import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className='navbar bg-base-100 shadow'>
      <div className='container mx-auto px-3'>
        <div className='flex-1'>
          <Link to='/' className='btn btn-ghost normal-case text-xl'>
            Google Books
          </Link>
        </div>
        <div className='flex-none'>
          <ul className='menu menu-horizontal px-1'>
            <li>
              <Link to='/'>Search</Link>
            </li>
            {/* <li><Link to="/saved">Saved</Link></li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
