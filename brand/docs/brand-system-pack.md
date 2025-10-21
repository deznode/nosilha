# Nos Ilha Brand System

> **Version:** 1.0.0  
> **Location:** `/brand/docs/brand-system-pack.md`  
> **Purpose:** Unified, developer-friendly reference for the visual identity, tone, and accessibility standards of the Nos Ilha ecosystem.

---

## 🌍 Overview
**Nos Ilha** is a community-driven digital platform preserving and celebrating **Brava Island’s cultural heritage**.  
This Brand System defines how the island’s identity is expressed visually and tonally across all media—web, print, and community channels.

This document complements the technical implementation guide in [`DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).

---

## 🎯 Mission & Brand Essence
| Element | Description |
|----------|--------------|
| **Mission** | Preserve Brava’s cultural memory and connect the global Cape Verdean diaspora through accessible digital storytelling. |
| **Core Values** | Authenticity · Community · Accessibility · Heritage · Sustainability |
| **Tone** | Warm, human, and immersive — educational without formality. |
| **Languages** | English (primary), Portuguese, French. Kriolu planned for future localization. |

> **Tagline:** “Preserving the soul of Brava through design, code, and community.”

---

## 🎨 Visual Identity System

### Primary Color Palette
| Name | Token | HEX | Usage |
|------|--------|-----|--------|
| Ocean Blue | `--color-ocean-blue` | `#005A8D` | Primary brand, navigation, CTAs |
| Valley Green | `--color-valley-green` | `#3E7D5A` | Secondary brand, success states |
| Bougainvillea Pink | `--color-bougainvillea-pink` | `#D90368` | Accents, highlights, notifications |
| Sunny Yellow | `--color-sunny-yellow` | `#F7B801` | Cheerful accents, warning states |
| Off White | `--color-off-white` | `#F8F9FA` | Backgrounds |
| Volcanic Gray | `--color-volcanic-gray` | `#6C757D` | Secondary text |
| Volcanic Gray Dark | `--color-volcanic-gray-dark` | `#343A40` | Primary text |

### Accent Colors
| Name | HEX | Use Case |
|------|------|-----------|
| Error | `#DC2626` | Alerts, destructive actions |
| Success | `#059669` | Confirmation messages |
| Warning | `#D97706` | Warnings, notices |

---

## ✍️ Typography
| Role | Font | Weights | Usage |
|------|-------|----------|--------|
| **Primary** | Lato (Sans-serif) | 400, 700 | Body, UI, navigation |
| **Secondary** | Merriweather (Serif) | 400, 700, 900 | Headings, titles, long-form stories |

### Type Scale
| Class | Size | Example |
|--------|-------|----------|
| `text-base` | 1rem / 16px | Body text |
| `text-lg` | 1.125rem | Subheadings |
| `text-2xl` | 1.5rem | Section titles |
| `text-4xl` | 2.25rem | Hero headings |

> Use generous line height (1.6–1.8) and adequate spacing for readability.

---

## 🌺 Logo System
| Version | Description |
|----------|--------------|
| **v1 (Current)** | Logotype with hibiscus motif. Use on Off White or Ocean Blue backgrounds. Maintain clear space equal to height of “N”. |
| **v2 (Planned)** | Integrate Brava Island silhouette beneath or within the “O” to represent the island’s geography. |

**Rules:**  
- Minimum display height: 24px.  
- Never distort or apply drop shadows.  
- For dark backgrounds, use the white logotype variant.

---

## 📸 Imagery & Visual Style
| Element | Guideline |
|----------|------------|
| **Tone** | Warm, natural light, authentic representation of Brava’s people and landscapes. |
| **Subjects** | Architecture, crafts, festivals, local artisans, ocean and mountain views. |
| **Editing** | Minimal filters; color-correct for realism. |
| **Framing** | Centered compositions with breathing room. |

> Imagery should feel real and emotionally grounded — storytelling through authenticity.

---

## 🧱 Tailwind & Design Tokens Summary
The Nos Ilha frontend uses **Tailwind CSS v4** with semantic tokens defined in `globals.css` and mapped in `tailwind.config.ts`.

Example:
```ts
extend: {
  colors: {
    'ocean-blue': 'var(--color-ocean-blue)',
    'valley-green': 'var(--color-valley-green)',
    'bougainvillea-pink': 'var(--color-bougainvillea-pink)',
  },
  fontFamily: {
    sans: ['Lato', 'sans-serif'],
    serif: ['Merriweather', 'serif'],
  },
}
```

**Breakpoints:** `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px  
Spacing and typography scale align with Tailwind defaults.

For implementation details, refer to [`DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).

---

## ♿ Accessibility & Dark Mode
| Principle | Standard |
|------------|-----------|
| **Contrast Ratio** | Minimum 4.5:1 for text on backgrounds |
| **Motion Preference** | Respect `prefers-reduced-motion` media query |
| **Keyboard Navigation** | All interactive components must support tab focus |
| **Alt Text** | Required for all media assets |
| **Dark Mode** | Uses desaturated variants to maintain tone consistency |

---

## 💫 Motion & Interaction
| Animation | Purpose |
|------------|----------|
| `glow` | Subtle hover highlight for buttons and links |
| `slide-up` | Section or card reveal on scroll |
| `fade-in` | Page load or image reveal |

> Motion is gentle, contextual, and respects user preferences.

---

## 🧩 Components & Layout
| Component | Description |
|------------|--------------|
| `DirectoryCard` | Displays cultural or business directory entries |
| `PageHeader` | Hero and section headers with responsive scaling |
| `ThemeToggle` | Manages light/dark mode switching |
| `StarRating` | Displays review ratings for local listings |

All components inherit brand color tokens, typography, and spacing rules from Tailwind.

---

## 🪶 Versioning & Maintenance
| Item | Rule | Example |
|------|-------|----------|
| **Logo** | `nos-ilha-logo-vX.svg` | `nos-ilha-logo-v1.svg` |
| **Template** | `[platform]-[layout]-vX` | `instagram-carousel-v1` |
| **Brand Release** | `brand-vX.Y.Z` | `brand-v1.0.0` |

Track updates in `/docs/changelog.md` and tag releases using GitHub’s versioning tools.

---

## 🚀 Future Roadmap
| Area | Planned Update |
|-------|----------------|
| **Logo v2** | Add Brava Island silhouette integration |
| **Typography** | Explore variable fonts for performance |
| **Creative Brand Pack** | Build storytelling/social version for outreach |
| **Localization** | Introduce Kriolu tone and translation guidelines |
| **Design Token Automation** | Sync Tailwind tokens with palette.json |

---

## 📬 Maintainers
**Nos Ilha Design & Development Team**  
📧 [hello@nosilha.com](mailto:hello@nosilha.com)  
🌐 [nosilha.com](https://nosilha.com)  
🔗 [GitHub: Nos Ilha Repository](https://github.com/nosilha)

---

---

For version history and release notes, see  
[`CHANGELOG.md`](../CHANGELOG.md)

> *“Preserving the soul of Brava through design, code, and community.”*


