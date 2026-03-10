/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'space': '#020617',
        'cyan-glow': '#00D8FF',
        'glass': 'rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0,216,255,0.3), 0 0 40px rgba(0,216,255,0.1)',
        'cyan-glow-lg': '0 0 30px rgba(0,216,255,0.5), 0 0 60px rgba(0,216,255,0.2)',
      },
    },
  },
  plugins: [],
};
