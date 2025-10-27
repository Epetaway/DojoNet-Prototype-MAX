
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E11D48',
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#500724',
        },
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,0.08)',
        'soft-lg': '0 14px 40px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
      },
    },
  },
  plugins: [],
}
