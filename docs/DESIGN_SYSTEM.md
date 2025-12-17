# Nos Ilha Design System Documentation

This document provides comprehensive guidance for the Nos Ilha frontend design system, covering brand identity, component library, styling patterns, and implementation guidelines.

## 🎨 Brand Identity & Design Philosophy

### Design Vision
**"Clean, inviting, authentic, and lush"** - The design system embodies the digital extension of Brava Island itself, capturing its natural beauty, cultural richness, and authentic character.

### Core Aesthetic Principles
- **Authentic**: Reflects the genuine character and heritage of Brava Island
- **Inviting**: Welcomes users with warm, approachable design elements
- **Clean**: Maintains clarity and simplicity for excellent user experience
- **Lush**: Incorporates the vibrant, natural beauty of Cape Verde's landscape

## 🌈 Color System

### Modern Semantic Color Architecture

Our color system uses **Tailwind CSS v4** with a semantic token approach that automatically handles light/dark mode transitions. Colors are organized into three categories:

1. **Brand Colors**: Inspired by Brava's natural landscape
2. **Semantic Tokens**: Context-aware colors for UI elements
3. **Accent Colors**: State-specific colors for feedback

```css
/* Brand System V1.0.0 "Ilha das Flores" - globals.css */
@theme {
  /* === BRAND COLOR PALETTE === */

  /* Primary Brand Colors */
  --color-ocean-blue: #0E4C75;
  --color-ocean-blue-light: #2A769E;
  --color-valley-green: #2F6E4D;
  --color-bougainvillea-pink: #C02669;
  --color-sobrado-ochre: #D97706;  /* Replaces sunny-yellow */

  /* Bruma Neutral Scale (Mist/Basalt) - Slate palette */
  --color-mist-50: #f8fafc;
  --color-mist-100: #f1f5f9;
  --color-mist-200: #e2e8f0;
  --color-basalt-500: #64748b;
  --color-basalt-800: #1e293b;
  --color-basalt-900: #0f172a;

  /* Legacy aliases (for backward compatibility) */
  --color-off-white: var(--color-mist-50);

  /* Status Colors */
  --color-status-error: #be123c;
  --color-status-success: #15803d;
  --color-status-warning: #b45309;

  /* Accent Colors for UI States (aliases) */
  --color-accent-error: var(--color-status-error);
  --color-accent-success: var(--color-status-success);
  --color-accent-warning: var(--color-status-warning);

  /* === SEMANTIC ALIASES ("Semantic Structure, Branded Soul") === */
  /* Use these for layouts - dark mode switches automatically */

  /* Backgrounds */
  --color-canvas: var(--color-bg-primary);       /* Page background */
  --color-surface: var(--color-bg-secondary);    /* Cards, sidebars */
  --color-surface-alt: var(--color-bg-tertiary); /* Hover states */

  /* Text */
  --color-body: var(--color-text-primary);       /* Main reading text */
  --color-muted: var(--color-text-secondary);    /* Metadata, captions */
  --color-brand: var(--color-text-brand);        /* Brand-colored text */

  /* Borders */
  --color-hairline: var(--color-border-subtle);  /* Light dividers */
  --color-edge: var(--color-border-strong);      /* Strong borders */

  /* === BACKWARD COMPATIBILITY ALIASES === */
  --color-background-primary: var(--color-canvas);
  --color-background-secondary: var(--color-surface);
  --color-background-tertiary: var(--color-surface-alt);
  --color-border-primary: var(--color-edge);
}

@layer theme {
  :root, :host {
    @variant dark {
      /* "Volcanic Night" Dark Mode Palette */
      --color-bg-primary: var(--color-basalt-900);
      --color-bg-secondary: var(--color-basalt-800);
      --color-text-primary: var(--color-mist-50);
      --color-text-secondary: var(--color-mist-200);
      --color-border-subtle: var(--color-basalt-800);
      --color-border-strong: var(--color-basalt-500);
    }
  }
}
```

### Semantic Color Token System

Our components use **semantic color tokens** that automatically adapt to light/dark modes:

#### Background Tokens
- **`background-primary`**: Main page/card backgrounds
- **`background-secondary`**: Secondary surfaces, panels
- **`background-tertiary`**: Subtle backgrounds, disabled states

#### Text Tokens
- **`text-primary`**: Main content, headings
- **`text-secondary`**: Secondary text, captions
- **`text-tertiary`**: Placeholder text, disabled labels

#### Border Tokens
- **`border-primary`**: Main borders, dividers
- **`border-secondary`**: Subtle borders, form elements

