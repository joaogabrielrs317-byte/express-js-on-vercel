/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f9f9f9',
          100: '#efefef',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#989898',
          500: '#7a7a7a',
          600: '#5e5e5e',
          700: '#444444',
          800: '#2e2e2e',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        paper: '#faf9f7',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: '"Lora", Georgia, serif',
            fontSize: '1.125rem',
            lineHeight: '1.8',
            color: '#1a1a1a',
          },
        },
      },
    },
  },
  plugins: [],
}
