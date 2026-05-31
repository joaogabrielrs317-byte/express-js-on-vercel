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
          50: '#f7f6f3',
          100: '#edeae3',
          200: '#d8d3c7',
          300: '#bcb5a4',
          400: '#9d9280',
          500: '#857868',
          600: '#6e6255',
          700: '#5a5047',
          800: '#4a423b',
          900: '#3e3832',
          950: '#1a1714',
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
            color: '#3e3832',
          },
        },
      },
    },
  },
  plugins: [],
}
