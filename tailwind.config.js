/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,json}'],
  content: [],
  theme: {
    extend: {},
    fontSize: {
      sm: '0.6rem',
      base: '0.75rem',
      lg: '0.9375rem',
      'xl': '1.17225rem',
      '2xl': '1.46475rem',
      '3xl': '1.83075rem',
      '4xl': '2.289rem',
    }
  },
  plugins: [],
}
