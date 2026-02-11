/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores da marca GS Transportes
        "gs-orange": {
          50: "#FFF5F0",
          100: "#FFE8DB",
          200: "#FFD1B8",
          300: "#FFB394",
          400: "#FF8A5C",
          500: "#FF6B35", // Laranja principal
          600: "#E64E1A",
          700: "#C23B0F",
          800: "#992F0C",
          900: "#732309",
        },
        "gs-black": {
          DEFAULT: "#1F1F1F",
          light: "#2E2E2E",
          dark: "#0A0A0A",
        },
        "gs-gray": {
          50: "#F9F9F9",
          100: "#F0F0F0",
          200: "#E0E0E0",
          300: "#C0C0C0",
          400: "#A0A0A0",
          500: "#808080",
          600: "#606060",
          700: "#404040",
          800: "#2A2A2A",
          900: "#1A1A1A",
        },
        // Alias para facilitar uso
        primary: {
          50: "#FFF5F0",
          100: "#FFE8DB",
          200: "#FFD1B8",
          300: "#FFB394",
          400: "#FF8A5C",
          500: "#FF6B35",
          600: "#E64E1A",
          700: "#C23B0F",
          800: "#992F0C",
          900: "#732309",
        },
      },
    },
  },
  plugins: [],
};
