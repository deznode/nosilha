---
slug: tailwindcss-v4-color-tokens
title: Tailwind CSS v4 Color Token Systems and Design Patterns
aliases: [tailwind-v4-theme, tailwind-colors, tailwind-design-tokens, tailwind-v4-dark-mode]
tags: [tailwindcss, tailwind-v4, design-tokens, color-systems, theme-directive, dark-mode, css-variables, design-systems, semantic-naming, oklch, nextjs, frontend]
researched_at: 2026-01-22T00:00:00.000Z
promoted_at: 2026-01-23T00:00:00.000Z
sources:
  - url: https://tailwindcss.com/docs/theme
    title: Official Tailwind CSS v4 Theme Variables Documentation
  - url: https://tailwindcss.com/docs/customizing-colors
    title: Official Tailwind CSS v4 Colors Documentation
  - url: https://tailwindcss.com/blog/tailwindcss-v4
    title: Tailwind CSS v4.0 Release Announcement
  - url: https://tailkits.com/blog/tailwind-v4-custom-colors
    title: Tailwind v4 Colors - Add & Customize Fast
  - url: https://github.com/zard-ui/zardui
    title: Zard UI - Production v4 Implementation
  - url: https://github.com/tambo-ai/tambo
    title: Tambo AI - Oklch Color System Example
  - url: https://github.com/unovue/shadcn-vue
    title: shadcn-vue - Tailwind v4 Migration Guide
---

<!-- ==================== TEAM-NOTES ==================== -->
<!-- Add project-specific notes, decisions, and context here. -->
<!-- This section is preserved when research is refreshed. -->

## Team Notes

_No team notes yet. Add project-specific decisions and context here._

<!-- ==================== END TEAM-NOTES ==================== -->

<!-- ==================== AUTO-GENERATED ==================== -->
<!-- This section is automatically updated when research is refreshed. -->
<!-- Do not edit manually - changes will be overwritten. -->

# Tailwind CSS v4 Color Token Systems and Design Patterns

## Overview

Tailwind CSS v4, released January 22, 2025, represents a fundamental shift in how design tokens are defined and managed. The new **CSS-first configuration** approach using the `@theme` directive replaces the JavaScript-based `tailwind.config.js` pattern from v3, offering better performance (5x faster full builds, 100x faster incremental builds) and native CSS integration.

**Key paradigm shift**: Instead of defining colors in JavaScript configuration files, Tailwind v4 treats CSS custom properties as the single source of truth, leveraging modern CSS features like cascade layers, `@property` registration, and `color-mix()`.

This research covers the five critical aspects of implementing color token systems in Tailwind CSS v4 for modern Next.js applications.

## Key Concepts

### The @theme Directive

The `@theme` directive is v4's central mechanism for defining design tokens that generate Tailwind utility classes. Unlike regular CSS custom properties, theme variables:

1. **Generate utility classes automatically** - `--color-primary` creates `bg-primary`, `text-primary`, etc.
2. **Must be defined at the top level** - Cannot be nested within selectors
3. **Use specific namespaces** - `--color-*`, `--font-*`, `--breakpoint-*`, etc.
4. **Support two forms**:
   - **`@theme` block**: Direct definition of design tokens
   - **`@theme inline`**: References to existing CSS variables

### Color Format: OKLCH

Tailwind v4 strongly favors the **OKLCH color space** (Oklab Lightness Chroma Hue):

```css
--color-primary: oklch(0.31 0.02 281);
/* Format: oklch(lightness chroma hue) */
/* lightness: 0-1, chroma: 0-0.4, hue: 0-360 */
```

**Why OKLCH?**
- Perceptually uniform (equal changes = equal visual differences)
- Better color interpolation than HSL/RGB
- Wider color gamut support
- Consistent lightness across hues
- Native browser support in modern browsers

**Alternative: HSL via hsl() function**
```css
--color-primary: hsl(220 100% 50%);
/* Format: hsl(hue saturation lightness) */
```

### Namespace Convention

Tailwind v4 uses specific prefixes to determine utility class generation:

| Namespace | Generates | Example |
|-----------|-----------|---------|
| `--color-*` | Color utilities | `--color-primary` → `bg-primary`, `text-primary` |
| `--font-*` | Font utilities | `--font-display` → `font-display` |
| `--breakpoint-*` | Responsive breakpoints | `--breakpoint-3xl` → `3xl:` modifier |
| `--radius-*` | Border radius | `--radius-lg` → `rounded-lg` |

