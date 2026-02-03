/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#856aad',
          50: '#f5f3f7',
          100: '#ebe6ef',
          200: '#d7cde0',
          300: '#c3b4d0',
          400: '#9c82be',
          500: '#856aad',
          600: '#6d5591',
          700: '#574375',
          800: '#41325a',
          900: '#2b213e',
        },
        dark: {
          DEFAULT: '#000000',
          50: '#1a1a1a',
          100: '#0d0d0d',
          200: '#000000',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}