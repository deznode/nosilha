# **Nos Ilha Brand System**

**Version:** 1.0.0 (Codename: *Ilha das Flores*)

**Location:** /brand/docs/brand-system-pack.md

**Purpose:** Unified, developer-friendly reference for the visual identity, tone, and accessibility standards of the Nos Ilha ecosystem.

## **🌍 Overview**

**Nos Ilha** is a community-driven digital platform preserving and celebrating **Brava Island’s cultural heritage**.

This Brand System (v2.0) shifts away from generic digital colors to a palette rooted in the island's unique atmospheric reality: **volcanic basalt**, **Atlantic mist**, **lush valleys**, and **vibrant hibiscus**.

For implementation details, refer to [`DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).

## **🎯 Mission & Brand Essence**

| Element | Description |
| :---- | :---- |
| **Mission** | Preserve Brava’s cultural memory and connect the global Cape Verdean diaspora through accessible digital storytelling. |
| **Core Values** | Authenticity · Community · Accessibility · Heritage · Sustainability |
| **Tone** | Warm, human, and immersive — educational without formality. |
| **Languages** | English (primary), Portuguese, French. Kriolu planned for future localization. |

**Tagline:** “Preserving the soul of Brava through design, code, and community.”

## **🎨 Visual Identity System**

### **Primary Color Palette (The Brava Tones)**

These primitives are defined in palette.json and synced to globals.css.

| Name | Token | HEX | Inspiration |
| :---- | :---- | :---- | :---- |
| **Atlantic Blue** | \--color-ocean-blue | \#0E4C75 | The deep, cold Atlantic waters surrounding the steep cliffs. |
| **Ocean Light** | \--color-ocean-blue-light | \#2A769E | Shallow waters and atmospheric perspective. |
| **Ocean Deep** | \--color-ocean-blue-deep | \#0E4C75 | Solid ocean blue for dark section backgrounds (newsletter CTA, hero sections). Unlike ocean-blue, darkens slightly in dark mode rather than switching to sky blue. |
| **Verde Fajã** | \--color-valley-green | \#2F6E4D | The lush, damp vegetation of Fajã d'Água. |
| **Hibiscus** | \--color-bougainvillea-pink | \#C02669 | The vibrant, velvety flowers found in Nova Sintra (replacing neon pink). |
| **Sobrado Ochre** | \--color-sobrado-ochre | \#D97706 | The warm yellow-orange walls of colonial *Sobrado* houses. |
| **Sunny Yellow** | \--color-sunny-yellow | \#FBBF24 | Warm accent, decorative highlights, call-to-action buttons. |

### **The "Bruma" Neutral Scale**

Instead of standard grays, we use **cool, blue-tinted slates** to mimic the constant mist (*bruma*) and volcanic rock (*basalt*).

| Name | Token | HEX | Usage |
| :---- | :---- | :---- | :---- |
| **Mist 50** | \--color-mist-50 | \#F8FAFC | Page backgrounds (Light Mode). |
| **Mist 100** | \--color-mist-100 | \#F1F5F9 | Secondary backgrounds, card surfaces. |
| **Mist 200** | \--color-mist-200 | \#E2E8F0 | Borders, dividers, hover backgrounds. |
| **Basalt 500** | \--color-basalt-500 | \#64748B | Secondary text, borders, icons. |
| **Basalt 800** | \--color-basalt-800 | \#1E293B | Dark mode backgrounds, strong contrast text. |
| **Basalt 900** | \--color-basalt-900 | \#0F172A | Primary text, deep contrast. |

### **Semantic Status Colors**

| Name | Token | HEX | Use Case |
| :---- | :---- | :---- | :---- |
| **Error** | \--color-status-error | \#BE123C | Destructive actions (Rose-red). |
| **Success** | \--color-status-success | \#15803D | Confirmation (Forest green). |
| **Warning** | \--color-status-warning | \#B45309 | Alerts, warning text (Ochre). |

### **Accessibility Compliance (WCAG 2.1)**

All brand colors have been audited for WCAG 2.1 compliance. See `/brand/docs/accessibility-audit-report.md` for full details.

#### Text Color Contrast (on Mist 50 background)

| Color | Ratio | AA (4.5:1) | AAA (7:1) | Use For |
| :---- | :---- | :---- | :---- | :---- |
| **Basalt 900** | 17.06:1 | PASS | PASS | Primary body text |
| **Atlantic Blue** | 8.69:1 | PASS | PASS | Headings, brand text, links |
| **Basalt 500** | 4.55:1 | PASS | FAIL | Secondary text (Mist 50/White only) |
| **Status Warning** | 4.80:1 | PASS | FAIL | Warning text messages |
| **Hibiscus** | 5.39:1 | PASS | FAIL | Accent text (large text preferred) |
| **Sobrado Ochre** | 3.04:1 | FAIL | FAIL | Icons/graphical objects ONLY |

#### Usage Guidelines

- **Sobrado Ochre (#D97706)**: Use for star ratings, icons, and decorative elements only. Meets WCAG 2.1 SC 1.4.11 (Non-text Contrast: 3:1).
- **Status Warning (#B45309)**: Use for warning text messages. Meets WCAG 2.1 AA (4.5:1).
- **Basalt 500 (#64748B)**: Use for secondary text on Mist 50 or White backgrounds only. Fails on Mist 100 (4.34:1).

## **✍️ Typography**

| Role | Font | Weights | Usage |
| :---- | :---- | :---- | :---- |
| **Primary** | Lato (Sans-serif) | 400, 700 | Body, UI, navigation. Clean and modern. |
| **Secondary** | Merriweather (Serif) | 400, 700, 900 | Headings. Reflects the literary history of Brava (Eugénio Tavares). |

### **Type Scale**

| Class | Size | Example |
| :---- | :---- | :---- |
| text-base | 1rem / 16px | Body text |
| text-lg | 1.125rem | Subheadings |
| text-2xl | 1.5rem | Section titles |
| text-4xl | 2.25rem | Hero headings |

Use generous line height (1.6–1.8) and adequate spacing for readability.

## **🌺 Logo System**

| Version | Description |
| :---- | :---- |
| **v1 (Current)** | Logotype with hibiscus motif. Use on Mist 50 or Ocean Blue backgrounds. Maintain clear space equal to height of “N”. |
| **v2 (Planned)** | Integrate Brava Island silhouette beneath or within the “O” to represent the island’s geography. |

**Rules:** \- Minimum display height: 24px.

* Never distort or apply drop shadows.  
* For dark backgrounds (Basalt), use the white logotype variant.

## **📸 Imagery & Visual Style**

| Element | Guideline |
| :---- | :---- |
| **Atmosphere** | Embrace the *fog* (Bruma). Don't over-brighten images. Let the moodiness of the island shine. |
| **Contrast** | High contrast between the dark volcanic rock and the white/pastel houses. |
| **Texture** | Use subtle noise or grain in UI backgrounds to simulate the organic feel of stone/mist. |
| **Framing** | Centered compositions with breathing room. |

Imagery should feel real and emotionally grounded — storytelling through authenticity.

## **🧱 Tailwind & Design Tokens Summary**

The Nos Ilha frontend uses **Tailwind CSS v4** with semantic tokens defined in globals.css.

**Note:** Tailwind CSS v4 automatically detects `@theme` variables in globals.css via `@import "tailwindcss"`. No explicit color extension is needed in tailwind.config.ts.

Example token usage in components:

```tsx
// Direct class usage
<h1 className="text-ocean-blue">Heading</h1>
<p className="text-basalt-900">Body text</p>
<span className="bg-sobrado-ochre">Icon badge</span>

// With opacity modifier
<div className="bg-ocean-blue/20">Transparent background</div>

// Semantic tokens (dark mode auto-switches)
<p className="text-text-primary">Primary text</p>
<div className="bg-surface">Card surface</div>
```

**Breakpoints:** sm 640px · md 768px · lg 1024px · xl 1280px

Spacing and typography scale align with Tailwind defaults.

For implementation details, refer to [`DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).

