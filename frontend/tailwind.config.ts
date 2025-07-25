import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/catalyst-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["variant", "&:where(.dark, .dark *)"],
  plugins: [forms],
};
export default config;
