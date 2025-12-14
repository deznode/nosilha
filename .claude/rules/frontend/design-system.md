---
paths: frontend/**
---

# Frontend Design System & Styling

## Documentation

See `docs/DESIGN_SYSTEM.md` for comprehensive styling guide.

## Brand Identity

**"Clean, inviting, authentic, and lush"** - digital extension of Brava Island

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Ocean Blue | `#005A8D` | Primary actions, links |
| Valley Green | `#3E7D5A` | Success states, nature imagery |
| Bougainvillea Pink | `#D90368` | Accents, highlights |
| Sunny Yellow | `#F7B801` | Warnings, call-to-action |

## Typography

- **Headings**: Merriweather (serif)
- **Body text**: Lato (sans-serif)
- **Implementation**: Google Fonts with CSS variables

```css
--font-heading: 'Merriweather', serif;
--font-body: 'Lato', sans-serif;
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
| `frontend/src/app/globals.css` | Global styles and CSS variables |
| `frontend/tailwind.config.ts` | Tailwind configuration |
| `frontend/src/app/layout.tsx` | Root layout with fonts |
| `frontend/src/components/ui/theme-toggle.tsx` | Theme switcher |
| `frontend/src/components/ui/button.tsx` | Button component |

## Tailwind Usage

```tsx
// Prefer semantic class names
<button className="btn-primary">Submit</button>

// Use design tokens
<div className="text-ocean-blue bg-valley-green/10">
  Content
</div>

// Mobile-first responsive
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>
```

## Reference

- See `docs/DESIGN_SYSTEM.md` for complete design system documentation
