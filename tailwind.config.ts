import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        afdb: {
          green: '#009A44',
          'green-dark': '#007A35',
          'green-light': '#E8F5E9',
          gold: '#F5A623',
          'gold-dark': '#D4891A',
          navy: '#002B5C',
          'navy-light': '#003D82',
          gray: '#F7F8FA',
          'gray-dark': '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