#### Brand Colors (Direct Usage)
- **`ocean-blue`**: Primary brand color, CTAs, navigation highlights
- **`ocean-blue-light`**: Secondary brand blue, hover states, lighter accents
- **`valley-green`**: Secondary brand color, success states
- **`bougainvillea-pink`**: Accent highlights, important notifications
- **`sobrado-ochre`**: Warning states, warm accents (replaces sunny-yellow)

#### Neutral Colors (Bruma Scale)
- **`mist-50/100/200`**: Light neutrals for backgrounds, borders (light mode)
- **`basalt-500/800/900`**: Dark neutrals for text, backgrounds (dark mode)

#### State Colors
- **`accent-error`**: Error states, destructive actions
- **`accent-success`**: Success states, confirmation
- **`accent-warning`**: Warning states, caution indicators

### Semantic Token Usage

**Always use semantic tokens** for UI elements to ensure proper dark mode support:

```html
<!-- ✅ CORRECT: Semantic tokens (auto dark mode) -->
<div class="bg-background-primary text-text-primary border-border-primary">
  <h1 class="text-text-primary">Main heading</h1>
  <p class="text-text-secondary">Secondary content</p>
</div>

<!-- ✅ CORRECT: Brand colors for specific brand elements -->
<button class="bg-ocean-blue hover:bg-ocean-blue/90 text-white">
  Primary Action
</button>

<!-- ❌ INCORRECT: Hardcoded colors (no auto dark mode) -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Manual dark mode handling (avoid this)
</div>
```

### Component Color Patterns

```tsx
// Standard component styling pattern
const componentClasses = clsx(
  // Base layout
  "relative rounded-lg p-4",
  // Semantic colors (auto dark mode)
  "bg-background-secondary text-text-primary border border-border-primary",
  // Hover states
  "hover:bg-background-tertiary transition-colors"
);

// Brand-specific elements
const brandClasses = clsx(
  "bg-ocean-blue hover:bg-ocean-blue/90",
  "focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
);
```

## 🎨 Semantic Color Token Reference

### Complete Token Hierarchy

Our semantic color system provides a comprehensive set of tokens that automatically adapt between light and dark modes:

