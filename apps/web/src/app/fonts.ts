import { Outfit, Fraunces } from "next/font/google";

// 0. Set up the primary and secondary fonts using next/font/google.
// The 'variable' option creates a CSS variable we can use in our Tailwind theme.
// 1. The "Connector" Font (UI/Body)
// Outfit: Geometric, modern, but warm. Perfect for the "Digital Hub" aspect.
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// 2. The "Soul" Font (Headings)
// Fraunces: A Variable font. Soft, wonky, historic, and full of personality.
// It captures the "Island of Flowers" vibe with its petal-like serifs.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  // We use the full variable axes for maximum creativity
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
