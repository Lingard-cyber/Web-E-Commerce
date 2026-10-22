import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#033d2d",
          900: "#045b40",
          800: "#08704d",
          700: "#0a8458",
        },
        accent: "#f8c400",
        cream: "#fff9e9",
        ink: "#123b30",
        muted: "#718b81",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Arial", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(6, 62, 43, .09)",
      },
    },
  },
  plugins: [],
};

export default config;
