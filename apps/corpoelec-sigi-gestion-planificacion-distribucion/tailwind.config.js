/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corpoelec: {
          dark: "#0a192f",
          card: "#112240",
          accent: "#00f2fe",
          gold: "#ffd700",
          secondary: "#1e293b",
          border: "rgba(0, 242, 254, 0.15)",
        }
      }
    },
  },
  plugins: [],
}
