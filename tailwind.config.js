/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'custom-1': '248px',
        'custom-2': '324px',
        'custom-3': '970px'
      },
      maxHeight: {
        'custom-1': '248px',
      },
      padding: {
        '18': '4.5rem'
      },
      margin: {
        '0.5': '2px'
      },
      height: {
        '404': '404px',
        '33': '33px',
        '580': '550px',
        '452': '452px'
      },
      borderWidth: {
        '1': '1px',
        '1.5': '1.5px'
      },
      borderRadius: {
        '10': '10px'
      },
      width: {
        '138': '138px',
        '18': '4.5rem',
        '970': '970px',
        '298': '298px'
      }
    },
    colors: {
      'white': '#FFFFFF',
      'dirty-white': '#F6F5FF',
      'dirty-purple': '#363445',
      'dirty-input': '#9890E3',
      'dirty-btn-p': '#9DFF9B',
      'dirty-ph': '#A9A9A9',
      'dirty-error': '#FF5353',
      'dirty-stroke': '#3A3A3A',
      'dirty-disabled': '#DDFFDC'
    },
    fontFamily: {
      'roboto': ['roboto'],
      'lavanda': ['lavanda']
    }
  },
  plugins: [
    // ...
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}