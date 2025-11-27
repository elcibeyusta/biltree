/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bilkent: {
          blue: '#003366',
          gold: '#FFD700',
        },
        yildiz: {
          dark: '#0a0a0a', // Very dark background
          gold: '#FFD700', // Gold for text
          red: '#DC2626', // Christmas red
          green: '#16A34A', // Christmas green
          snow: '#F8FAFC', // Snow white
        },
        christmas: {
          red: '#DC2626',
          green: '#16A34A',
          gold: '#FFD700',
          dark: '#0a0a0a',
          snow: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'snow': 'snow 10s linear infinite',
        'snow-delayed': 'snow 15s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        snow: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
