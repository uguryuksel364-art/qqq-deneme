/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          950: 'rgb(var(--color-ink-950) / <alpha-value>)',
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
        },
        aegean: {
          DEFAULT: '#123A54',
          600: '#123A54',
          500: '#1A4D6E',
          400: '#2A6A92',
        },
        teal: {
          DEFAULT: '#4FA9A8',
          500: '#4FA9A8',
          400: '#6FBFBE',
          300: '#8FC9C8',
        },
        sand: {
          DEFAULT: '#E8DCC8',
          200: '#E8DCC8',
          100: '#F0E8D9',
        },
        brass: {
          DEFAULT: '#C9A15A',
          light: '#E5C98F',
          dark: '#B89148',
          600: '#B89148',
          400: '#D9B878',
        },
        foam: {
          DEFAULT: 'rgb(var(--color-foam) / <alpha-value>)',
          100: 'rgb(var(--color-foam-100) / <alpha-value>)',
          200: 'rgb(var(--color-foam-200) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.28em',
      },
      keyframes: {
        waveDrift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        waveDrift: 'waveDrift 28s linear infinite',
        fadeUp: 'fadeUp 0.9s ease-out both',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
