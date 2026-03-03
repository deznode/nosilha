/**
 * Design System Typography Token Definitions
 * Source of truth: globals.css and Tailwind config
 */

export interface TypographyToken {
  name: string;
  fontFamily: "serif" | "sans";
  tailwindClass: string;
  mobileSizeRem: string;
  desktopSizeRem: string;
  weight: string;
  lineHeight: string;
  letterSpacing?: string;
  sampleText: string;
  usage: string;
}

export interface TypographyGroup {
  name: string;
  fontFamily: string;
  fontVariable: string;
  description: string;
  tokens: TypographyToken[];
}

export const headingTypography: TypographyGroup = {
  name: "Headings (Fraunces)",
  fontFamily: "Fraunces",
  fontVariable: "--font-serif",
  description: "Old-style serif with optical sizing and soft terminals",
  tokens: [
    {
      name: "Heading 1",
      fontFamily: "serif",
      tailwindClass: "text-4xl md:text-5xl font-serif font-bold",
      mobileSizeRem: "2.25rem",
      desktopSizeRem: "3rem",
      weight: "700 (Bold)",
      lineHeight: "1.1",
      sampleText: "Brava, a ilha das flores",
      usage: "Page titles, hero headlines",
    },
    {
      name: "Heading 2",
      fontFamily: "serif",
      tailwindClass: "text-3xl md:text-4xl font-serif font-semibold",
      mobileSizeRem: "1.875rem",
      desktopSizeRem: "2.25rem",
      weight: "600 (Semibold)",
      lineHeight: "1.2",
      sampleText: "Nossa História",
      usage: "Section headings",
    },
    {
      name: "Heading 3",
      fontFamily: "serif",
      tailwindClass: "text-2xl md:text-3xl font-serif font-semibold",
      mobileSizeRem: "1.5rem",
      desktopSizeRem: "1.875rem",
      weight: "600 (Semibold)",
      lineHeight: "1.3",
      sampleText: "Vila Nova Sintra",
      usage: "Card titles, subsections",
    },
    {
      name: "Heading 4",
      fontFamily: "serif",
      tailwindClass: "text-xl md:text-2xl font-serif font-medium",
      mobileSizeRem: "1.25rem",
      desktopSizeRem: "1.5rem",
      weight: "500 (Medium)",
      lineHeight: "1.4",
      sampleText: "Lugares de Memória",
      usage: "Component titles",
    },
  ],
};

export const bodyTypography: TypographyGroup = {
  name: "Body (Outfit)",
  fontFamily: "Outfit",
  fontVariable: "--font-sans",
  description: "Geometric sans-serif with clean, modern lines",
  tokens: [
    {
      name: "Body Large",
      fontFamily: "sans",
      tailwindClass: "text-lg font-sans font-normal",
      mobileSizeRem: "1.125rem",
      desktopSizeRem: "1.125rem",
      weight: "400 (Normal)",
      lineHeight: "1.75",
      sampleText:
        "A beleza natural de Brava é incomparável, com suas montanhas verdes e vales exuberantes.",
      usage: "Lead paragraphs, featured text",
    },
    {
      name: "Body",
      fontFamily: "sans",
      tailwindClass: "text-base font-sans font-normal",
      mobileSizeRem: "1rem",
      desktopSizeRem: "1rem",
      weight: "400 (Normal)",
      lineHeight: "1.75",
      sampleText:
        "Brava é a menor ilha habitada de Cabo Verde, conhecida como a ilha das flores pela sua vegetação exuberante.",
      usage: "Primary reading text",
    },
    {
      name: "Body Small",
      fontFamily: "sans",
      tailwindClass: "text-sm font-sans font-normal",
      mobileSizeRem: "0.875rem",
      desktopSizeRem: "0.875rem",
      weight: "400 (Normal)",
      lineHeight: "1.5",
      sampleText: "Pequenas histórias que formam nossa grande memória.",
      usage: "Secondary text, card descriptions",
    },
    {
      name: "Caption",
      fontFamily: "sans",
      tailwindClass: "text-xs font-sans font-normal",
      mobileSizeRem: "0.75rem",
      desktopSizeRem: "0.75rem",
      weight: "400 (Normal)",
      lineHeight: "1.5",
      sampleText: "Foto: Arquivo da comunidade, 2024",
      usage: "Image captions, metadata, timestamps",
    },
  ],
};

export const uiTypography: TypographyGroup = {
  name: "UI Elements (Outfit)",
  fontFamily: "Outfit",
  fontVariable: "--font-sans",
  description: "Typography for interactive elements and navigation",
  tokens: [
    {
      name: "Button",
      fontFamily: "sans",
      tailwindClass: "text-sm font-sans font-medium",
      mobileSizeRem: "0.875rem",
      desktopSizeRem: "0.875rem",
      weight: "500 (Medium)",
      lineHeight: "1",
      letterSpacing: "0.01em",
      sampleText: "Explorar Diretório",
      usage: "Buttons, CTAs",
    },
    {
      name: "Label",
      fontFamily: "sans",
      tailwindClass: "text-sm font-sans font-medium",
      mobileSizeRem: "0.875rem",
      desktopSizeRem: "0.875rem",
      weight: "500 (Medium)",
      lineHeight: "1.25",
      sampleText: "Categoria",
      usage: "Form labels, nav items",
    },
    {
      name: "Badge",
      fontFamily: "sans",
      tailwindClass: "text-xs font-sans font-semibold uppercase",
      mobileSizeRem: "0.75rem",
      desktopSizeRem: "0.75rem",
      weight: "600 (Semibold)",
      lineHeight: "1",
      letterSpacing: "0.05em",
      sampleText: "NOVO",
      usage: "Badges, tags, status indicators",
    },
  ],
};

export const allTypographyGroups: TypographyGroup[] = [
  headingTypography,
  bodyTypography,
  uiTypography,
];
