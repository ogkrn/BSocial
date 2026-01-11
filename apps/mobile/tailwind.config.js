/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fc',
          400: '#8093f8',
          500: '#667eea',
          600: '#5162df',
          700: '#4350c4',
          800: '#38439e',
          900: '#333c7d',
        },
      },
    },
  },
  plugins: [],
};
