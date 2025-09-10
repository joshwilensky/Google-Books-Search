import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import BookDetails from "./pages/BookDetails";
import Saved from "./pages/Saved";
import { ThemeProvider } from "./context/theme/ThemeContext";

function NotFound() {
  return (
    <main className='page-wrap max-w-3xl'>
      <h1 className='text-2xl font-bold mb-2'>Page not found</h1>
      <p className='opacity-70'>Try the search page.</p>
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/search' element={<Home />} />
            <Route path='/book/:id' element={<BookDetails />} />
            <Route path='/saved' element={<Saved />} />
            <Route path='/home' element={<Navigate to='/' replace />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
