import React from "react";
import { createContext, useReducer } from "react";
import booksReducer from "./BooksReducer";

const BooksContext = createContext();

export const BooksProvider = ({ children }) => {
  const initial = { results: [], saved: [], loading: false, error: null };
  const [state, dispatch] = useReducer(booksReducer, initial);
  return (
    <BooksContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BooksContext.Provider>
  );
};

export default BooksContext;
