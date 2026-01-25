/**
 * Design System Color Token Definitions
 * Source of truth: globals.css (The Brava Tones)
 *
 * Updated: Tailwind CSS v4 two-tier OKLCH color system
 */

export interface ColorToken {
  name: string;
  variable: string;
  lightHex: string;
  darkHex?: string;
  oklch: string;
  oklchDark?: string;
  description: string;
  usage?: string;
}

export interface ColorGroup {
  name: string;
  description: string;
  tokens: ColorToken[];
}

export const brandColors: ColorGroup = {
  name: "Brand Colors",
  description:
    "Primary palette representing Brava Island's landscape and culture (OKLCH format)",
  tokens: [
    {
      name: "Ocean Blue",
      variable: "--brand-ocean-blue",
      lightHex: "#0e4c75",
      darkHex: "#38bdf8",
      oklch: "oklch(0.35 0.08 240)",
      oklchDark: "oklch(0.73 0.15 200)",
      description: "Primary brand color, Atlantic ocean inspiration",
      usage: "Primary actions, links, brand accents",
    },
    {
      name: "Ocean Blue Light",
      variable: "--brand-ocean-blue-light",
      lightHex: "#2a769e",
      darkHex: "#7dd3fc",
      oklch: "oklch(0.48 0.08 220)",
      oklchDark: "oklch(0.78 0.12 200)",
      description: "Lighter ocean variation",
      usage: "Hover states, secondary accents",
    },
    {
      name: "Valley Green",
      variable: "--brand-valley-green",
      lightHex: "#2f6e4d",
      darkHex: "#4ade80",
      oklch: "oklch(0.45 0.10 150)",
      oklchDark: "oklch(0.65 0.12 160)",
      description: "Lush valley vegetation",
      usage: "Success states, nature imagery",
    },
    {
      name: "Bougainvillea Pink",
      variable: "--brand-bougainvillea-pink",
      lightHex: "#c02669",
      darkHex: "#f472b6",
      oklch: "oklch(0.50 0.20 350)",
      oklchDark: "oklch(0.70 0.15 340)",
      description: "Vibrant flowering bougainvillea",
      usage: "Accents, highlights, call-to-action",
    },
    {
      name: "Sobrado Ochre",
      variable: "--brand-sobrado-ochre",
      lightHex: "#d97706",
      oklch: "oklch(0.62 0.18 65)",
      description: "Traditional colonial architecture tones",
      usage: "Warnings, heritage highlights",
    },
    {
      name: "Sunny Yellow",
      variable: "--brand-sunny-yellow",
      lightHex: "#fbbf24",
      oklch: "oklch(0.82 0.16 85)",
      description: "Bright Cape Verdean sunshine",
      usage: "Highlights, notifications",
    },
  ],
};

export const neutralColors: ColorGroup = {
  name: "Neutrals",
  description:
    "Mist (light) and Basalt (dark) scales for backgrounds and text (OKLCH format)",
  tokens: [
    {
      name: "Mist 50",
      variable: "--neutral-mist-50",
      lightHex: "#f8fafc",
      oklch: "oklch(0.98 0.005 250)",
      description: "Lightest mist, near white",
      usage: "Page backgrounds, light surfaces",
    },
    {
      name: "Mist 100",
      variable: "--neutral-mist-100",
      lightHex: "#f1f5f9",
      oklch: "oklch(0.96 0.007 250)",
      description: "Very light mist",
      usage: "Card backgrounds, alternating rows",
    },
    {
      name: "Mist 200",
      variable: "--neutral-mist-200",
      lightHex: "#e2e8f0",
      oklch: "oklch(0.92 0.01 250)",
      description: "Light mist",
      usage: "Borders, dividers, hover states",
    },
    {
      name: "Basalt 500",
      variable: "--neutral-basalt-500",
      lightHex: "#64748b",
      oklch: "oklch(0.55 0.03 260)",
      description: "Medium basalt",
      usage: "Secondary text, icons",
    },
    {
      name: "Basalt 800",
      variable: "--neutral-basalt-800",
      lightHex: "#1e293b",
      oklch: "oklch(0.28 0.03 260)",
      description: "Dark basalt",
      usage: "Primary text, headings",
    },
    {
      name: "Basalt 900",
      variable: "--neutral-basalt-900",
      lightHex: "#0f172a",
      oklch: "oklch(0.20 0.03 260)",
      description: "Deepest basalt",
      usage: "Dark mode backgrounds",
    },
  ],
};