## **♿ Accessibility & Dark Mode**

| Principle | Standard |
| :---- | :---- |
| **Contrast Ratio** | Minimum 4.5:1 for text on backgrounds |
| **Motion Preference** | Respect prefers-reduced-motion media query |
| **Keyboard Navigation** | All interactive components must support tab focus |
| **Alt Text** | Required for all media assets |
| **Dark Mode** | Uses **Basalt/Volcanic Night** variants to maintain tone consistency |

## **💫 Motion & Interaction**

| Animation | Purpose |
| :---- | :---- |
| fog-flow | Background atmospheric drift (Mist effect) |
| glow | Subtle hover highlight for buttons and links |
| slide-up | Section or card reveal on scroll |
| fade-in | Page load or image reveal |

Motion is gentle, contextual, and respects user preferences.

## **🧩 Components & Layout**

| Component | Description |
| :---- | :---- |
| DirectoryCard | Displays cultural or business directory entries |
| PageHeader | Hero and section headers with responsive scaling |
| ThemeToggle | Manages light/dark mode switching |
| StarRating | Displays review ratings using **Sobrado Ochre** |

All components inherit brand color tokens, typography, and spacing rules from Tailwind.

## **🪶 Versioning & Maintenance**

| Item | Rule | Example |
| :---- | :---- | :---- |
| **Logo** | nos-ilha-logo-vX.svg | nos-ilha-logo-v1.svg |
| **Template** | \[platform\]-\[layout\]-vX | instagram-carousel-v1 |
| **Brand Release** | brand-vX.Y.Z | brand-v1.0.0 |

Track updates in /docs/changelog.md and tag releases using GitHub’s versioning tools.

## **🚀 Future Roadmap**

| Area | Planned Update |
| :---- | :---- |
| **Logo v2** | Add Brava Island silhouette integration |
| **Typography** | Explore variable fonts for performance |
| **Creative Brand Pack** | Build storytelling/social version for outreach |
| **Localization** | Introduce Kriolu tone and translation guidelines |
| **Design Token Automation** | ✅ Completed (v2.0 Sync Script) |

## **📬 Maintainers**

**Nos Ilha Design & Development Team** 📧 [hello@nosilha.com](mailto:hello@nosilha.com)

🌐 [nosilha.com](https://nosilha.com)

🔗 [GitHub: Nos Ilha Repository](https://github.com/nosilha)

For version history and release notes, see

[CHANGELOG.md](https://www.google.com/search?q=../CHANGELOG.md)

*“Preserving the soul of Brava through design, code, and community.”*