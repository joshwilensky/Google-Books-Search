/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", lg: "2rem" } },
    extend: {
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake", "forest", "corporate", "dracula"],
  },
};
