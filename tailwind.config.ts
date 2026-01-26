import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta minimalista y cálida para el diario
        primary: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dfd0',
          300: '#d4c4a8',
          400: '#bfa67e',
          500: '#a68a5b',
          600: '#8a6d47',
          700: '#6e553a',
          800: '#5a4532',
          900: '#4a3a2c',
        },
        accent: {
          trabajo: '#3b82f6',
          aprendizaje: '#8b5cf6',
          salud: '#10b981',
          'gestion-cultural': '#f59e0b',
          ocio: '#ec4899',
          creacion: '#06b6d4',
          amistades: '#f97316',
          familia: '#ef4444',
          entorno: '#84cc16',
          finanzas: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
