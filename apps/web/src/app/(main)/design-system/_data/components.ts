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

export const toastComponents: ComponentExample[] = [
  {
    name: "Toast",
    description:
      "Toast notification with 4 semantic variants (success, error, info, warning). Supports action buttons, keyboard dismissal (Esc), and hover-pause for auto-dismiss.",
    importPath: "@/components/ui/toast/toast",
    source: "custom",
  },
  {
    name: "useToast",
    description:
      "Fluent builder hook for creating toasts. Chain methods: .success().action().duration().id().show()",
    importPath: "@/hooks/use-toast",
    source: "custom",
  },
];

export const badgeComponents: ComponentExample[] = [
  {
    name: "Badge",
    description:
      "Inline status indicator with 5 color variants (blue, green, yellow, red, zinc). Uses design system brand colors.",
    importPath: "@/components/catalyst-ui/badge",
    source: "catalyst",
  },
  {
    name: "BadgeButton",
    description:
      "Interactive badge that can be a button or link. Includes focus ring and hover state.",
    importPath: "@/components/catalyst-ui/badge",
    source: "catalyst",
  },
];

export const dialogComponents: ComponentExample[] = [
  {
    name: "Dialog",
    description:
      "Modal dialog with HeadlessUI. Supports 9 size variants from xs to 5xl. Mobile-responsive as bottom sheet.",
    importPath: "@/components/catalyst-ui/dialog",
    source: "catalyst",
  },
  {
    name: "DialogTitle",
    description: "Dialog header with proper heading semantics.",
    importPath: "@/components/catalyst-ui/dialog",
    source: "catalyst",
  },
  {
    name: "DialogDescription",
    description: "Descriptive text beneath the dialog title.",
    importPath: "@/components/catalyst-ui/dialog",
    source: "catalyst",
  },
  {
    name: "DialogBody",
    description: "Container for dialog content with proper spacing.",
    importPath: "@/components/catalyst-ui/dialog",
    source: "catalyst",
  },
  {
    name: "DialogActions",
    description: "Footer container for action buttons with responsive layout.",
    importPath: "@/components/catalyst-ui/dialog",
    source: "catalyst",
  },
];

export const skeletonComponents: ComponentExample[] = [
  {
    name: "DirectoryCardSkeleton",
    description:
      "Skeleton loading state matching DirectoryCard layout. Uses semantic color tokens for dark mode.",
    importPath: "@/components/ui/directory-card-skeleton",
    source: "custom",
  },
  {
    name: "DirectoryGridSkeleton",
    description:
      "Grid of skeleton cards for directory pages. Configurable count.",
    importPath: "@/components/ui/directory-grid-skeleton",
    source: "custom",
  },
];

export const layoutComponents: ComponentExample[] = [
  {
    name: "PageHeader",
    description:
      "Animated page header with title, optional subtitle, heading level (h1/h2), size variants, and bougainvillea accent bar.",
    importPath: "@/components/ui/page-header",
    source: "custom",
  },
];

export const navigationComponents: ComponentExample[] = [
  {
    name: "MobileBottomNav",
    description:
      "Fixed bottom navigation for mobile. Thumb-zone optimized with iOS safe area support. Auto-hides on detail pages.",
    importPath: "@/components/ui/mobile-bottom-nav",
    source: "custom",
  },
];

export const toolbarComponents: ComponentExample[] = [
  {
    name: "ContentActionToolbar",
    description:
      "Responsive toolbar for content pages. Desktop: fixed left-rail. Mobile: FAB with expandable menu. Includes share, reactions, print, suggest.",
    importPath: "@/components/ui/content-action-toolbar",
    source: "custom",
  },
  {
    name: "ContentActionDesktop",
    description:
      "Desktop variant of toolbar. Fixed left-rail with vertical action stack.",
    importPath: "@/components/ui/content-action-toolbar/content-action-desktop",
    source: "custom",
  },
  {
    name: "ContentActionFAB",
    description:
      "Mobile variant of toolbar. 56×56px FAB that expands upward with stagger animation.",
    importPath: "@/components/ui/content-action-toolbar/content-action-fab",
    source: "custom",
  },
];

export const avatarComponents: ComponentExample[] = [
  {
    name: "Avatar",
    description:
      "User profile image with initials fallback, size variants (xs-xl), and optional status indicator.",
    importPath: "@/components/ui/avatar",
    source: "custom",
  },
  {
    name: "AvatarGroup",
    description:
      "Stacked avatar display with configurable max count and overflow indicator (+N).",
    importPath: "@/components/ui/avatar",
    source: "custom",
  },
  {
    name: "AvatarButton",
    description:
      "Clickable avatar with expanded touch target (44×44px) and focus ring.",
    importPath: "@/components/ui/avatar",
    source: "custom",
  },
];

export const overlayComponents: ComponentExample[] = [
  {
    name: "Tooltip",
    description:
      "Simple text hint on hover/focus. Position variants: top, bottom, left, right.",
    importPath: "@/components/ui/tooltip",
    source: "custom",
  },
  {
    name: "Popover",
    description:
      "Rich content panel that opens on click. Auto-positioning with HeadlessUI anchor.",
    importPath: "@/components/catalyst-ui/popover",
    source: "catalyst",
  },
  {
    name: "Dropdown",
    description:
      "Action menu with items, dividers, icons, and keyboard shortcuts.",
    importPath: "@/components/catalyst-ui/dropdown",
    source: "catalyst",
  },
  {
    name: "DropdownItem",
    description:
      "Menu item supporting buttons, links, icons, disabled, and destructive states.",
    importPath: "@/components/catalyst-ui/dropdown",
    source: "catalyst",
  },
];

export const tabsComponents: ComponentExample[] = [
  {
    name: "TabGroup",
    description:
      "HeadlessUI Tab component. Container for tabs with managed state.",
    importPath: "@headlessui/react",
    source: "catalyst",
  },
  {
    name: "TabList",
    description: "Container for tab buttons with flex layout.",
    importPath: "@headlessui/react",
    source: "catalyst",
  },
  {
    name: "Tab",
    description:
      "Individual tab button. Supports data-selected for active styling.",
    importPath: "@headlessui/react",
    source: "catalyst",
  },
  {
    name: "TabPanels / TabPanel",
    description: "Container and individual panels for tab content.",
    importPath: "@headlessui/react",
    source: "catalyst",
  },
];

export const paginationComponents: ComponentExample[] = [
  {
    name: "Pagination",
    description:
      "Page navigation with prev/next buttons, page numbers, and ellipsis for large ranges. Size variants: sm, md, lg.",
    importPath: "local pattern",
    source: "custom",
  },
];

export const allComponents = [
  ...buttonComponents,
  ...inputComponents,
  ...checkboxComponents,
  ...feedbackComponents,
  ...cardComponents,
  ...toastComponents,
  ...badgeComponents,
  ...dialogComponents,
  ...skeletonComponents,
  ...layoutComponents,
  ...navigationComponents,
  ...toolbarComponents,
  ...avatarComponents,
  ...overlayComponents,
  ...tabsComponents,
  ...paginationComponents,
];
