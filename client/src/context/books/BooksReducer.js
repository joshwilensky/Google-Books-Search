const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_RESULTS":
      return { ...state, loading: false, results: action.payload };
    case "SET_SAVED":
      return { ...state, loading: false, saved: action.payload };
    default:
      return state;
  }
};
export default reducer;
