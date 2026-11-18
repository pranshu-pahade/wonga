/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: { DEFAULT: '#66887B', dark: '#3F6052' },
        mint: { DEFAULT: '#92E3A9', soft: '#D9F5E0' },
        deep: '#12241D',
        forest: '#1C3A2E',
        paper: '#F5F8F2',
        card: '#FCFDFA',
        line: '#D5E2D8',
        muted: '#55655C',
        haze: '#BFD8CB',
      },
      fontFamily: {
        display: ['Fredoka', 'Trebuchet MS', 'sans-serif'],
        sans: ['"Nunito Sans"', 'Arial', 'sans-serif'],
      },
      keyframes: {
        sheet: { from: { transform: 'translateY(40px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        toast: { from: { transform: 'translateY(-16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pop: { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.22)' }, '100%': { transform: 'scale(1)' } },
        rise: { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        sheet: 'sheet 0.24s ease-out',
        toast: 'toast 0.22s ease-out',
        pop: 'pop 0.32s ease-out',
        rise: 'rise 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
