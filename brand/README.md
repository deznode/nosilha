# Nos Ilha — Brand System

> **Version:** 1.0.0
>
> Centralized home for all visual identity assets and brand documentation used across the Nos Ilha ecosystem.

## Purpose

The **Nos Ilha Brand System** defines how our cultural heritage mission translates into consistent visual and tonal design across all platforms.

It ensures:
- A unified brand presence on web, social, and print
- Consistency between designers, developers, and contributors
- Easy scalability for future updates and localization

## Directory Structure

```
brand/
├── assets/                        # Logos, color palette
│   ├── nos-ilha-logo-v1.svg       # Current logo
│   └── palette.json               # Brand color primitives
├── docs/
│   └── brand-system-pack.md       # Brand identity guide
└── README.md                      # This file
```

## Core Documentation

**[Nos Ilha Brand System Pack](./docs/brand-system-pack.md)** — The identity reference covering:
- Brand mission, values & tone
- Color palette (The Brava Tones + Bruma neutrals)
- Typography (Outfit + Fraunces)
- Logo and imagery guidelines
- Accessibility & WCAG compliance
- Dark mode (Volcanic Night) adjustments

For frontend implementation (design tokens, components, code patterns), see [`docs/10-product/design-system.md`](../docs/10-product/design-system.md).

## Versioning

| Type | Convention | Example |
|------|------------|---------|
| **Brand Release** | `brand-vX.Y.Z` | `brand-v1.0.0` |
| **Logo Update** | `nos-ilha-logo-vX.svg` | `nos-ilha-logo-v1.svg` |
