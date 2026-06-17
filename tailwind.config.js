/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          950: "#0A0D12",
          900: "#0C0F14",
          875: "#10151C",
          850: "#131922",
          800: "#161C25",
          750: "#1A2130",
          700: "#1E2632",
          600: "#26313E",
          500: "#33404F",
          400: "#475463",
        },
        line: {
          DEFAULT: "#26313E",
          soft: "#1C2430",
        },
        chalk: {
          DEFAULT: "#E6EDF5",
          dim: "#93A1B0",
          mute: "#5C6B7A",
        },
        teal: {
          DEFAULT: "#2DD4BF",
          dim: "#1FB3A0",
          deep: "#0E5A52",
        },
        sterile: "#38BDF8",
        ok: "#34D399",
        warn: "#FBBF24",
        bad: "#F87171",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        glow: "inset 0 0 0 1px rgba(45,212,191,0.30), 0 0 22px rgba(45,212,191,0.10)",
        panel: "0 1px 0 rgba(255,255,255,0.02), 0 0 0 1px rgba(255,255,255,0.03)",
        float: "0 18px 40px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "scan": "scan 2.4s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
