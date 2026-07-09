/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        anchor: '#7c3aed',
        snf: '#0ea5e9',
        hospital: '#ef4444'
      }
    }
  },
  plugins: []
}
