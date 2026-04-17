/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,svelte}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          accent: '#10b981', // Emerald 500
          alert: '#ef4444',  // Red 500
          text: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}