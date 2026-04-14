/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            tactical: {
                900: '#0f172a',
                800: '#1e293b',
                700: '#334155',
                accent: '#10b981',
                alert: '#ef4444',
                text: '#f8fafc'
            }
        },
        fontFamily: {
            mono: ['Courier New', 'monospace'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
        }
    },
  },
  plugins: [],
}
