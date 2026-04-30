// NaikKelas — Tailwind v3.4 config (R4 lock, adjusted for src/ structure)
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        paper:        "#F4EFE4",
        "paper-2":    "#EFE9DC",
        "paper-3":    "#E8E1D0",
        // Brand
        teal:         "#1E5048",
        "teal-deep":  "#173E37",
        "teal-soft":  "#3A6B5E",
        // Ink
        charcoal:     "#2A2622",
        "charcoal-2": "#4A4137",
        sepia:        "#7A6F61",
        "sepia-2":    "#9E927F",
        // Lines
        rule:         "#E4D9C2",
        "rule-2":     "#D5C8AA",
        // Stamps
        stempel:        "#C68A2E",
        "stempel-deep": "#A06E1E",
        catatan:        "#A03A2A",
        "catatan-soft": "#C66652",
      },

      fontFamily: {
        serif: ["var(--font-serif)", "Source Serif Pro", "Georgia", "serif"],
        sans:  ["var(--font-sans)",  "Inter", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)",  "ui-monospace", "Menlo", "monospace"],
      },

      fontSize: {
        "h1":              ["32px", { lineHeight: "1.15", letterSpacing: "-0.01em",  fontWeight: "400" }],
        "h1-cover":        ["72px", { lineHeight: "1.05", letterSpacing: "-0.02em",  fontWeight: "400" }],
        "h2":              ["22px", { lineHeight: "1.20", letterSpacing: "-0.005em", fontWeight: "400" }],
        "h3":              ["18px", { lineHeight: "1.25", letterSpacing: "0",        fontWeight: "500" }],
        "num-hero":        ["40px", { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "400" }],
        "num-hero-lg":     ["48px", { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "400" }],
        "lead":            ["15px", { lineHeight: "1.65" }],
        "body":            ["15px", { lineHeight: "1.60" }],
        "body-print":      ["14px", { lineHeight: "1.60" }],
        "meta":            ["12px", { lineHeight: "1.40", letterSpacing: "0.01em" }],
        "meta-mono":       ["12px", { lineHeight: "1.40", letterSpacing: "0.04em" }],
        "label-up":        ["11px", { lineHeight: "1.20", letterSpacing: "0.12em", fontWeight: "500" }],
        "label-up-wide":   ["11px", { lineHeight: "1.20", letterSpacing: "0.18em", fontWeight: "500" }],
        "label-up-tight":  ["10px", { lineHeight: "1.20", letterSpacing: "0.08em", fontWeight: "500" }],
        "stamp":           ["10px", { lineHeight: "1.00", letterSpacing: "0.16em", fontWeight: "600" }],
        "stamp-lg":        ["13px", { lineHeight: "1.00", letterSpacing: "0.20em", fontWeight: "600" }],
        "trust":           ["10px", { lineHeight: "1.60", letterSpacing: "0.04em" }],
      },

      borderRadius: {
        "card": "2px",
        "btn":  "2px",
        "pill": "999px",
      },

      borderWidth: {
        "hairline": "1px",
      },

      spacing: {
        "card":   "14px",
        "card-y": "16px",
        "gutter": "20px",
        "section": "24px",
        "spine":  "96px",
        "page-l": "132px",
        "page-r": "60px",
      },

      maxWidth: {
        "dashboard": "720px",
        "report":    "794px",
      },
    },
  },
  plugins: [],
};

export default config;