#### Background Tokens
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `canvas` / `background-primary` | `mist-50` (#f8fafc) | `basalt-900` (#0f172a) | Main page backgrounds |
| `surface` / `background-secondary` | `mist-100` (#f1f5f9) | `basalt-800` (#1e293b) | Cards, sidebars, panels |
| `surface-alt` / `background-tertiary` | `mist-200` (#e2e8f0) | `basalt-500` (#64748b) | Hover states, alternates |

#### Text Tokens
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `body` / `text-primary` | `basalt-900` (#0f172a) | `mist-50` (#f8fafc) | Main content, headings |
| `muted` / `text-secondary` | `basalt-500` (#64748b) | `mist-200` (#e2e8f0) | Secondary text, captions |
| `text-tertiary` | `basalt-500` (#64748b) | `mist-200` (#e2e8f0) | Placeholder text, disabled labels |

#### Border Tokens
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `hairline` / `border-subtle` | `mist-200` (#e2e8f0) | `basalt-800` (#1e293b) | Light dividers, subtle borders |
| `edge` / `border-strong` | `basalt-500` (#64748b) | `basalt-500` (#64748b) | Strong borders, form elements |

#### Brand Color Tokens
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `ocean-blue` | `#0E4C75` | Primary CTAs, navigation highlights, links |
| `ocean-blue-light` | `#2A769E` | Hover states, secondary blue accents |
| `valley-green` | `#2F6E4D` | Success states, nature-related elements |
| `bougainvillea-pink` | `#C02669` | Accent highlights, important notifications |
| `sobrado-ochre` | `#D97706` | Warning states, warm accents |

#### State Tokens
| Token | Color | Usage |
|-------|-------|-------|
| `status-error` / `accent-error` | `#be123c` | Error states, destructive actions (rose-red) |
| `status-success` / `accent-success` | `#15803d` | Success states, confirmation (forest green) |
| `status-warning` / `accent-warning` | `#b45309` | Warning states, caution (ochre) |

#### Bruma Neutral Scale (Slate palette)
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `mist-50` | `#f8fafc` | Lightest background, off-white |
| `mist-100` | `#f1f5f9` | Light backgrounds, cards |
| `mist-200` | `#e2e8f0` | Borders, dividers, hover states |
| `basalt-500` | `#64748b` | Secondary text, muted elements |
| `basalt-800` | `#1e293b` | Dark backgrounds, dark mode surfaces |
| `basalt-900` | `#0f172a` | Darkest backgrounds, primary dark mode |

### Token Usage Examples

```tsx
// Standard UI Component
const Card = ({ children }) => (
  <div className="bg-background-primary text-text-primary border border-border-primary rounded-lg p-6">
    {children}
  </div>
);

// Form Input
const Input = ({ placeholder }) => (
  <input 
    className="bg-background-secondary text-text-primary border-border-primary placeholder:text-text-tertiary"
    placeholder={placeholder}
  />
);

// Error State
const ErrorAlert = ({ message }) => (
  <div className="bg-accent-error/10 text-accent-error border border-accent-error/20 rounded-md p-4">
    {message}
  </div>
);
```

## ✍️ Typography System

### Font Stack

The typography system uses two carefully selected Google Fonts that embody both heritage and modern clarity:

```css
/* Font Variables */
:root {
  --font-sans: "Outfit", system-ui, sans-serif;
  --font-serif: "Fraunces", Georgia, serif;
}
```

#### Primary Fonts
- **Outfit** (Sans-serif): Geometric, brand-focused, clean
  - **Usage**: Body text, UI elements, navigation, forms
  - **Weights**: 400, 500, 600, 700
  - **Character**: Modern, approachable, excellent legibility

- **Fraunces** (Serif): Variable, old-style, soft
  - **Usage**: Headings, titles, storytelling content
  - **Weights**: 400, 500, 700
  - **Character**: Traditional, warm, conveys heritage (reflects Brava's literary history - Eugénio Tavares)

### Typography Implementation

```tsx
// Next.js Font Configuration (layout.tsx)
import { Outfit, Fraunces } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-serif",
});
```

### Typography Classes

```html
<!-- Headings (Serif) -->
<h1 class="font-serif text-4xl font-bold">Main Headlines</h1>
<h2 class="font-serif text-3xl font-bold">Section Titles</h2>

<!-- Body Text (Sans-serif) -->
<p class="font-sans text-base">Regular body text</p>
<p class="font-sans text-lg">Prominent text</p>

<!-- UI Elements (Sans-serif) -->
<button class="font-sans text-sm font-semibold">Button Text</button>
```

### Typography Hierarchy

| Element | Font | Weight | Size (Mobile) | Size (Desktop) | Usage |
|---------|------|--------|---------------|----------------|-------|
| H1 | Fraunces | Bold (700) | text-4xl | text-6xl | Page titles |
| H2 | Fraunces | Bold (700) | text-3xl | text-4xl | Section headings |
| H3 | Fraunces | Medium (500) | text-2xl | text-3xl | Subsection titles |
| Body | Outfit | Regular (400) | text-base | text-lg | Main content |
| Caption | Outfit | Regular (400) | text-sm | text-sm | Supplementary text |
| Button | Outfit | Semibold (600) | text-sm | text-base | Interactive elements |

## 🧩 Component Library

### Catalyst UI Components

The design system leverages **Catalyst UI**, a professional component library providing 25+ production-ready components:

#### Core Components
- **Button**: Multiple variants (solid, outline, plain) with color options
- **Input**: Form inputs with validation states
- **Card**: Content containers with consistent styling
- **Dialog**: Modal dialogs and overlays
- **Dropdown**: Dropdown menus and select components
- **Navigation**: Navbar and sidebar components

#### Advanced Components
- **Table**: Data tables with sorting and pagination
- **Combobox**: Search and select combinations
- **Avatar**: User profile images and placeholders
- **Badge**: Status indicators and tags
- **Alert**: Notification and message components

### Custom UI Components

#### DirectoryCard
```tsx
// Usage Example with semantic tokens
<DirectoryCard entry={directoryEntry} />

// Implementation uses semantic color system:
<div className="bg-background-primary text-text-primary border border-border-primary rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  <Image src={entry.imageUrl} alt={entry.name} className="aspect-[16/10] object-cover" />
  <div className="p-4">
    <h3 className="text-text-primary font-medium">{entry.name}</h3>
    <p className="text-text-secondary text-sm">{entry.location}</p>
    <StarRating rating={entry.rating} className="mt-2" />
  </div>
</div>

// Features:
// - Automatic dark mode via semantic tokens
// - Responsive image display (16:10 aspect ratio)
// - Star rating integration
// - Category and location display
// - Hover effects and accessibility
```

#### PageHeader
```tsx
// Usage Example with semantic tokens
<PageHeader 
  title="Featured Highlights" 
  subtitle="Get a glimpse of the unique places and experiences Brava has to offer."
/>

// Implementation with semantic colors:
<div className="text-center mb-16">
  <h1 className="text-4xl font-serif font-bold text-text-primary sm:text-5xl">
    {title}
  </h1>
  {subtitle && (
    <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
      {subtitle}
    </p>
  )}
</div>

// Features:
// - Automatic dark mode support
// - Consistent page title styling
// - Optional subtitle support
// - Responsive typography scaling
// - Centered text alignment
```

#### ThemeToggle
```tsx
// Usage Example
<ThemeToggle />

// Features:
// - System/Light/Dark mode cycling
// - Automatic system preference detection
// - Persistent user preference storage
// - Icon-based visual feedback
```

#### StarRating
```tsx
// Usage Example
<StarRating rating={4.5} />

// Features:
// - Visual star display
// - Decimal rating support
// - Accessible implementation
// - Consistent sizing
```

### Component Composition Patterns

#### Card-Based Layouts
```tsx
// Grid layout with consistent spacing
<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
  {entries.map((entry) => (
    <DirectoryCard key={entry.id} entry={entry} />
  ))}
</div>
```

#### Feature Sections
```tsx
// Icon-based feature descriptions with semantic tokens
<div className="relative pl-16">
  <dt className="text-base font-semibold leading-7 text-text-primary">
    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-blue">
      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
    </div>
    {feature.name}
  </dt>
  <dd className="mt-2 text-base leading-7 text-text-secondary">
    {feature.description}
  </dd>
</div>
```

## 📱 Layout & Responsive Design

### Responsive Strategy

**Mobile-First Approach**: All components are designed for mobile devices first, then enhanced for larger screens.

#### Breakpoint System
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Layout Patterns

#### Container System
```tsx
// Standard content container
<div className="mx-auto max-w-7xl px-6 lg:px-8">
  {/* Content */}
</div>

// Centered content with max-width
<div className="mx-auto max-w-2xl lg:text-center">
  {/* Centered content */}
</div>
```

#### Grid Systems
```tsx
// Responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
<div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">

// Feature grid (1 col mobile, 3 col desktop)
<div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
```

#### Section Spacing
```tsx
// Standard section spacing
<section className="py-20 sm:py-24">
<section className="py-24 sm:py-32">
```

## 🌙 Dark Mode Implementation

### "Volcanic Night" Dark Mode Palette

Our dark mode implementation uses **Tailwind CSS v4's @variant dark** feature with the **"Volcanic Night"** palette - a deep, rich dark theme inspired by Brava's volcanic landscape.

#### Three-Mode Theme System
- **System**: Follows user's OS preference (default)
- **Light**: Force light mode (Mist palette)
- **Dark**: Force dark mode (Volcanic Night palette)

#### Volcanic Night Color Mapping
| Element | Light Mode | Dark Mode (Volcanic Night) |
|---------|------------|---------------------------|
| Page Background | `mist-50` (#f8fafc) | `basalt-900` (#0f172a) |
| Card/Surface | `mist-100` (#f1f5f9) | `basalt-800` (#1e293b) |
| Primary Text | `basalt-900` (#0f172a) | `mist-50` (#f8fafc) |
| Secondary Text | `basalt-500` (#64748b) | `mist-200` (#e2e8f0) |
| Subtle Borders | `mist-200` (#e2e8f0) | `basalt-800` (#1e293b) |
| Strong Borders | `basalt-500` (#64748b) | `basalt-500` (#64748b) |

#### Modern Implementation Architecture

```tsx
// ThemeToggle Component (theme-toggle.tsx)
const applyTheme = (newTheme: Theme, systemPrefersDark: boolean) => {
  const shouldBeDark = 
    newTheme === "dark" || 
    (newTheme === "system" && systemPrefersDark);

  // Single class toggle - semantic tokens handle the rest
  if (shouldBeDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
```

#### Semantic Token Approach

**Old Approach (Manual - AVOID):**
```css
/* ❌ Manual dark mode - requires duplicate styling */
.component {
  @apply bg-white dark:bg-basalt-900;
  @apply text-basalt-900 dark:text-mist-50;
  @apply border-mist-200 dark:border-basalt-800;
}
```

**New Approach (Semantic Tokens - PREFERRED):**
```css
/* ✅ Semantic tokens - automatic dark mode */
.component {
  @apply bg-canvas text-body border-hairline;
  /* Or use backward-compatible aliases: */
  @apply bg-background-primary text-text-primary border-border-primary;
  /* Colors automatically adapt based on .dark class */
}
```

#### Component Migration Pattern

All 25+ Catalyst UI components have been migrated to use semantic tokens:

```tsx
// Before: Manual dark mode handling (AVOID)
className="bg-white text-basalt-900 dark:bg-basalt-800 dark:text-mist-50"

// After: Semantic tokens (automatic) - PREFERRED
className="bg-canvas text-body"
// Or with backward-compatible aliases:
className="bg-background-primary text-text-primary"
```

### Dark Mode Development Guidelines

#### 1. Always Use Semantic Tokens
```tsx
// ✅ Correct - Automatic dark mode
const CardComponent = () => (
  <div className="bg-background-secondary text-text-primary border-border-primary">
    <h3 className="text-text-primary">Card Title</h3>
    <p className="text-text-secondary">Card description</p>
  </div>
);
```

#### 2. Brand Colors for Specific Elements
```tsx
// ✅ Use brand colors for specific brand elements
const PrimaryButton = () => (
  <button className="bg-ocean-blue hover:bg-ocean-blue/90 text-white">
    Primary Action
  </button>
);
```

#### 3. State Colors for Feedback
```tsx
// ✅ Use accent colors for states
const ErrorMessage = () => (
  <div className="bg-accent-error/10 text-accent-error border border-accent-error/20">
    Error message content
  </div>
);
```

### Dark Mode Best Practices

1. **Semantic Token Priority**: Always prefer semantic tokens over hardcoded colors
2. **Single Source of Truth**: Color definitions in `globals.css` @theme block
3. **Automatic Adaptation**: Let the system handle light/dark transitions
4. **WCAG Compliance**: All semantic tokens maintain proper contrast ratios
5. **Component Consistency**: All components use the same token system
6. **Performance**: No duplicate CSS - one class handles both modes

## 🎭 Animation & Transitions

### Custom Animations

#### Glow Animation
```css
/* Custom glow effect for special elements */
@keyframes glow {
  from, to {
    opacity: 0.8;
    text-shadow: 0 0 8px var(--color-ocean-blue), 0 0 10px var(--color-ocean-blue);
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 12px var(--color-ocean-blue), 0 0 20px var(--color-ocean-blue);
  }
}

.animate-glow {
  animation: glow 4s ease-in-out infinite;
}
```

#### Common Transitions
```tsx
// Hover effects
className="transition-shadow duration-200 ease-in-out hover:shadow-lg"
className="transition-transform duration-300 hover:scale-105"
className="transition-colors duration-200"

// Button interactions
className="hover:bg-ocean-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-blue"
```

## 🔧 Developer Guidelines

### File Organization

```
frontend/src/
├── components/
│   ├── catalyst-ui/          # Professional component library
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── ui/                   # Custom project components
│   │   ├── directory-card.tsx
│   │   ├── page-header.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ...
│   └── providers/            # Context providers
│       └── auth-provider.tsx
├── app/                      # App Router pages
├── lib/                      # Utilities and API clients
└── types/                    # TypeScript type definitions
```

### Styling Conventions

#### Class Naming Patterns
```tsx
// Component wrapper
className="relative isolate inline-flex items-baseline justify-center"

// State-based styling
className={clsx(
  "base-classes",
  condition ? "conditional-classes" : "alternative-classes"
)}

// Responsive design
className="text-base sm:text-lg lg:text-xl"
```

#### Semantic Color Usage Patterns
```tsx
// ✅ CORRECT: Semantic token patterns
className="text-text-primary"                    // Primary text (auto dark mode)
className="text-text-secondary"                  // Secondary text (auto dark mode)
className="bg-background-primary"                // Primary background (auto dark mode)
className="border-border-primary"                // Primary border (auto dark mode)

// ✅ CORRECT: Brand colors for specific elements
className="bg-ocean-blue hover:bg-ocean-blue/90" // Primary actions
className="text-accent-error"                    // Error states

// ❌ AVOID: Manual dark mode handling
className="text-gray-900 dark:text-white"        // Manual approach (avoid)
className="bg-white dark:bg-gray-800"            // Manual approach (avoid)
```

#### Component Development Pattern
```tsx
// Standard component with semantic tokens
const MyComponent = ({ className, ...props }) => {
  return (
    <div 
      className={clsx(
        // Base styling
        "rounded-lg p-4 shadow-sm",
        // Semantic colors (automatic dark mode)
        "bg-background-secondary text-text-primary border border-border-primary",
        // Interactive states
        "hover:bg-background-tertiary transition-colors duration-200",
        // Custom classes
        className
      )}
      {...props}
    />
  );
};
```

## 🛠️ Advanced Developer Guidelines

### Semantic Token Migration Guide

When updating existing components or creating new ones, follow this systematic approach:

#### Step 1: Identify Color Usage Patterns
```tsx
// ❌ BEFORE: Manual dark mode handling
const OldComponent = () => (
  <div className="bg-white dark:bg-basalt-900 text-basalt-900 dark:text-mist-50 border-mist-200 dark:border-basalt-800">
    <h3 className="text-basalt-900 dark:text-mist-50">Title</h3>
    <p className="text-basalt-500 dark:text-mist-200">Description</p>
  </div>
);
```

#### Step 2: Replace with Semantic Tokens
```tsx
// ✅ AFTER: Automatic dark mode with semantic tokens
const NewComponent = () => (
  <div className="bg-canvas text-body border-hairline">
    <h3 className="text-body">Title</h3>
    <p className="text-muted">Description</p>
  </div>
);
// Or with backward-compatible aliases:
const NewComponentAlt = () => (
  <div className="bg-background-primary text-text-primary border-border-primary">
    <h3 className="text-text-primary">Title</h3>
    <p className="text-text-secondary">Description</p>
  </div>
);
```

#### Step 3: Handle Special Cases
```tsx
// Brand colors for specific elements
<button className="bg-ocean-blue hover:bg-ocean-blue/90 text-white">
  Primary Action
</button>

// State colors for feedback
<div className="bg-accent-error/10 text-accent-error border border-accent-error/20">
  Error message
</div>

// Interactive states with semantic tokens
<div className="bg-background-secondary hover:bg-background-tertiary focus-within:bg-background-tertiary transition-colors">
  Interactive element
</div>
```

### Component Architecture Patterns

#### Base Component Pattern
```tsx
// Extensible component with semantic color foundation
interface BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
  children: React.ReactNode;
}

const BaseComponent = ({ variant = 'primary', className, children, ...props }: BaseComponentProps) => {
  const variantClasses = {
    primary: 'bg-background-primary text-text-primary border-border-primary',
    secondary: 'bg-background-secondary text-text-primary border-border-secondary', 
    tertiary: 'bg-background-tertiary text-text-secondary border-border-primary'
  };

  return (
    <div 
      className={clsx(
        // Base styles
        'rounded-lg p-4 transition-colors duration-200',
        // Variant-specific semantic tokens
        variantClasses[variant],
        // Custom overrides
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

#### Form Component Pattern
```tsx
// Form elements with consistent semantic styling
const FormInput = ({ error, ...props }) => (
  <input
    className={clsx(
      // Base styling with semantic tokens
      'w-full px-3 py-2 rounded-md border transition-colors',
      'bg-background-secondary text-text-primary placeholder:text-text-tertiary',
      // Default border state
      'border-border-primary focus:border-ocean-blue focus:ring-2 focus:ring-ocean-blue/20',
      // Error state
      error && 'border-accent-error focus:border-accent-error focus:ring-accent-error/20'
    )}
    {...props}
  />
);
```

#### Interactive Component Pattern
```tsx
// Interactive elements with proper focus and hover states
const InteractiveCard = ({ href, children, ...props }) => {
  const Component = href ? 'a' : 'div';
  
  return (
    <Component
      href={href}
      className={clsx(
        // Base semantic styling
        'bg-background-primary text-text-primary border border-border-primary',
        'rounded-lg p-6 transition-all duration-200',
        // Interactive states when clickable
        href && [
          'hover:bg-background-secondary hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2',
          'active:scale-[0.98]'
        ]
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
```

### Catalyst UI Color Migration

The Catalyst UI components have been migrated from generic `zinc-*` colors to our branded neutral scale (`basalt-*/mist-*`). This ensures visual consistency with the Nos Ilha brand.

#### Migration Mapping
| Catalyst UI (Original) | Nos Ilha Brand | Usage |
|------------------------|----------------|-------|
| `zinc-950` | `basalt-900` | Darkest text, solid buttons |
| `zinc-900` | `basalt-900` | Primary text color |
| `zinc-800` | `basalt-800` | Secondary text, dark surfaces |
| `zinc-700` | `basalt-800` | Borders, subdued text |
| `zinc-600` | `basalt-500` | Muted text, disabled states |
| `zinc-500` | `basalt-500` | Placeholder text, subtle borders |
| `zinc-400` | `mist-200` | Light borders, dividers |
| `zinc-300` | `mist-200` | Subtle borders |
| `zinc-200` | `mist-200` | Light backgrounds |
| `zinc-100` | `mist-100` | Surface backgrounds |
| `zinc-50` | `mist-50` | Canvas backgrounds |

#### Migrated Components
The following Catalyst UI components use brand neutrals:
- **Form Controls**: `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio.tsx`, `switch.tsx`
- **Typography**: `text.tsx`, `heading.tsx`
- **Layout**: `table.tsx`, `divider.tsx`, `fieldset.tsx`
- **Interactive**: `button.tsx` (all color variants)

#### Example Migration
```tsx
// Before: Generic zinc colors
className="text-zinc-950 border-zinc-950/10 placeholder:text-zinc-500"

// After: Brand neutrals
className="text-basalt-900 border-basalt-900/10 placeholder:text-basalt-500"
```

#### Dark Mode Handling in Catalyst UI
Catalyst UI components use `dark:` prefixed classes that reference our semantic tokens:
```tsx
// Light mode uses basalt-900, dark mode uses text-primary semantic token
className="text-basalt-900 dark:text-text-primary"

// Light mode uses mist-50, dark mode uses background-primary semantic token
className="bg-mist-50 dark:bg-background-primary"
```

### Troubleshooting Common Issues

#### Issue: Colors Don't Change in Dark Mode
```tsx
// ❌ Problem: Using hardcoded colors
className="text-basalt-900 dark:text-mist-50"

// ✅ Solution: Use semantic tokens
className="text-body" // or "text-text-primary"
```

#### Issue: Inconsistent Styling Across Components
```tsx
// ❌ Problem: Different color approaches
<ComponentA className="bg-white text-black" />
<ComponentB className="bg-mist-50 text-basalt-900" />

// ✅ Solution: Consistent semantic tokens
<ComponentA className="bg-canvas text-body" />
<ComponentB className="bg-surface text-body" />
// Or with backward-compatible aliases:
<ComponentA className="bg-background-primary text-text-primary" />
<ComponentB className="bg-background-secondary text-text-primary" />
```

#### Issue: Poor Contrast in Dark Mode
```tsx
// ❌ Problem: Manual color selection with poor contrast
className="text-basalt-500 dark:text-basalt-500" // Poor contrast in dark mode

// ✅ Solution: Use tested semantic tokens
className="text-muted" // or "text-text-secondary" - WCAG AA compliant in both modes
```

### Best Practices Checklist

#### For New Components
- [ ] **Semantic Tokens Only**: Use semantic color tokens instead of hardcoded colors
- [ ] **No Manual Dark Classes**: Avoid `dark:` prefixed classes for semantic colors
- [ ] **Brand Colors Sparingly**: Use brand colors only for brand-specific elements
- [ ] **State Colors Appropriately**: Use accent colors for error/success/warning states
- [ ] **Test Both Modes**: Verify appearance in both light and dark modes
- [ ] **Accessibility**: Ensure proper contrast ratios are maintained

#### For Component Updates
- [ ] **Audit Existing Colors**: Identify all hardcoded color usages
- [ ] **Map to Semantic Tokens**: Replace hardcoded colors with appropriate semantic tokens
- [ ] **Remove Dark Mode Classes**: Delete manual `dark:` classes for semantic colors
- [ ] **Test Functionality**: Ensure component behavior remains unchanged
- [ ] **Visual Regression**: Compare before/after in both themes

### Accessibility Guidelines

#### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **ARIA Labels**: Descriptive labels for screen readers

#### Implementation Examples
```tsx
// Focus management
className="focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ocean-blue"

// Screen reader support
<span className="sr-only">Open main menu</span>
aria-label={`View details for ${entry.name}`}
aria-current={pathname === item.href ? "page" : undefined}

// Touch targets (minimum 44x44px)
className="size-[max(100%,2.75rem)]"
```

### Performance Optimization

#### Image Handling
```tsx
// Next.js Image component with optimization
<Image
  src={entry.imageUrl}
  alt={`Photo of ${entry.name}`}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

#### Font Loading
```tsx
// Preload critical fonts with font-display: swap
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
```

## 🚀 Implementation Checklist

### For New Components
- [ ] **Responsive Design**: Works on all screen sizes
- [ ] **Dark Mode Support**: Proper color adaptation
- [ ] **Accessibility**: WCAG AA compliance
- [ ] **Type Safety**: Full TypeScript implementation
- [ ] **Performance**: Optimized rendering and assets
- [ ] **Documentation**: Clear usage examples and props

### For New Pages
- [ ] **SEO Optimization**: Proper meta tags and structured data
- [ ] **Mobile-First**: Mobile experience prioritized
- [ ] **Loading States**: Graceful loading and error states
- [ ] **Performance**: Fast load times and core web vitals
- [ ] **Brand Consistency**: Follows design system patterns

### For Styling Updates
- [ ] **Semantic Tokens**: Uses semantic color tokens instead of hardcoded colors
- [ ] **Dark Mode**: Automatic dark mode support via semantic tokens
- [ ] **Typography**: Follows established hierarchy
- [ ] **Spacing**: Consistent margin and padding patterns
- [ ] **Animation**: Smooth, purposeful transitions
- [ ] **Cross-Browser**: Tested in major browsers
- [ ] **Accessibility**: WCAG AA compliant contrast in both light and dark modes

## 🎯 Technical Architecture

### Brand System V1.0.0 "Ilha das Flores"

The color system follows the **"Semantic Structure, Branded Soul"** approach:
- **Semantic aliases** (`bg-canvas`, `text-body`) for 90% of layout HTML → Dark mode handled automatically
- **Direct brand tokens** (`bg-ocean-blue`, `text-bougainvillea-pink`) for brand identity elements

### Semantic Color System
```css
/* globals.css - Single source of truth */
@theme {
  /* Brand Color Palette */
  --color-ocean-blue: #0e4c75;
  --color-ocean-blue-light: #2a769e;
  --color-valley-green: #2f6e4d;
  --color-bougainvillea-pink: #c02669;
  --color-sobrado-ochre: #d97706;
  --color-sunny-yellow: #fbbf24;

  /* Bruma Neutral Scale (Slate palette) */
  --color-mist-50: #f8fafc;
  --color-mist-100: #f1f5f9;
  --color-mist-200: #e2e8f0;
  --color-basalt-500: #64748b;
  --color-basalt-800: #1e293b;
  --color-basalt-900: #0f172a;

  /* Status Colors */
  --color-status-error: #be123c;
  --color-status-success: #15803d;
  --color-status-warning: #b45309;

  /* Semantic Aliases (auto dark mode) */
  --color-canvas: var(--color-bg-primary);
  --color-surface: var(--color-bg-secondary);
  --color-body: var(--color-text-primary);
  --color-muted: var(--color-text-secondary);
  --color-hairline: var(--color-border-subtle);
  --color-edge: var(--color-border-strong);
}

@layer theme {
  :root, :host {
    @variant dark {
      /* "Volcanic Night" Dark Mode Palette */
      --color-bg-primary: var(--color-basalt-900);
      --color-bg-secondary: var(--color-basalt-800);
      --color-text-primary: var(--color-mist-50);
      --color-text-secondary: var(--color-mist-200);
      --color-border-subtle: var(--color-basalt-800);
      --color-border-strong: var(--color-basalt-500);
    }
  }
}
```

### Developer Decision Matrix
| Building... | Use | Example |
|-------------|-----|---------|
| Card, Sidebar, Section | **Semantic** | `bg-surface` |
| Paragraph, Heading | **Semantic** | `text-body` |
| Border, Divider | **Semantic** | `border-hairline` |
| Button, CTA | **Direct Token** | `bg-ocean-blue` |
| Icon, Illustration | **Direct Token** | `text-bougainvillea-pink` |
| Warning/Success state | **Semantic Status** | `text-accent-error` |

## 📚 Resources & References

### Design Tools
- **Figma**: Design system components and mockups
- **Tailwind CSS v4**: Modern utility-first CSS framework with @theme support
- **Headless UI**: Unstyled, accessible UI components (Catalyst UI foundation)
- **Heroicons**: Beautiful hand-crafted SVG icons

### Development Tools
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Advanced styling framework with semantic token support
- **clsx**: Conditional class name utility
- **Framer Motion**: Animation library for interactive components

### Color System Tools
- **CSS Custom Properties**: Semantic token implementation
- **@variant dark**: Tailwind CSS v4 dark mode implementation
- **Automatic Color Adaptation**: System-level theme switching

### Accessibility Resources
- **WCAG Guidelines**: Web Content Accessibility Guidelines (AA compliance achieved)
- **Screen Readers**: VoiceOver, NVDA, JAWS testing
- **Color Contrast**: WebAIM Contrast Checker (all semantic tokens validated)

---

This design system documentation provides comprehensive guidance for building consistent, beautiful, and accessible user interfaces for the Nos Ilha platform. The semantic color system enables automatic dark mode support across all components while maintaining design consistency and accessibility standards.

For questions, updates, or additions to this system, please refer to the development team or create an issue in the project repository.