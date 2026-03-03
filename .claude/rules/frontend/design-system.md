---
paths: apps/web/**
---

# Frontend Design System & Styling

## Documentation

- See `docs/10-product/design-system.md` for comprehensive styling guide
- Interactive gallery: `http://localhost:3000/design-system` (dev-only, 404 in production)
- Component sandboxes: `http://localhost:3000/admin/dev-tools` (dev-only, admin route)

## Brand Identity

**"Clean, inviting, authentic, and lush"** - digital extension of Brava Island

## Color System (OKLCH)

Two-tier architecture: Tier 1 defines raw OKLCH values in `:root`/`.dark` selectors; Tier 2 maps them to Tailwind via `@theme inline` (`--color-*` namespace).

```css
:root {
  --brand-ocean-blue: oklch(0.35 0.08 240);
  --brand-valley-green: oklch(0.45 0.10 150);
  --brand-bougainvillea-pink: oklch(0.50 0.20 350);
  --brand-sunny-yellow: oklch(0.82 0.16 85);
}

.dark {
  --brand-ocean-blue: oklch(0.75 0.14 234);
}
```

**DO**: Use semantic tokens (`bg-surface`, `text-body`, `border-hairline`).
**DON'T**: Use raw OKLCH values or hex colors directly in components.

## Semantic Tokens (Preferred)

### Backgrounds

| Token | Usage |
|-------|-------|
| `bg-canvas` | Page background |
| `bg-surface` | Cards, sidebars |
| `bg-surface-alt` | Hover states, tertiary backgrounds |

### Text

| Token | Usage |
|-------|-------|
| `text-body` | Main reading text |
| `text-muted` | Secondary text, metadata, captions |
| `text-brand` | Brand-colored text (Ocean Blue) |

### Borders

| Token | Usage |
|-------|-------|
| `border-hairline` | Light dividers |
| `border-edge` | Strong borders |

### Status Colors

| Token | Usage |
|-------|-------|
| `status-error` | Error states, destructive actions |
| `status-success` | Success confirmations |
| `status-warning` | Warnings, caution |

## Shape & Elevation

### Border Radius (4 levels)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-badge` | 8px | Tags, badges, toasts |
| `rounded-button` | 12px | Buttons, inputs, chips |
| `rounded-card` | 16px | Standard cards |
| `rounded-container` | 24px | Featured cards, modals |

### Shadows (5 levels)

| Token | Usage |
|-------|-------|
| `shadow-subtle` | Default cards, inputs |
| `shadow-medium` | Hover states |
| `shadow-elevated` | Dropdowns, popovers |
| `shadow-floating` | Modals, toasts |
| `shadow-lift` | Card hover lift effect |

### Transition Timing

`ease-calm` = `cubic-bezier(0.16, 1, 0.3, 1)` — calm, confident motion.

## Typography

- **Headings**: Fraunces (serif) — variable font with SOFT, WONK axes
- **Body**: Outfit (sans-serif) — geometric, modern

## Conditional Classes

Use `clsx()` — never template literals:

```tsx
import { clsx } from "clsx";

// GOOD
className={clsx("bg-surface border", isActive && "ring-primary", className)}

// BAD
className={`bg-surface border ${isActive ? "ring-primary" : ""}`}
```

## Utility Classes

| Class | Effect |
|-------|--------|
| `.focus-ring` | Standard focus ring styling |
| `.touch-target` | Minimum 44x44px touch target |
| `.hover-surface` | Subtle hover background |
| `.hover-surface-strong` | Strong hover background |
| `.glass-panel` | Glassmorphism effect |

## Component Library

### Catalyst UI (9 components)

Button, Input, InputGroup, Checkbox, Fieldset, Dialog, Dropdown, Popover, Badge

### Custom UI Components (40+ in `components/ui/`)

| Category | Components |
|----------|------------|
| **Layout** | Card, PageHeader, Banner, Footer, Header |
| **Navigation** | MobileBottomNav, BackToTopButton, ScrollIndicator, TabGroup |
| **Media** | ImageGallery, ImageLightbox, ImageHeroSection, VideoHeroSection, GalleryImageGrid, ImageWithCourtesy |
| **Forms** | Select, Textarea, ImageUploader |
| **Feedback** | Toast system, LoadingSpinner, ConfirmationDialog |
| **Identity** | Avatar, AvatarGroup, Logo variants, ThemeToggle |
| **Interactive** | AnimatedButton, Tooltip, DirectoryCard, FeatureCard, StarRating |
| **Actions** (`ui/actions/`) | CopyLink, Print, ReactionButtons, Share, SuggestImprovement |
| **Content** | CitationSection, RelatedEntries, PrintPageWrapper, ContributePhotosSection |

## New Component Checklist

When building new components, ensure:

- [ ] Uses semantic color tokens (not raw OKLCH or hex)
- [ ] Uses shape tokens (`rounded-card`, etc.)
- [ ] Uses shadow tokens (`shadow-subtle`, etc.)
- [ ] Uses `ease-calm` for transitions
- [ ] Mobile-first responsive
- [ ] Focus states visible (use `.focus-ring`)
- [ ] Touch targets 44x44px minimum (use `.touch-target`)
- [ ] Works in light and dark modes

## Design Principles

- Mobile-first responsive
- Dark mode via CSS variables (light/dark themes)
- WCAG 2.1 AA accessibility

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | OKLCH CSS variables, semantic tokens, utility classes |
| `apps/web/tailwind.config.ts` | Tailwind config (border-radius, shadows, timing, colors) |
| `apps/web/src/app/layout.tsx` | Font loading (Fraunces, Outfit), theme init |
| `apps/web/src/components/ui/` | Custom UI components (40+) |
| `apps/web/src/components/catalyst-ui/` | Catalyst UI (9 retained) |

## Reference

- See `docs/10-product/design-system.md` for complete design system documentation
- See `docs/10-product/design-system.md#form-patterns` for React Hook Form + Zod patterns
- See `docs/10-product/design-system.md#animation--utility-classes` for animations