## Patterns & Best Practices

### 1. @theme Directive: Two Recommended Patterns

#### Pattern A: Two-Tier Semantic System (Recommended for Design Systems)

This is the **industry-standard pattern** used by shadcn/ui, Zard UI, and other production design systems:

```css
@import 'tailwindcss';

/* Tier 1: Raw semantic variables in :root and .dark */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.31 0.02 281);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.54 0.027 261);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.92 0 260);
  --muted-foreground: oklch(0.73 0.022 260);
  --accent: oklch(0.97 0 286);
  --accent-foreground: oklch(0.21 0 286);
  --destructive: oklch(0.64 0.2 25);
  --border: oklch(0.93 0 242);
  --input: oklch(0.92 0 286);
  --ring: oklch(0.14 0 285);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

/* Tier 2: Tailwind mappings with @theme inline */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

/* Custom dark mode variant */
@custom-variant dark (&:is(.dark *));

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Why this pattern?**
- **Separation of concerns**: Raw values separate from Tailwind utilities
- **Runtime flexibility**: Change colors via JavaScript by updating CSS variables
- **Framework agnostic**: Raw variables work outside Tailwind contexts
- **Type safety**: Can generate TypeScript types from variable names
- **Testing**: Easier to test color values independently

#### Pattern B: Direct @theme Definition (Simpler Projects)

For smaller projects or when you don't need runtime CSS variable manipulation:

```css
@import 'tailwindcss';

@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.31 0.02 281);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-neon-pink: oklch(71.7% 0.25 360);
  --color-neon-lime: oklch(91.5% 0.258 129);
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
}

/* Dark mode via media query */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: oklch(0.145 0 0);
    --color-foreground: oklch(0.985 0 0);
    --color-primary: oklch(0.922 0 0);
    --color-primary-foreground: oklch(0.205 0 0);
  }
}
```

**When to use:**
- Prototype projects
- Static sites without theme switching
- Simple color palettes
- When you prefer configuration simplicity

### 2. Semantic vs Functional Color Naming

**Strong industry consensus: Use semantic naming in v4.**

#### Semantic Naming (Recommended)

Semantic tokens describe **purpose** rather than appearance:

```css
:root {
  /* Layout semantics */
  --background: oklch(1 0 0);      /* Page background */
  --foreground: oklch(0.145 0 0);   /* Primary text */
  --card: oklch(1 0 0);             /* Card background */
  --card-foreground: oklch(0.145 0 0); /* Card text */

  /* Action semantics */
  --primary: oklch(0.31 0.02 281);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.54 0.027 261);
  --secondary-foreground: oklch(1 0 0);

  /* State semantics */
  --destructive: oklch(0.64 0.2 25);
  --destructive-foreground: oklch(0.985 0 0);
  --success: oklch(0.72 0.15 142);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.72 0.15 60);
  --warning-foreground: oklch(0.14 0 285);

  /* UI element semantics */
  --muted: oklch(0.92 0 260);
  --muted-foreground: oklch(0.73 0.022 260);
  --accent: oklch(0.97 0 286);
  --accent-foreground: oklch(0.21 0 286);
  --border: oklch(0.93 0 242);
  --input: oklch(0.92 0 286);
  --ring: oklch(0.14 0 285);  /* Focus ring */
}
```

**Benefits:**
- **Rebrandable**: Change visual style without touching component code
- **Intent clarity**: `bg-destructive` clearly signals danger
- **Accessibility**: Enforces foreground/background pairs
- **Consistent theming**: Dark mode switches naturally
- **Component-agnostic**: Not tied to specific UI patterns

**Standard semantic token set** (from shadcn/ui pattern):
- `background` / `foreground` - Page-level
- `card` / `card-foreground` - Card containers
- `popover` / `popover-foreground` - Floating elements
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subtle elements
- `accent` / `accent-foreground` - Highlighted elements
- `destructive` / `destructive-foreground` - Dangerous actions
- `border`, `input`, `ring` - UI chrome

#### Functional Naming (Avoid in v4 Design Systems)

Functional tokens describe **appearance**:

```css
/* Avoid this pattern in v4 */
:root {
  --ocean-blue-50: oklch(0.97 0.01 240);
  --ocean-blue-500: oklch(0.55 0.15 240);
  --ocean-blue-900: oklch(0.20 0.10 240);
  --mist-gray-100: oklch(0.95 0 0);
  --sunset-orange-600: oklch(0.65 0.20 40);
}
```

**Why avoid?**
- Breaks dark mode abstraction (what's "blue-900" in dark mode?)
- No semantic meaning (when to use "ocean-blue" vs "sunset-orange"?)
- Couples design to implementation
- Hard to rebrand without code changes

**Exception: Brand colors**
You can define functional brand colors as a base layer:

```css
:root {
  /* Brand colors (functional) */
  --brand-ocean-500: oklch(0.55 0.15 240);
  --brand-sunset-600: oklch(0.65 0.20 40);

  /* Semantic mapping */
  --primary: var(--brand-ocean-500);
  --accent: var(--brand-sunset-600);
}
```

### 3. Dark Mode Color Switching: CSS Variable Pattern

**Recommended approach: Define theme-specific values in `:root` and `.dark`, reference via `@theme inline`.**

#### Complete Dark Mode Implementation

```css
@import 'tailwindcss';

