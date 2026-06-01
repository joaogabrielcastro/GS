/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        "gs-orange": {
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
        "gs-black": {
          DEFAULT: "#1F1F1F",
          light: "#2E2E2E",
          dark: "#0A0A0A",
        },
        "gs-gray": {
          50: "#F7F7F8",
          100: "#EEEEF0",
          200: "#DCDCE0",
          300: "#B8B8BE",
          400: "#94949C",
          500: "#707078",
          600: "#52525A",
          700: "#3A3A42",
          800: "#252528",
          900: "#141416",
        },
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
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        elevated: "0 8px 30px rgba(15, 23, 42, 0.12)",
        soft: "0 2px 8px rgba(15, 23, 42, 0.06)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
