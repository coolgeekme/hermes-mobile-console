/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06080b',
        panel: '#0a0d13',
        card: '#11161f',
        border: '#1e2630',
        cyan: '#22d3ee',
        purple: '#a855f7',
        green: '#34d399',
        blue: '#38bdf8',
        orange: '#f59750',
        muted: '#7d8a9c',
      },
    },
  },
  plugins: [],
}
