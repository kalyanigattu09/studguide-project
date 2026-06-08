/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#09090b",
        darkCard: "rgba(24, 24, 27, 0.75)",
        darkBorder: "rgba(255, 255, 255, 0.08)",
        lightBg: "#fafafa",
        lightCard: "rgba(255, 255, 255, 0.8)",
        lightBorder: "rgba(0, 0, 0, 0.06)",
        accentCyan: "#06b6d4",
        accentIndigo: "#6366f1",
        accentViolet: "#8b5cf6"
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
