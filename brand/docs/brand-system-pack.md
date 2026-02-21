# Nos Ilha Brand System

**Version:** 1.0.0 (Codename: *Ilha das Flores*)

Unified reference for the visual identity, tone, and brand standards of the Nos Ilha ecosystem. For frontend implementation details (tokens, components, code patterns), see [`docs/10-product/design-system.md`](../../docs/10-product/design-system.md).

---

## Mission & Brand Essence

| Element | Description |
|---------|-------------|
| **Mission** | Preserve Brava's cultural memory and connect the global Cape Verdean diaspora through accessible digital storytelling. |
| **Core Values** | Authenticity, Community, Accessibility, Heritage, Sustainability |
| **Tone** | Warm, human, and immersive — educational without formality. |
| **Languages** | English (primary), Portuguese, French. Kriolu planned for future localization. |

**Tagline:** *"Preserving the soul of Brava through design, code, and community."*

---

## Visual Identity

### Design Philosophy

**Brand Essence:** "Clean, inviting, authentic, and lush" — celebrating Brava Island's cultural heritage.

| Principle | Description |
|-----------|-------------|
| **Cultural Authenticity** | Fraunces serif evokes traditional storytelling; Ocean Blue reflects the Atlantic |
| **Content Sovereignty** | UI recedes to let cultural content shine; minimal chrome |
| **Calm Warmth** | Soft shadows, generous radii, breathing whitespace |
| **Progressive Disclosure** | Essential info first; details on demand |

### Primary Color Palette (The Brava Tones)

Primitives are defined in `brand/assets/palette.json` and implemented in `apps/web/src/app/globals.css`.

| Name | HEX | Inspiration |
|------|-----|-------------|
| **Ocean Blue** | `#003F60` | The deep, cold Atlantic waters surrounding the steep cliffs. |
| **Ocean Blue Light** | `#17687D` | Shallow waters and atmospheric perspective. |
| **Ocean Blue Deep** | `#003F60` | Solid ocean blue for dark section backgrounds (newsletter CTA, hero sections). |
| **Valley Green** | `#236436` | The lush, damp vegetation of Faja d'Agua. |
| **Bougainvillea Pink** | `#AE1173` | The vibrant, velvety flowers found in Nova Sintra. |
| **Sobrado Ochre** | `#CD6800` | The warm yellow-orange walls of colonial *Sobrado* houses. |
| **Sunny Yellow** | `#F3BA26` | Warm accent, decorative highlights, call-to-action buttons. |

### The "Bruma" Neutral Scale

Cool, blue-tinted slates that mimic the constant mist (*bruma*) and volcanic rock (*basalt*) instead of generic grays.

| Name | HEX | Usage |
|------|-----|-------|
| **Mist 50** | `#F6F9FC` | Page backgrounds (light mode) |
| **Mist 100** | `#EEF2F6` | Secondary backgrounds, card surfaces |
| **Mist 200** | `#E0E5EB` | Borders, dividers, hover backgrounds |
| **Basalt 500** | `#677284` | Borders, icons, non-text secondary elements |
| **Basalt 600** | `#4C5666` | Secondary text (WCAG AA compliant on light backgrounds) |
| **Basalt 800** | `#202938` | Dark mode backgrounds, strong contrast text |
| **Basalt 900** | `#0E1624` | Primary text, deep contrast |

### Semantic Status Colors

| Name | HEX | Use Case |
|------|-----|----------|
| **Error** | `#F0355D` | Destructive actions (vivid rose) |
| **Success** | `#00B47A` | Confirmation (bright green) |
| **Warning** | `#F49500` | Alerts, warning indicators (bright amber) |

### Accessibility Compliance (WCAG 2.1)

All brand colors are audited for WCAG 2.1 compliance.

#### Text Color Contrast (on Mist 50 background)

| Color | Ratio | AA (4.5:1) | AAA (7:1) | Use For |
|-------|-------|------------|-----------|---------|
| **Basalt 900** | 17.15:1 | PASS | PASS | Primary body text |
| **Ocean Blue** | 10.57:1 | PASS | PASS | Headings, brand text, links |
| **Basalt 600** | 7.02:1 | PASS | PASS | Secondary text (default for UI text) |
| **Bougainvillea Pink** | 6.35:1 | PASS | FAIL | Accent text (large text preferred) |
| **Basalt 500** | 4.60:1 | PASS | FAIL | Borders, icons, non-text elements |
| **Sobrado Ochre** | 3.56:1 | FAIL | FAIL | Icons/graphical objects ONLY |
| **Status Error** | 3.70:1 | FAIL | FAIL | Error icons, non-text indicators |
| **Status Warning** | 2.17:1 | FAIL | FAIL | Warning icons, non-text indicators |
| **Status Success** | 2.54:1 | FAIL | FAIL | Success icons, non-text indicators |

#### Usage Guidelines

