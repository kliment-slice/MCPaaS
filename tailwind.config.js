/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#030812',  // Darkest blue
          800: '#020764',  // Deep blue
          700: '#043780',  // Medium blue
          600: '#025EC4',  // Bright blue
          500: '#0ECED0',  // Cyan/Turquoise
        }
      }
    },
  },
  plugins: [],
} 