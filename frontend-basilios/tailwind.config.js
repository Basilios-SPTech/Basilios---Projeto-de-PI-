/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        // (opcional) se quiser nomear tokens de sombra
      },
      screens: {
        max820: {'max':'820px'}, // espelha @media (max-width: 820px)
        max560: {'max':'560px'}  // espelha @media (max-width: 560px)
      },
      fontFamily: {
        sans: ['Montserrat','ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Arial','sans-serif']
      }
    }
  },
  safelist: [
    // Garante que utilitárias com valores arbitrários não sejam purgadas
    { pattern: /(?:\[.*\]|text-\[.*\]|bg-\[.*\]|shadow-\[.*\]|ring-\[.*\]|max-w-\[.*\]|rounded-\[.*\])/ },
  ]
}