- **Basalt 600 (#4C5666):** Default secondary text color. Passes WCAG AA and AAA on Mist 50 and White backgrounds.
- **Basalt 500 (#677284):** Use for borders, icons, and non-text elements. Passes AA for text on Mist 50 only.
- **Sobrado Ochre (#CD6800):** Use for star ratings, icons, and decorative elements only. Meets WCAG 2.1 SC 1.4.11 (Non-text Contrast: 3:1).
- **Status colors:** Use for icons and non-text indicators. For error/warning/success *text*, pair with a darker background or use Basalt 900 text with a colored icon.

---

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| **Primary** | Outfit (Sans-serif) | 400, 500, 600, 700 | Body, UI, navigation. Geometric, brand-focused, clean. |
| **Secondary** | Fraunces (Serif) | 400, 500, 700 | Headings. Variable, old-style, soft. Reflects the literary history of Brava (Eugenio Tavares). |

### Type Scale

| Element | Font | Mobile | Desktop |
|---------|------|--------|---------|
| H1 | Fraunces Bold | `text-4xl` | `text-5xl` / `text-6xl` |
| H2 | Fraunces Bold | `text-3xl` | `text-4xl` |
| H3 | Fraunces Medium | `text-2xl` | `text-3xl` |
| Body | Outfit Regular | `text-base` | `text-lg` |
| Caption | Outfit Regular | `text-sm` | `text-sm` |
| Button | Outfit Semibold | `text-sm` | `text-base` |

Use generous line height (1.6-1.8) and adequate spacing for readability.

---

## Logo System

| Version | Description |
|---------|-------------|
| **v1 (Current)** | Logotype with hibiscus motif. Use on Mist 50 or Ocean Blue backgrounds. Maintain clear space equal to height of "N". |
| **v2 (Planned)** | Integrate Brava Island silhouette beneath or within the "O" to represent the island's geography. |

**Rules:**
- Minimum display height: 24px
- Never distort or apply drop shadows
- For dark backgrounds (Basalt), use the white logotype variant

---

## Imagery & Visual Style

| Element | Guideline |
|---------|-----------|
| **Atmosphere** | Embrace the fog (*Bruma*). Don't over-brighten images. Let the moodiness of the island shine. |
| **Contrast** | High contrast between the dark volcanic rock and the white/pastel houses. |
| **Texture** | Use subtle noise or grain in UI backgrounds to simulate the organic feel of stone/mist. |
| **Framing** | Centered compositions with breathing room. |

Imagery should feel real and emotionally grounded — storytelling through authenticity.

---

## Dark Mode (Volcanic Night)

Dark mode uses custom-tuned values rather than simple inversions. Background colors are deeper than the named basalt palette for true "volcanic night" immersion, while text and border colors are optimized for readability and reduced eye strain.

### Brand Color Adjustments

| Color | Light Mode | Dark Mode | Rationale |
|-------|------------|-----------|-----------|
| **Ocean Blue** | `#003F60` | `#39BBF8` | Sky blue for better contrast on dark backgrounds |
| **Ocean Blue Deep** | `#003F60` | `#00314D` | Deeper ocean for dark section backgrounds |
| **Bougainvillea Pink** | `#AE1173` | `#F36FB8` | Lighter, desaturated pink for reduced eye strain |
| **Brand Text** | `#003F60` | `#7DD4FB` | Light blue for readable brand-colored text |

For the full semantic token mapping (backgrounds, text, borders), see the [Dark Mode section in `docs/10-product/design-system.md`](../../docs/10-product/design-system.md#dark-mode).

---

## Accessibility & Interaction

| Principle | Standard |
|-----------|----------|
| **Contrast Ratio** | Minimum 4.5:1 for text on backgrounds |
| **Motion Preference** | Respect `prefers-reduced-motion` media query |
| **Keyboard Navigation** | All interactive components must support tab focus |
| **Alt Text** | Required for all media assets |
| **Touch Targets** | Minimum 44x44px for mobile interactions |
| **Easing** | Calm, confident motion: `cubic-bezier(0.16, 1, 0.3, 1)` |

Motion is gentle, contextual, and respects user preferences.

---

## Implementation Reference

The frontend design system implements all brand tokens, components, and patterns:

| Topic | Reference |
|-------|-----------|
| **Design tokens, components, code patterns** | [`docs/10-product/design-system.md`](../../docs/10-product/design-system.md) |
| **Color token architecture (OKLCH, Tailwind v4)** | [`docs/10-product/design-system.md` - Color System](../../docs/10-product/design-system.md#color-system) |
| **Component library (22+ components)** | [`docs/10-product/design-system.md` - Components](../../docs/10-product/design-system.md#components) |
| **Interactive gallery (dev only)** | `http://localhost:3000/design-system` |

---

## Versioning & Maintenance

| Item | Convention | Example |
|------|------------|---------|
| **Logo** | `nos-ilha-logo-vX.svg` | `nos-ilha-logo-v1.svg` |
| **Brand Release** | `brand-vX.Y.Z` | `brand-v1.0.0` |

---

## Roadmap

| Area | Status |
|------|--------|
| **Logo v2** | Planned — Add Brava Island silhouette integration |
| **Creative Brand Pack** | Planned — Build storytelling/social version for outreach |
| **Localization** | Planned — Introduce Kriolu tone and translation guidelines |

---

## Maintainers

**Nos Ilha Design & Development Team**

- hello@nosilha.com
- [nosilha.com](https://nosilha.com)
- [GitHub](https://github.com/deznode/nosilha)
