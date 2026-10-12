/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        karategi: '#FFFFFF',
        tatami: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Color suave y atractivo para la interfaz y esquina AKA (Coral Marcial suave, no vino)
        aka: {
          light: '#FFE4E6',
          DEFAULT: '#E11D48', // Coral / Rose suave y moderno
          dark: '#BE123C',
          hover: '#F43F5E',
        },
        // Esquina AO oficial
        ao: {
          light: '#DBEAFE',
          DEFAULT: '#2563EB', // Azul zafiro moderno
          dark: '#1D4ED8',
          hover: '#3B82F6',
        },
        // Tonos de Cerezo Sakura
        sakura: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F472B6',
          DEFAULT: '#EC4899',
        },
        bushido: {
          gold: '#D97706',
          silver: '#64748B',
          bronze: '#B45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
