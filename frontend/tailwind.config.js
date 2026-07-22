/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Serene Light Mode Pantone Pink Palette
        "background": "#FAF8F5",
        "surface": "#FFFFFF",
        "surface-container": "#F5F1EB",
        "surface-container-high": "#EBE5DD",
        "surface-container-highest": "#E2DAD0",
        "surface-container-low": "#FAF6F1",
        "surface-container-lowest": "#FFFFFF",
        "surface-variant": "#F3EBE6",

        "primary": "#8C3252",            // Rich Pantone Berry
        "primary-container": "#8C3252",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#E47A9D",

        "secondary": "#E47A9D",          // Pantone Pink Carnation
        "secondary-container": "#FDF0F5",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#8C3252",

        "tertiary": "#C85A7E",           // Deep Rose
        "tertiary-container": "#FBE6EF",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#8C3252",

        "on-surface": "#1D1C1E",         // Deep charcoal text
        "on-surface-variant": "#6E6B73", // Soft slate muted text
        "on-background": "#1D1C1E",

        "outline": "#D1C9CF",
        "outline-variant": "#E6DFE4",

        "error": "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#410002",

        "pantone-pink": "#E47A9D",
        "pantone-rose": "#C85A7E",
        "pantone-berry": "#8C3252",
        "pantone-686": "#D0A1BA",
        "pink-soft": "#FDF0F5",
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Outfit',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        outfit: ['Outfit', '-apple-system', 'sans-serif'],
        sf: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
      },
      boxShadow: {
        'pink-soft': '0 8px 30px rgba(228, 122, 157, 0.15)',
        'pink-glow': '0 0 25px rgba(228, 122, 157, 0.25)',
        'card-glass': '0 8px 32px rgba(140, 50, 82, 0.08)',
      },
    },
  },
  plugins: [],
};
