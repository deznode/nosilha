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

### Catalyst UI (25+ components)

Pre-built accessible components from Catalyst:
- Button, Input, Select, Checkbox
- Dialog, Dropdown, Popover
- Table, Tabs, Badge
- And more...

### Custom UI Components

| Component | Purpose |
|-----------|---------|
| `DirectoryCard` | Display directory entry cards |
| `PageHeader` | Page headers with breadcrumbs |
| `ThemeToggle` | Dark/light mode switcher |
| `MapComponent` | Mapbox GL integration |

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
| `apps/web/src/components/ui/theme-toggle.tsx` | Theme switcher |
| `apps/web/src/components/ui/button.tsx` | Button component |

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
