/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  // 1. Habilita o modo escuro via classe (fundamental para o toggle funcionar)
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Registrando a animação (Mantido)
      animation: {
        blob: "blob 7s infinite",
      },
      // Definindo os movimentos (Mantido)
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [
    // Plugin manual para delay (Mantido)
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      });
    }),
  ],
}