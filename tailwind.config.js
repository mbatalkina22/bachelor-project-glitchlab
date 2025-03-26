/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        arial: ['Arial', 'sans-serif'],
        secularone: ['var(--font-secular-one)'],
      },
    },
  },
  plugins: [],
  safelist: [],
} 