import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2fbff",
          100: "#dff4ff",
          200: "#b8e8ff",
          300: "#81d7ff",
          400: "#3fbdf8",
          500: "#1ea3e6",
          600: "#1382bf",
          700: "#12679b",
          800: "#14567f",
          900: "#16496b"
        }
      }
    }
  },
  plugins: []
};

export default config;
