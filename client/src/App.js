import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Saved from "./pages/Saved";
import { BooksProvider } from "./context/books/BooksContext";
import './index.css'

function NotFound() {
  return (
    <div className='text-center p-10'>
      <h2 className='text-2xl font-semibold mb-2'>Page not found</h2>
      <Link to='/' className='link'>
        Go home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BooksProvider>
      <Router>
        <div className='min-h-screen bg-base-200'>
          <Navbar />
          <main className='page-wrap'>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/saved' component={Saved} />
              <Route path='*' component={NotFound} />
            </Switch>
          </main>
        </div>
      </Router>
    </BooksProvider>
  );
}
