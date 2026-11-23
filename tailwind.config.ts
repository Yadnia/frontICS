import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta Institucional: Azul, Amarillo y Blanco
        // Mapeo de indigo a azul para armonizar automáticamente componentes existentes
        indigo: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8", // Azul principal
          700: "#1e40af", // Azul marino medio
          800: "#1e3a8a", // Azul marino profundo
          900: "#172554", // Azul noche
          950: "#0a1628", // Azul oscuro base
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
          950: "#0a1628",
        },
        // Amarillo / Dorado Institucional
        yellow: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15", // Amarillo brillante
          500: "#eab308", // Amarillo oro
          600: "#ca8a04", // Dorado intenso
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
          950: "#422006",
        },
        gold: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        sidebar: {
          bg: "#0a1628", // Azul marino oscuro
          hover: "#142540",
          active: "#1d4ed8",
          border: "#172b4d",
          text: "#93c5fd",
          textActive: "#ffffff",
          accent: "#facc15", // Amarillo brillante
        },
      },
    },
  },
  plugins: [],
};
export default config;
