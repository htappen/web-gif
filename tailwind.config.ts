import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#f7efff',
          100: '#ecd9ff',
          200: '#d6b4ff',
          300: '#be8aff',
          400: '#a265f5',
          500: '#8547d9',
          600: '#6932af',
          700: '#4d2383',
          800: '#321755',
          900: '#1c0d31',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 50px rgba(17, 7, 37, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
