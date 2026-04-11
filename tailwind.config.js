/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006972',
          dark: '#005c64',
          light: '#73ccd6',
          container: '#e9fdff',
        },
        secondary: {
          DEFAULT: '#38647d',
          container: '#c5e7ff',
        },
        surface: {
          DEFAULT: '#f8fafb',
          dim: '#d4dbde',
          container: '#f0f4f6',
          lowest: '#ffffff',
        }
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
