/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core brand — deep indigo reads as modern & trustworthy without
        // leaning on the generic AI-default terracotta/cream palette.
        ink: {
          DEFAULT: '#12181F',
          soft: '#2B3543',
        },
        indigo: {
          50: '#EEF2F8',
          100: '#D6E0EE',
          300: '#8FA6C4',
          500: '#3D5A82',
          700: '#24344D',
          900: '#141D2B',
        },
        // Warm gold accent — used sparingly for calls to action & highlights.
        // Distinct from the cliché terracotta (#D97757).
        gold: {
          100: '#FBEBD0',
          300: '#F0C578',
          500: '#E8A33D',
          700: '#B87A20',
        },
        leaf: { 500: '#3F7D58', 100: '#DEEFE3' }, // success / growth
        clay: { 500: '#C1483B', 100: '#F8E2DF' }, // errors / alerts
        surface: {
          DEFAULT: '#F5F6F8',
          dark: '#0F141B',
        },
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}
