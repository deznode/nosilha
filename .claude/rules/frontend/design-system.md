---
paths: apps/web/**
---

# Frontend Design System & Styling

## Documentation

See `docs/design-system.md` for comprehensive styling guide.

## Brand Identity

**"Clean, inviting, authentic, and lush"** - digital extension of Brava Island

## Color System (OKLCH)

Colors use the OKLCH color space via CSS custom properties — not hex values:

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

| Token | Usage |
|-------|-------|
| `bg-surface` | Cards, sidebars |
| `text-body` | Main text |
| `text-muted` | Secondary text |
| `border-hairline` | Light dividers |
| `shadow-subtle` | Default card shadow |
| `shadow-lift` | Hover state shadow |
| `rounded-card` | Card border radius |
| `rounded-button` | Button border radius |
| `ease-calm` | Transition timing |

## Typography

- **Headings**: Fraunces (serif)
- **Body**: Outfit (sans-serif)

## Conditional Classes

Use `clsx()` — never template literals:

```tsx
import { clsx } from "clsx";

// GOOD
className={clsx("bg-surface border", isActive && "ring-primary", className)}

// BAD
className={`bg-surface border ${isActive ? "ring-primary" : ""}`}
```

## Component Library

### Catalyst UI (9 components)

Button, Input, InputGroup, Checkbox, Fieldset, Dialog, Dropdown, Popover, Badge

### Custom UI Components

Key components in `components/ui/`: Card, DirectoryCard, PageHeader, ThemeToggle, Avatar, Tooltip, MobileBottomNav, Select, Textarea, Toast, TabGroup, LoadingSpinner, AnimatedButton

## Design Principles

- Mobile-first responsive
- Dark mode via CSS variables (light/dark themes)
- WCAG 2.1 AA accessibility

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | OKLCH CSS variables, semantic tokens |
| `apps/web/tailwind.config.ts` | Tailwind config (custom border-radius, shadows, timing) |
| `apps/web/src/components/ui/` | Custom UI components |
| `apps/web/src/components/catalyst-ui/` | Catalyst UI (9 retained) |

## Reference

- See `docs/design-system.md` for complete design system documentation
- See `docs/design-system.md#form-patterns` for React Hook Form + Zod patterns
