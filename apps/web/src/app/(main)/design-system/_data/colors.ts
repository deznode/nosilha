/**
 * Design System Color Token Definitions
 * Source of truth: globals.css (The Brava Tones)
 */

export interface ColorToken {
  name: string;
  variable: string;
  lightHex: string;
  darkHex?: string;
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
    "Primary palette representing Brava Island's landscape and culture",
  tokens: [
    {
      name: "Ocean Blue",
      variable: "--color-ocean-blue",
      lightHex: "#0e4c75",
      darkHex: "#38bdf8",
      description: "Primary brand color, Atlantic ocean inspiration",
      usage: "Primary actions, links, brand accents",
    },
    {
      name: "Ocean Blue Light",
      variable: "--color-ocean-blue-light",
      lightHex: "#2a769e",
      description: "Lighter ocean variation",
      usage: "Hover states, secondary accents",
    },
    {
      name: "Valley Green",
      variable: "--color-valley-green",
      lightHex: "#2f6e4d",
      description: "Lush valley vegetation",
      usage: "Success states, nature imagery",
    },
    {
      name: "Bougainvillea Pink",
      variable: "--color-bougainvillea-pink",
      lightHex: "#c02669",
      darkHex: "#f472b6",
      description: "Vibrant flowering bougainvillea",
      usage: "Accents, highlights, call-to-action",
    },
    {
      name: "Sobrado Ochre",
      variable: "--color-sobrado-ochre",
      lightHex: "#d97706",
      description: "Traditional colonial architecture tones",
      usage: "Warnings, heritage highlights",
    },
    {
      name: "Sunny Yellow",
      variable: "--color-sunny-yellow",
      lightHex: "#fbbf24",
      description: "Bright Cape Verdean sunshine",
      usage: "Highlights, notifications",
    },
  ],
};

export const neutralColors: ColorGroup = {
  name: "Neutrals",
  description: "Mist (light) and Basalt (dark) scales for backgrounds and text",
  tokens: [
    {
      name: "Mist 50",
      variable: "--color-mist-50",
      lightHex: "#f8fafc",
      description: "Lightest mist, near white",
      usage: "Page backgrounds, light surfaces",
    },
    {
      name: "Mist 100",
      variable: "--color-mist-100",
      lightHex: "#f1f5f9",
      description: "Very light mist",
      usage: "Card backgrounds, alternating rows",
    },
    {
      name: "Mist 200",
      variable: "--color-mist-200",
      lightHex: "#e2e8f0",
      description: "Light mist",
      usage: "Borders, dividers, hover states",
    },
    {
      name: "Basalt 500",
      variable: "--color-basalt-500",
      lightHex: "#64748b",
      description: "Medium basalt",
      usage: "Secondary text, icons",
    },
    {
      name: "Basalt 800",
      variable: "--color-basalt-800",
      lightHex: "#1e293b",
      description: "Dark basalt",
      usage: "Primary text, headings",
    },
    {
      name: "Basalt 900",
      variable: "--color-basalt-900",
      lightHex: "#0f172a",
      description: "Deepest basalt",
      usage: "Dark mode backgrounds",
    },
  ],
};

export const semanticColors: ColorGroup = {
  name: "Semantic Aliases",
  description: "Contextual tokens that adapt to light/dark mode automatically",
  tokens: [
    {
      name: "Canvas",
      variable: "--color-canvas",
      lightHex: "#ffffff",
      darkHex: "#0b1120",
      description: "Page background",
      usage: "Main page container background",
    },
    {
      name: "Surface",
      variable: "--color-surface",
      lightHex: "#f8fafc",
      darkHex: "#1e293b",
      description: "Elevated surfaces",
      usage: "Cards, sidebars, modals",
    },
    {
      name: "Surface Alt",
      variable: "--color-surface-alt",
      lightHex: "#f1f5f9",
      darkHex: "#334155",
      description: "Alternate/hover surfaces",
      usage: "Hover states, alternating sections",
    },
    {
      name: "Body",
      variable: "--color-body",
      lightHex: "#0f172a",
      darkHex: "#f1f5f9",
      description: "Primary text color",
      usage: "Main reading text, headings",
    },
    {
      name: "Muted",
      variable: "--color-muted",
      lightHex: "#64748b",
      darkHex: "#94a3b8",
      description: "Secondary text color",
      usage: "Metadata, captions, labels",
    },
    {
      name: "Brand",
      variable: "--color-brand",
      lightHex: "#0e4c75",
      darkHex: "#7dd3fc",
      description: "Brand-colored text",
      usage: "Links, brand highlights",
    },
    {
      name: "Hairline",
      variable: "--color-hairline",
      lightHex: "#e2e8f0",
      darkHex: "#334155",
      description: "Subtle borders",
      usage: "Light dividers, card borders",
    },
    {
      name: "Edge",
      variable: "--color-edge",
      lightHex: "#64748b",
      darkHex: "#475569",
      description: "Strong borders",
      usage: "Input borders, focus rings",
    },
  ],
};

export const statusColors: ColorGroup = {
  name: "Status Colors",
  description:
    "Functional colors for feedback and state indication (Phase 3: Brighter, more harmonious)",
  tokens: [
    {
      name: "Success",
      variable: "--color-status-success",
      lightHex: "#10b981",
      description: "Positive feedback (Emerald 500)",
      usage: "Success messages, confirmations",
    },
    {
      name: "Error",
      variable: "--color-status-error",
      lightHex: "#f43f5e",
      description: "Error state (Rose 500)",
      usage: "Error messages, destructive actions",
    },
    {
      name: "Warning",
      variable: "--color-status-warning",
      lightHex: "#f59e0b",
      description: "Caution state (Amber 500)",
      usage: "Warnings, important notices",
    },
  ],
};

export const allColorGroups: ColorGroup[] = [
  brandColors,
  neutralColors,
  semanticColors,
  statusColors,
];