/* Define custom dark mode variant */
@custom-variant dark (&:is(.dark *));

/* Light theme (default) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.31 0.02 281);
  --primary-foreground: oklch(0.98 0 0);
  --border: oklch(0.93 0 242);
  /* ... all semantic colors ... */
}

/* Dark theme */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);  /* With opacity */
  /* ... all semantic colors ... */
}

/* Map to Tailwind utilities */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  /* ... all mappings ... */
}

/* Smooth transitions */
@layer base {
  * {
    transition: background-color 0.2s ease-in-out,
                border-color 0.2s ease-in-out,
                color 0.2s ease-in-out;
  }
}
```

#### Dark Mode Variant Syntax

**v4 uses `@custom-variant` for dark mode:**

```css
/* Recommended: Class-based with descendant selector */
@custom-variant dark (&:is(.dark *));
```

This generates utilities like `dark:bg-background` that apply when any ancestor has the `.dark` class.

**Alternative: Media query-based**

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: oklch(0.145 0 0);
    /* ... */
  }
}
```

**Usage in Components:**

```tsx
// Next.js with next-themes
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>
```

Colors automatically switch based on `.dark` class on `<html>` element - no `dark:` prefix needed when using semantic tokens!

**When you need explicit dark overrides:**

```tsx
<div className="bg-muted dark:bg-muted/50">
  {/* Reduce opacity in dark mode */}
</div>
```

#### JavaScript Theme Switching (Next.js 16)

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Token Hierarchy Patterns

**Modern v4 pattern: Two-tier flat structure, not multi-layer pyramids.**

#### Recommended: Two-Tier Semantic System

```
┌─────────────────────────────────────────┐
│ Tier 1: Raw Semantic Variables          │
│ (:root, .dark, [data-theme])            │
│                                         │
│ --background, --foreground,             │
│ --primary, --secondary, --muted, etc.   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Tier 2: Tailwind Utility Mappings       │
│ (@theme inline)                         │
│                                         │
│ --color-background: var(--background)   │
│ --color-primary: var(--primary)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Generated Utilities                     │
│                                         │
│ bg-background, text-primary,            │
│ border-border, etc.                     │
└─────────────────────────────────────────┘
```

#### Avoid: Multi-Layer Brand → Semantic → Component

```css
/* Don't do this in v4 */
:root {
  /* Layer 1: Brand palette */
  --brand-blue-500: oklch(...);
  --brand-gray-100: oklch(...);

  /* Layer 2: Semantic aliases */
  --semantic-primary: var(--brand-blue-500);
  --semantic-surface: var(--brand-gray-100);

  /* Layer 3: Component tokens */
  --button-bg: var(--semantic-primary);
  --card-bg: var(--semantic-surface);
}

@theme inline {
  /* Layer 4: Tailwind mapping */
  --color-button-bg: var(--button-bg);
}
```

**Why avoid?**
- Unnecessary indirection
- Confusing debugging (which layer is wrong?)
- Performance overhead
- Hard to maintain

**Better: Flat semantic tokens**

