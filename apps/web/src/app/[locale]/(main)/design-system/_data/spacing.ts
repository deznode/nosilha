/**
 * Design System Spacing, Shadow, and Border Radius Token Definitions
 * Source of truth: globals.css (Calm Premium design tokens)
 */

export interface SpacingToken {
  name: string;
  tailwindClass: string;
  pixels: number;
  rem: string;
  usage: string;
}

export interface ShadowToken {
  name: string;
  variable: string;
  tailwindClass: string;
  value: string;
  description: string;
  usage: string;
}

export interface RadiusToken {
  name: string;
  variable: string;
  tailwindClass: string;
  pixels: number;
  description: string;
  usage: string;
}

export const spacingScale: SpacingToken[] = [
  {
    name: "0.5 (2px)",
    tailwindClass: "p-0.5",
    pixels: 2,
    rem: "0.125rem",
    usage: "Micro spacing, icon gaps",
  },
  {
    name: "1 (4px)",
    tailwindClass: "p-1",
    pixels: 4,
    rem: "0.25rem",
    usage: "Tight spacing, badge padding",
  },
  {
    name: "2 (8px)",
    tailwindClass: "p-2",
    pixels: 8,
    rem: "0.5rem",
    usage: "Base unit, icon button padding",
  },
  {
    name: "3 (12px)",
    tailwindClass: "p-3",
    pixels: 12,
    rem: "0.75rem",
    usage: "Button padding, form inputs",
  },
  {
    name: "4 (16px)",
    tailwindClass: "p-4",
    pixels: 16,
    rem: "1rem",
    usage: "Card padding, section gaps",
  },
  {
    name: "6 (24px)",
    tailwindClass: "p-6",
    pixels: 24,
    rem: "1.5rem",
    usage: "Container padding, section margins",
  },
  {
    name: "8 (32px)",
    tailwindClass: "p-8",
    pixels: 32,
    rem: "2rem",
    usage: "Large sections, hero padding",
  },
  {
    name: "12 (48px)",
    tailwindClass: "p-12",
    pixels: 48,
    rem: "3rem",
    usage: "Section separators",
  },
  {
    name: "16 (64px)",
    tailwindClass: "p-16",
    pixels: 64,
    rem: "4rem",
    usage: "Major section breaks",
  },
];

export const shadowTokens: ShadowToken[] = [
  {
    name: "Subtle",
    variable: "--shadow-subtle",
    tailwindClass: "shadow-subtle",
    value: "0 1px 2px rgba(14, 76, 117, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04)",
    description: "Gentle elevation for resting state",
    usage: "Cards at rest, buttons default",
  },
  {
    name: "Medium",
    variable: "--shadow-medium",
    tailwindClass: "shadow-medium",
    value:
      "0 4px 6px -1px rgba(14, 76, 117, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
    description: "Moderate elevation for interaction",
    usage: "Hover states, dropdowns",
  },
  {
    name: "Elevated",
    variable: "--shadow-elevated",
    tailwindClass: "shadow-elevated",
    value:
      "0 10px 15px -3px rgba(14, 76, 117, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
    description: "Higher elevation for focus",
    usage: "Active elements, modals",
  },
  {
    name: "Floating",
    variable: "--shadow-floating",
    tailwindClass: "shadow-floating",
    value:
      "0 20px 25px -5px rgba(14, 76, 117, 0.10), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
    description: "Maximum elevation for overlays",
    usage: "Popovers, tooltips, floating elements",
  },
  {
    name: "Lift",
    variable: "--shadow-lift",
    tailwindClass: "shadow-lift",
    value:
      "0 14px 20px -5px rgba(14, 76, 117, 0.12), 0 6px 8px -3px rgba(0, 0, 0, 0.04)",
    description: "Hover lift effect",
    usage: "Card hover animation destination",
  },
];

export const radiusTokens: RadiusToken[] = [
  {
    name: "Badge",
    variable: "--radius-badge",
    tailwindClass: "rounded-badge",
    pixels: 8,
    description: "Smallest radius for compact elements",
    usage: "Tags, badges, toasts, pills",
  },
  {
    name: "Button",
    variable: "--radius-button",
    tailwindClass: "rounded-button",
    pixels: 12,
    description: "Medium radius for interactive elements",
    usage: "Buttons, inputs, form controls",
  },
  {
    name: "Card",
    variable: "--radius-card",
    tailwindClass: "rounded-card",
    pixels: 16,
    description: "Standard radius for content containers",
    usage: "Cards, dialogs, panels",
  },
  {
    name: "Container",
    variable: "--radius-container",
    tailwindClass: "rounded-container",
    pixels: 24,
    description: "Largest radius for major containers",
    usage: "Hero sections, featured cards",
  },
];
