/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        neon: {
          pink: '#ff007f', // This specific hex code is important
          purple: '#7e22ce',
          dark: '#050505',
        },
      },
      // Make sure this dropShadow is defined for the glowing effects
      dropShadow: {
        glow: "0 0 15px rgba(255, 0, 127, 0.5)",
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite', // Ensure shimmer is here
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: { // Keyframe for the button shine
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}