```css
/* Do this instead */
:root {
  --primary: oklch(0.55 0.15 240);     /* Direct semantic value */
  --surface: oklch(0.95 0 0);
}

@theme inline {
  --color-primary: var(--primary);     /* Single mapping layer */
  --color-surface: var(--surface);
}
```

#### Domain-Specific Extensions

For specialized applications (like cultural heritage sites), extend the semantic base with domain tokens:

```css
:root {
  /* Standard semantic tokens */
  --background: oklch(1 0 0);
  --primary: oklch(0.31 0.02 281);

  /* Domain-specific semantic tokens */
  --heritage: oklch(0.55 0.15 30);      /* Warm earthy tone */
  --heritage-foreground: oklch(0.98 0 0);
  --culture: oklch(0.60 0.12 200);      /* Ocean reference */
  --culture-foreground: oklch(0.98 0 0);
  --nature: oklch(0.65 0.18 140);       /* Green landscapes */
  --nature-foreground: oklch(0.14 0 285);
}

@theme inline {
  --color-heritage: var(--heritage);
  --color-heritage-foreground: var(--heritage-foreground);
  --color-culture: var(--culture);
  --color-culture-foreground: var(--culture-foreground);
  --color-nature: var(--nature);
  --color-nature-foreground: var(--nature-foreground);
}
```

### 5. Documentation Approach

#### Structure for Design System Docs

```markdown
# Color System

## Overview

Our color system uses semantic tokens that automatically adapt to light and dark modes. All colors are defined in the OKLCH color space for perceptual uniformity.

## Color Tokens

### Background & Foreground

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | oklch(1 0 0) | oklch(0.145 0 0) | Page background |
| `foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | Primary text |

**Usage:**
\`\`\`tsx
<div className="bg-background text-foreground">
  Content
</div>
\`\`\`

### Primary Actions

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | oklch(0.31 0.02 281) | oklch(0.922 0 0) | Primary buttons, links |
| `primary-foreground` | oklch(0.98 0 0) | oklch(0.205 0 0) | Text on primary |

**Usage:**
\`\`\`tsx
<button className="bg-primary text-primary-foreground">
  Submit
</button>
\`\`\`

### State Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `destructive` | oklch(0.64 0.2 25) | oklch(0.704 0.191 22.216) | Delete, errors |
| `success` | oklch(0.72 0.15 142) | oklch(0.72 0.18 145) | Success states |
| `warning` | oklch(0.72 0.15 60) | oklch(0.75 0.18 65) | Warnings |

## Implementation

### Setup

Add to your `globals.css`:

\`\`\`css
@import 'tailwindcss';

:root {
  --background: oklch(1 0 0);
  /* ... all tokens ... */
}

.dark {
  --background: oklch(0.145 0 0);
  /* ... all tokens ... */
}

@theme inline {
  --color-background: var(--background);
  /* ... all mappings ... */
}
\`\`\`

### Dark Mode Toggle

\`\`\`tsx
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  )
}
\`\`\`

## Accessibility

All color pairs meet WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

Test contrast ratios at https://accessiblepalette.com/
```

#### Visual Documentation Tools

**Color Palette Generator:**

```tsx
// Generate color palette documentation
const colorTokens = [
  { name: 'background', light: 'oklch(1 0 0)', dark: 'oklch(0.145 0 0)' },
  { name: 'primary', light: 'oklch(0.31 0.02 281)', dark: 'oklch(0.922 0 0)' },
  // ...
]

export function ColorPaletteDoc() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {colorTokens.map(token => (
        <div key={token.name}>
          <h3>{token.name}</h3>
          <div className="flex gap-2">
            <div
              className="w-20 h-20 rounded"
              style={{ background: token.light }}
            />
            <div
              className="w-20 h-20 rounded"
              style={{ background: token.dark }}
            />
          </div>
          <code className="text-xs">{token.light}</code>
        </div>
      ))}
    </div>
  )
}
```

## Implementation Guidance

### Migration from v3 to v4

#### Before (v3 - tailwind.config.js)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      }
    }
  }
}
```

#### After (v4 - globals.css)

```css
@import 'tailwindcss';

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.15 240);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.70 0.15 240);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
}
```

### Converting HSL to OKLCH

Use online converters or browser DevTools:

```js
// HSL to OKLCH conversion example
// hsl(220, 100%, 50%) → oklch(0.55 0.313 264)

