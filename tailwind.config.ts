import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070B14",
          900: "#0B1220", // Deep navy/ink primary
          850: "#101A2E",
          800: "#16223B",
          700: "#223356",
          600: "#324A7A",
        },
        ivory: {
          50: "#FCFAF7",
          100: "#F8F5EF", // Ivory light background
          200: "#EDE7DA", // Parchment neutral
          300: "#DFD7C4",
          400: "#C9BEA7",
        },
        gold: {
          50: "#FCF9EC",
          100: "#F7F0D0",
          200: "#EEDCA2",
          300: "#E3C570",
          400: "#D6AF41",
          500: "#C9A227", // Antique gold brand accent
          600: "#AA861E",
          700: "#866717",
          800: "#634B13",
        },
        maroon: {
          50: "#F9ECEF",
          100: "#F1CFD7",
          200: "#E1A1B2",
          300: "#CE6F89",
          400: "#A33E59",
          500: "#5B2333", // Deep maroon/burgundy secondary accent
          600: "#4D1D2B",
          700: "#3D1722",
          800: "#2E111A",
        },
        charcoal: {
          DEFAULT: "#2E2A26", // Neutral text
          muted: "#6B655D",
          light: "#8C857B",
        },
        sage: {
          500: "#6B8F71", // Muted sage green (success)
          600: "#55735A",
          100: "#EAF1EB",
        },
        rust: {
          500: "#A6453A", // Muted rust red (error)
          600: "#89372E",
          100: "#F7EBEA",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "Source Sans 3", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      boxShadow: {
        aristocrat: "0 4px 20px -2px rgba(11, 18, 32, 0.08), 0 2px 6px -1px rgba(201, 162, 39, 0.06)",
        goldGlow: "0 0 15px -3px rgba(201, 162, 39, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
