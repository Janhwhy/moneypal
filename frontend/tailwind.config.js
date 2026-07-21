/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#1c1c1e',
          active: '#2c2c2e',
          card: '#0c0c0e'
        },
        accent: {
          teal: '#5AC8C8',
          yellow: '#F5D742',
          red: '#FF453A'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"SF Pro Display"',
          '"SF Pro Text"'
        ],
      }
    },
  },
  plugins: [],
}