// In browser console:
const hsl = 'hsl(220, 100%, 50%)'
const div = document.createElement('div')
div.style.color = hsl
document.body.appendChild(div)
const computed = getComputedStyle(div).color // rgb(0, 68, 255)
// Use color picker to convert to OKLCH
```

**Tools:**
- https://oklch.com/ - Interactive OKLCH color picker
- https://colorjs.io/apps/convert/ - Color space converter

### Next.js 16 App Router Setup

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My App',
  description: 'With Tailwind v4 colors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```css
/* app/globals.css */
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.31 0.02 281);
  --primary-foreground: oklch(0.98 0 0);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-lg: var(--radius);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Component Usage Patterns

```tsx
// Semantic token usage (no dark: prefix needed)
<Card className="bg-card text-card-foreground">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
  <Button className="bg-primary text-primary-foreground">
    Action
  </Button>
</Card>

// Explicit dark overrides when needed
<div className="bg-accent/50 dark:bg-accent/20">
  Subtle in light, more subtle in dark
</div>

// Domain-specific tokens
<article className="border-l-4 border-heritage">
  <h3 className="text-heritage">Cultural Heritage Site</h3>
</article>
```

## Trade-offs & Considerations

### When to Use CSS-First v4 Approach

**Best for:**
- Modern Next.js/React applications
- Design systems requiring runtime theme switching
- Applications with dark mode
- Teams comfortable with CSS custom properties
- Projects prioritizing build performance
- Applications needing multiple themes

**Consider v3 patterns if:**
- Legacy browser support required (IE11)
- Team unfamiliar with CSS variables
- Static color palette with no theming needs
- Migration costs outweigh benefits

### OKLCH vs HSL

**Use OKLCH when:**
- Building new design systems
- Color interpolation is important (gradients, animations)
- Wide color gamut needed
- Consistent perceived brightness required

**Use HSL when:**
- Migrating existing HSL-based system
- Team familiarity with HSL
- Simpler mental model preferred
- Legacy browser support needed

**Browser support:**
- OKLCH: Chrome 111+, Safari 15.4+, Firefox 113+
- HSL: Universal support

### Semantic vs Functional Naming Trade-off

| Aspect | Semantic | Functional |
|--------|----------|------------|
| Rebranding | Easy | Hard |
| Dark mode | Natural | Complex |
| Learning curve | Higher (intent) | Lower (visual) |
| Type safety | Better | Worse |
| Component clarity | Higher | Lower |
| Initial setup | More planning | Faster |

### Performance Considerations

**CSS Variables have minimal overhead:**
- v4 generates optimized utility classes
- Runtime switching is instant (no rebuild)
- Browser-native feature (well optimized)

**Build performance:**
- v4 is 5x faster than v3 for full builds
- 100x faster for incremental builds
- Smaller CSS output with tree-shaking

## References

### Official Documentation
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - Official theme configuration guide
- [Tailwind CSS v4 Colors](https://tailwindcss.com/docs/customizing-colors) - Color customization documentation
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) - Launch announcement and new features

### Real-World Implementations
- [shadcn-vue Tailwind v4 Migration](https://github.com/unovue/shadcn-vue/blob/main/apps/www/src/content/docs/tailwind-v4.md) - Production migration guide
- [Zard UI v4 Implementation](https://github.com/zard-ui/zardui) - Complete design system example
- [Tambo AI OKLCH System](https://github.com/tambo-ai/tambo) - OKLCH color implementation

### Tutorials & Guides
- [Tailwind v4 Custom Colors Tutorial](https://tailkits.com/blog/tailwind-v4-custom-colors) - Step-by-step customization guide
- [Medium: @theme Directive Guide](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06) - Design token patterns

### Tools
- [OKLCH Color Picker](https://oklch.com/) - Interactive color space explorer
- [Color.js Converter](https://colorjs.io/apps/convert/) - Multi-format color conversion
- [Accessible Palette](https://accessiblepalette.com/) - WCAG contrast checker

### Related Technologies
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme switching for Next.js
- [CSS @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) - Registered custom properties
- [CSS color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) - Native color mixing

<!-- ==================== END AUTO-GENERATED ==================== -->
