/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'text-select': 'textSelect 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'char-bounce': 'charBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        textSelect: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1.2) translateX(-50%) translateY(-50%)', opacity: '1' },
        },
        charBounce: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-8px) scale(1.2)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
