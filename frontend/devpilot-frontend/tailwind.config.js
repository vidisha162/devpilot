/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0e1a',
          800: '#0d1224',
          700: '#111827',
          600: '#1a2332',
        },
        neon: {
          green: '#00ff88',
          blue: '#00d4ff',
          purple: '#7c3aed',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff88' },
          '100%': { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
        }
      }
    },
  },
  plugins: [],
}