/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Booking.com palette
        bcom: {
          navy: '#003580',
          blue: '#0071c2',
          'blue-dark': '#005999',
          'blue-light': '#ebf3ff',
          yellow: '#febb02',
          green: '#008009',
          'green-light': '#e8f5e9',
          gray: '#f2f2f2',
          border: '#e7e7e7',
          text: '#333333',
          muted: '#6b6b6b',
          red: '#c00',
        },
        // Keep legacy aliases used in bookings.js
        pine: '#008009',
        sky: '#0071c2',
        ocean: '#0071c2',
        ink: '#003580',
        stone: '#6b6b6b',
        sand: '#f2f2f2',
        mist: '#ebf3ff',
        gold: '#febb02',
      },
      boxShadow: {
        panel: '0 2px 8px rgba(0,0,0,0.12)',
        card: '0 1px 4px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        bcom: '4px',
      },
    },
  },
  plugins: [],
};
