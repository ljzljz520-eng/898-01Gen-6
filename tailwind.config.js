/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        'charcoal': {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#b3b3b3',
          300: '#808080',
          400: '#4d4d4d',
          500: '#333333',
          600: '#262626',
          700: '#1f1f1f',
          800: '#1a1a1a',
          900: '#0d0d0d',
        },
        'gold': {
          50: '#fdf9ef',
          100: '#faf0d7',
          200: '#f4e0af',
          300: '#edca7d',
          400: '#e6b44b',
          500: '#d4af37',
          600: '#b8942c',
          700: '#967623',
          800: '#745a1a',
          900: '#523f12',
        },
        'cream': {
          50: '#fefcf8',
          100: '#fdf9ef',
          200: '#faf0d7',
          300: '#f5f0e6',
          400: '#e8e0d0',
          500: '#d4cbb8',
          600: '#b8a88a',
          700: '#968567',
          800: '#746348',
          900: '#52432d',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.4s ease-out forwards',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
