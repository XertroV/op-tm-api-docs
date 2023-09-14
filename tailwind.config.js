/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,json}'],
  content: [],
  theme: {
    extend: {},
    fontSize: {
      sm: '0.6rem',
      base: '0.75rem',
      xl: '0.9375rem',
      '2xl': '1.17225rem',
      '3xl': '1.46475rem',
      '4xl': '1.83075rem',
      '5xl': '2.289rem',
    }
  },
  plugins: [],
}
