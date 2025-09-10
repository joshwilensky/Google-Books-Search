/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)",
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"), // for prose styles (optional but installed)
    require("@tailwindcss/line-clamp"), // you use line-clamp-* in the UI
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