export const semanticColors: ColorGroup = {
  name: "Semantic Aliases",
  description:
    "Contextual tokens that adapt to light/dark mode automatically (shadcn/ui compatible)",
  tokens: [
    {
      name: "Background",
      variable: "--background",
      lightHex: "#ffffff",
      darkHex: "#0b1120",
      oklch: "oklch(1 0 0)",
      oklchDark: "oklch(0.15 0.02 260)",
      description: "Page background",
      usage: "Main page container background",
    },
    {
      name: "Foreground",
      variable: "--foreground",
      lightHex: "#0f172a",
      darkHex: "#f1f5f9",
      oklch: "var(--neutral-basalt-900)",
      oklchDark: "oklch(0.96 0.007 250)",
      description: "Primary text color",
      usage: "Main reading text, headings",
    },
    {
      name: "Primary",
      variable: "--primary",
      lightHex: "#0e4c75",
      darkHex: "#38bdf8",
      oklch: "var(--brand-ocean-blue)",
      oklchDark: "var(--brand-ocean-blue)",
      description: "Primary brand color",
      usage: "Primary buttons, links, focus rings",
    },
    {
      name: "Secondary",
      variable: "--secondary",
      lightHex: "#f1f5f9",
      darkHex: "#1e293b",
      oklch: "var(--neutral-mist-100)",
      oklchDark: "oklch(0.22 0.025 260)",
      description: "Secondary surfaces",
      usage: "Secondary buttons, backgrounds",
    },
    {
      name: "Destructive",
      variable: "--destructive",
      lightHex: "#f43f5e",
      darkHex: "#dc2626",
      oklch: "var(--status-error)",
      oklchDark: "oklch(0.55 0.20 15)",
      description: "Destructive actions",
      usage: "Delete buttons, error states",
    },
    {
      name: "Muted",
      variable: "--muted",
      lightHex: "#f1f5f9",
      darkHex: "#1e293b",
      oklch: "var(--neutral-mist-100)",
      oklchDark: "oklch(0.22 0.025 260)",
      description: "Muted surfaces",
      usage: "Disabled states, subtle backgrounds",
    },
    {
      name: "Card",
      variable: "--card",
      lightHex: "#ffffff",
      darkHex: "#141c2e",
      oklch: "oklch(1 0 0)",
      oklchDark: "oklch(0.18 0.02 260)",
      description: "Card surfaces",
      usage: "Cards, sidebars, modals",
    },
    {
      name: "Input",
      variable: "--input",
      lightHex: "#e2e8f0",
      darkHex: "#334155",
      oklch: "var(--neutral-mist-200)",
      oklchDark: "oklch(0.30 0.025 260)",
      description: "Input borders",
      usage: "Form input borders",
    },
    {
      name: "Ring",
      variable: "--ring",
      lightHex: "#0e4c75",
      darkHex: "#38bdf8",
      oklch: "var(--brand-ocean-blue)",
      oklchDark: "oklch(0.73 0.15 200)",
      description: "Focus ring color",
      usage: "Focus indicators, outlines",
    },
  ],
};

export const statusColors: ColorGroup = {
  name: "Status Colors",
  description:
    "Functional colors for feedback and state indication (OKLCH format)",
  tokens: [
    {
      name: "Success",
      variable: "--status-success",
      lightHex: "#10b981",
      oklch: "oklch(0.67 0.17 165)",
      description: "Positive feedback",
      usage: "Success messages, confirmations",
    },
    {
      name: "Error",
      variable: "--status-error",
      lightHex: "#f43f5e",
      oklch: "oklch(0.63 0.22 15)",
      description: "Error state",
      usage: "Error messages, destructive actions",
    },
    {
      name: "Warning",
      variable: "--status-warning",
      lightHex: "#f59e0b",
      oklch: "oklch(0.75 0.18 70)",
      description: "Caution state",
      usage: "Warnings, important notices",
    },
  ],
};

export const backwardCompatColors: ColorGroup = {
  name: "Backward Compatibility",
  description:
    "Legacy token aliases preserved for existing component compatibility",
  tokens: [
    {
      name: "Canvas",
      variable: "--color-canvas",
      lightHex: "#ffffff",
      darkHex: "#0b1120",
      oklch: "var(--background)",
      oklchDark: "var(--background)",
      description: "Page background (legacy alias)",
      usage: "bg-canvas utility class",
    },
    {
      name: "Surface",
      variable: "--color-surface",
      lightHex: "#f8fafc",
      darkHex: "#1e293b",
      oklch: "var(--background-secondary)",
      oklchDark: "var(--background-secondary)",
      description: "Elevated surfaces (legacy alias)",
      usage: "bg-surface utility class",
    },
    {
      name: "Body",
      variable: "--color-body",
      lightHex: "#0f172a",
      darkHex: "#f1f5f9",
      oklch: "var(--foreground)",
      oklchDark: "var(--foreground)",
      description: "Primary text (legacy alias)",
      usage: "text-body utility class",
    },
    {
      name: "Hairline",
      variable: "--color-hairline",
      lightHex: "#e2e8f0",
      darkHex: "#334155",
      oklch: "var(--border-subtle)",
      oklchDark: "var(--border-subtle)",
      description: "Subtle borders (legacy alias)",
      usage: "border-hairline utility class",
    },
  ],
};

export const allColorGroups: ColorGroup[] = [
  brandColors,
  neutralColors,
  semanticColors,
  statusColors,
  backwardCompatColors,
];
