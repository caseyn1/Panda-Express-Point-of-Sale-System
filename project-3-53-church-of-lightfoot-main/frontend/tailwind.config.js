/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          bounceCustom: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-23px)' }, // Adjust the `-50px` for bounce height
          },
        },
        animation: {
          bounceCustom: 'bounceCustom 2s',
        },
      },
    },
    plugins: [],
  }