---
paths: apps/web/**
---

# Frontend Design System & Styling

## Documentation

See `docs/design-system.md` for comprehensive styling guide.

## Brand Identity

**"Clean, inviting, authentic, and lush"** - digital extension of Brava Island

## Color Palette (Quick Reference)

| Color | Usage |
|-------|-------|
| Ocean Blue (`#0e4c75`) | Primary actions, links |
| Valley Green (`#2f6e4d`) | Success states |
| Bougainvillea Pink (`#D90368`) | Accents |
| Sunny Yellow (`#F7B801`) | Warnings, CTAs |

## Semantic Tokens (Preferred)

| Token | Usage |
|-------|-------|
| `bg-surface` | Cards, sidebars |
| `text-body` | Main text |
| `text-muted` | Secondary text |
| `border-hairline` | Light dividers |

## Typography

- **Headings**: Fraunces (serif)
- **Body**: Outfit (sans-serif)

## Component Library

### Catalyst UI (9 components)

Button, Input, InputGroup, Checkbox, Fieldset, Dialog, Dropdown, Popover, Badge

### Custom UI Components

Key components in `components/ui/`: Card, DirectoryCard, PageHeader, ThemeToggle, Avatar, Tooltip, MobileBottomNav, Select, Textarea, Toast, TabGroup

## Design Principles

- Mobile-first responsive
- Dark mode via CSS variables
- WCAG 2.1 AA accessibility

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | Global styles, CSS variables |
| `apps/web/tailwind.config.ts` | Tailwind configuration |
| `apps/web/src/components/ui/` | Custom UI components |
| `apps/web/src/components/catalyst-ui/` | Catalyst UI (9 retained) |

## Reference

- See `docs/design-system.md` for complete design system documentation
- See `docs/design-system.md#form-patterns` for React Hook Form + Zod patterns
