/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trackit: {
          background: '#020617',
          surface: '#020617',
          surfaceAlt: '#020617',
          foreground: '#0f172a',
          muted: '#64748b',
          border: '#1e293b',
          accent: '#22c55e',
          accentSoft: '#bbf7d0',
          accentMuted: '#14532d',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'fade-up': 'fade-up 700ms ease-out forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

