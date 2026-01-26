---
paths: apps/web/**
---

# Frontend Design System & Styling

## Documentation

See `docs/design-system.md` for comprehensive styling guide.

## Brand Identity

**"Clean, inviting, authentic, and lush"** - digital extension of Brava Island

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Ocean Blue | `#0e4c75` | Primary actions, links |
| Ocean Blue Deep | `#0e4c75` | Hover states, dark accents (same as Ocean Blue in light mode) |
| Valley Green | `#2f6e4d` | Success states, nature imagery |
| Bougainvillea Pink | `#D90368` | Accents, highlights |
| Sunny Yellow | `#F7B801` | Warnings, call-to-action |
| Mist (Neutrals) | `#f8fafc` to `#e2e8f0` | Backgrounds (Slate palette) |
| Basalt (Neutrals) | `#64748b` to `#0f172a` | Text, dark backgrounds (Slate palette) |

## Typography

- **Headings**: Fraunces (serif) - variable, old-style, soft
- **Body text**: Outfit (sans-serif) - geometric, brand-focused, clean
- **Implementation**: Google Fonts with CSS variables

```css
--font-sans: 'Outfit', sans-serif;
--font-serif: 'Fraunces', serif;
```

## Component Library

### Catalyst UI (8 retained)

Curated subset of Catalyst for complex interactive components:
- Button, Input, Checkbox, Fieldset
- Dialog, Dropdown, Popover, Badge

### Custom UI Components

Key custom components in `components/ui/`:

| Component | Purpose |
|-----------|---------|
| `DirectoryCard` | Display directory entry cards |
| `PageHeader` | Page headers with breadcrumbs |
| `ThemeToggle` | Dark/light mode switcher |
| `Avatar` | User images with initials fallback, status |
| `Tooltip` | Hover hints with position variants |
| `MobileBottomNav` | Thumb-zone mobile navigation |
| `AnimatedButton` | Framer Motion button variants |

See `docs/design-system.md` for complete component inventory.

### Design Principles

- **Mobile-first**: All components responsive
- **Dark mode support**: CSS variables for theming
- **Accessibility**: WCAG 2.1 AA compliance

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | Global styles and CSS variables |
| `apps/web/tailwind.config.ts` | Tailwind configuration |
| `apps/web/src/app/layout.tsx` | Root layout with fonts |
| `apps/web/src/components/ui/` | Custom UI components (37+) |
| `apps/web/src/components/catalyst-ui/` | Catalyst UI components (8 retained) |

## Tailwind Usage

```tsx
// Use semantic CSS variable tokens
<div className="text-[var(--color-ocean-blue)] bg-[var(--color-valley-green)]/10">
  Content
</div>

// Mobile-first responsive
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Font usage
<h1 className="font-serif">Heading with Fraunces</h1>
<p className="font-sans">Body text with Outfit</p>
```

## Reference

- See `docs/design-system.md` for complete design system documentation
