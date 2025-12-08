/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Resting Rainbow color palette
        'rr-navy': '#040c30',
        'rr-navy-light': '#121c52',
        'rr-blue': '#0a97cd',
        'rr-pink': '#f84265',
        'rr-gray': '#636a86',
        'rr-gray-light': '#9ca4c7',
        'rr-cream': '#f9f9fb',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
