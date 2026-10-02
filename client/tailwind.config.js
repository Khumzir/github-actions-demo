/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep green + gold African premium palette
        brand: {
          50: '#f0f7f4',
          100: '#dcebe2',
          200: '#b8d6c5',
          300: '#8bb9a3',
          400: '#5e9a7e',
          500: '#3d7d61',
          600: '#2a6450',
          700: '#1e4f3f',
          800: '#163d31',
          900: '#0f2a23',
          950: '#0a1d17',
        },
        gold: {
          50: '#fdfaeb',
          100: '#faf0cb',
          200: '#f5e093',
          300: '#efc94a',
          400: '#ebb627',
          500: '#d99a18',
          600: '#bb7510',
          700: '#955411',
          800: '#7b4214',
          900: '#683714',
        },
        cream: '#f8f5ee',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
