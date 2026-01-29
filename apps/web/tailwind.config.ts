import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/catalyst-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        print: { raw: "print" }, // Enables print: prefix → @media print
      },
      borderRadius: {
        container: "var(--radius-container)",
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        badge: "var(--radius-badge)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        medium: "var(--shadow-medium)",
        elevated: "var(--shadow-elevated)",
        floating: "var(--shadow-floating)",
        lift: "var(--shadow-lift)",
      },
      transitionTimingFunction: {
        calm: "var(--ease-calm)",
      },
    },
  },
  plugins: [forms],
};
export default config;
