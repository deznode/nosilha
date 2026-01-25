/**
 * Component metadata for the design system gallery.
 * Used by specimen components to display import paths and descriptions.
 */

export interface ComponentExample {
  name: string;
  description: string;
  importPath: string;
  source: "custom" | "catalyst";
}

export const buttonComponents: ComponentExample[] = [
  {
    name: "AnimatedButton",
    description:
      "Primary action button with Framer Motion animations. Supports variants (primary, secondary, outline, ghost), sizes, loading states, and icons.",
    importPath: "@/components/ui/animated-button",
    source: "custom",
  },
];

export const inputComponents: ComponentExample[] = [
  {
    name: "Input",
    description:
      "Text input field with validation states and theming. Based on HeadlessUI.",
    importPath: "@/components/catalyst-ui/input",
    source: "catalyst",
  },
  {
    name: "InputGroup",
    description:
      "Container for input with icons. Positions icons automatically.",
    importPath: "@/components/catalyst-ui/input",
    source: "catalyst",
  },
];

export const checkboxComponents: ComponentExample[] = [
  {
    name: "Checkbox",
    description:
      "Checkbox with 22 color variants. Supports checked, indeterminate, and disabled states.",
    importPath: "@/components/catalyst-ui/checkbox",
    source: "catalyst",
  },
  {
    name: "CheckboxField",
    description: "Layout wrapper for checkbox with label and description.",
    importPath: "@/components/catalyst-ui/checkbox",
    source: "catalyst",
  },
  {
    name: "CheckboxGroup",
    description: "Container for multiple related checkboxes.",
    importPath: "@/components/catalyst-ui/checkbox",
    source: "catalyst",
  },
];

export const feedbackComponents: ComponentExample[] = [
  {
    name: "Banner",
    description:
      "Promotional banner with gradient background. Supports default and high-contrast tones.",
    importPath: "@/components/ui/banner",
    source: "custom",
  },
  {
    name: "LoadingSpinner",
    description:
      "Animated loading indicator with three spinning dots. Available in sm, md, lg sizes.",
    importPath: "@/components/ui/loading-spinner",
    source: "custom",
  },
  {
    name: "LoadingDots",
    description: "Inline loading dots animation for text contexts.",
    importPath: "@/components/ui/loading-spinner",
    source: "custom",
  },
  {
    name: "LoadingPulse",
    description: "Subtle pulse animation wrapper for skeleton states.",
    importPath: "@/components/ui/loading-spinner",
    source: "custom",
  },
  {
    name: "ConfirmationDialog",
    description:
      "Modal dialog for destructive actions. Supports default, warning, and danger variants.",
    importPath: "@/components/ui/confirmation-dialog",
    source: "custom",
  },
];

export const cardComponents: ComponentExample[] = [
  {
    name: "Card",
    description:
      "Base card component with Calm Premium tokens. Optional hoverable prop adds lift animation.",
    importPath: "@/components/ui/card",
    source: "custom",
  },
  {
    name: "DirectoryCard",
    description:
      "Project-specific card for directory entries. Includes image, category badge, bookmark button, and metadata.",
    importPath: "@/components/ui/directory-card",
    source: "custom",
  },
];

export const allComponents = [
  ...buttonComponents,
  ...inputComponents,
  ...checkboxComponents,
  ...feedbackComponents,
  ...cardComponents,
];
