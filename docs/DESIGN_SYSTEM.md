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

### Primary Color Palette

Our color palette is directly inspired by Brava's natural landscape and cultural elements:

```css
/* Light Mode Colors */
:root {
  --color-ocean-blue: #005A8D;      /* Deep, welcoming ocean blue */
  --color-valley-green: #3E7D5A;    /* Lush, natural valley green */
  --color-bougainvillea-pink: #D90368; /* Vibrant bougainvillea pink */
  --color-sunny-yellow: #F7B801;    /* Warm, sunny yellow */
  --color-off-white: #F8F9FA;       /* Clean, soft background */
  --color-volcanic-gray: #6C757D;   /* Neutral volcanic gray */
  --color-volcanic-gray-dark: #343A40; /* Dark volcanic gray */
}

/* Dark Mode Colors */
.dark {
  --color-ocean-blue: #9EBED1;      /* Lighter ocean blue for contrast */
  --color-valley-green: #B3CBBE;    /* Softer valley green */
  --color-bougainvillea-pink: #EFA1C6; /* Muted bougainvillea pink */
  --color-off-white: #F8F9FA;       /* Consistent light background */
  --color-volcanic-gray: #B8BCC1;   /* Lighter volcanic gray */
  --color-volcanic-gray-dark: #343A40; /* Consistent dark gray */
}
```

### Color Usage Guidelines

#### Primary Colors
- **Ocean Blue** (`#005A8D`): Primary brand color, navigation highlights, CTAs
- **Valley Green** (`#3E7D5A`): Secondary brand color, success states, nature elements

#### Accent Colors
- **Bougainvillea Pink** (`#D90368`): Call-to-action highlights, important notifications
- **Sunny Yellow** (`#F7B801`): Warning states, accent elements, cheerful highlights

#### Neutral Colors
- **Off White** (`#F8F9FA`): Primary background color, card backgrounds
- **Volcanic Gray** (`#6C757D`): Secondary text, subtle elements
- **Volcanic Gray Dark** (`#343A40`): Primary text, headings, high contrast elements

### Tailwind Integration

Colors are available as custom Tailwind utilities:

```html
<!-- Background colors -->
<div class="bg-ocean-blue">Ocean blue background</div>
<div class="bg-valley-green">Valley green background</div>
<div class="bg-off-white">Off white background</div>

<!-- Text colors -->
<h1 class="text-volcanic-gray-dark">Primary heading</h1>
<p class="text-volcanic-gray">Secondary text</p>

<!-- Border colors -->
<div class="border-ocean-blue">Ocean blue border</div>
```

## ✍️ Typography System

### Font Stack

The typography system uses two carefully selected Google Fonts that embody both heritage and modern clarity:

```css
/* Font Variables */
:root {
  --font-family-sans: var(--font-lato), sans-serif;
  --font-family-serif: var(--font-merriweather), serif;
}
```

#### Primary Fonts
- **Lato** (Sans-serif): Clean, modern, highly readable
  - **Usage**: Body text, UI elements, navigation, forms
  - **Weights**: 400 (Regular), 700 (Bold)
  - **Character**: Professional, approachable, excellent legibility

- **Merriweather** (Serif): Elegant, story-telling typeface
  - **Usage**: Headings, titles, storytelling content
  - **Weights**: 400 (Regular), 700 (Bold), 900 (Black)
  - **Character**: Traditional, authoritative, conveys heritage

### Typography Implementation

```tsx
// Next.js Font Configuration (layout.tsx)
import { Lato, Merriweather } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
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
| H1 | Merriweather | Bold (700) | text-4xl | text-6xl | Page titles |
| H2 | Merriweather | Bold (700) | text-3xl | text-4xl | Section headings |
| H3 | Merriweather | Bold (700) | text-2xl | text-3xl | Subsection titles |
| Body | Lato | Regular (400) | text-base | text-lg | Main content |
| Caption | Lato | Regular (400) | text-sm | text-sm | Supplementary text |
| Button | Lato | Semibold (600) | text-sm | text-base | Interactive elements |

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
// Usage Example
<DirectoryCard entry={directoryEntry} />

// Features:
// - Responsive image display (16:10 aspect ratio)
// - Star rating integration
// - Category and location display
// - Hover effects and accessibility
```

#### PageHeader
```tsx
// Usage Example
<PageHeader 
  title="Featured Highlights" 
  subtitle="Get a glimpse of the unique places and experiences Brava has to offer."
/>

// Features:
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
// Icon-based feature descriptions
<div className="relative pl-16">
  <dt className="text-base font-semibold leading-7 text-volcanic-gray-dark">
    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-blue">
      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
    </div>
    {feature.name}
  </dt>
  <dd className="mt-2 text-base leading-7 text-volcanic-gray">
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

### Theme Toggle System

The application supports three theme modes:
- **System**: Follows user's OS preference
- **Light**: Force light mode
- **Dark**: Force dark mode

#### Implementation Strategy
```tsx
// Class-based dark mode with manual control
const applyTheme = (newTheme: Theme, systemPrefersDark: boolean) => {
  const shouldBeDark = 
    newTheme === "dark" || 
    (newTheme === "system" && systemPrefersDark);

  if (shouldBeDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
```

#### Dark Mode Color Adaptations
```css
/* Component styling with dark mode support */
.component {
  @apply bg-white dark:bg-volcanic-gray-dark;
  @apply text-volcanic-gray-dark dark:text-white;
  @apply border-gray-200 dark:border-gray-600;
}
```

### Dark Mode Best Practices
1. **Consistent Color Variables**: Use CSS custom properties for automatic color switching
2. **Contrast Ratios**: Ensure WCAG AA compliance in both light and dark modes
3. **User Preference**: Respect system preferences while allowing manual override
4. **Persistent Storage**: Remember user's theme choice across sessions

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

#### Color Usage Patterns
```tsx
// Semantic color usage
className="text-volcanic-gray-dark dark:text-white"     // Primary text
className="text-volcanic-gray dark:text-gray-300"      // Secondary text
className="bg-ocean-blue hover:bg-ocean-blue/90"       // Primary actions
className="border-gray-200 dark:border-gray-600"       // Borders
```

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
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
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
- [ ] **Color System**: Uses defined color variables
- [ ] **Typography**: Follows established hierarchy
- [ ] **Spacing**: Consistent margin and padding patterns
- [ ] **Animation**: Smooth, purposeful transitions
- [ ] **Cross-Browser**: Tested in major browsers

## 📚 Resources & References

### Design Tools
- **Figma**: Design system components and mockups
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful hand-crafted SVG icons

### Development Tools
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling framework
- **clsx**: Conditional class name utility

### Accessibility Resources
- **WCAG Guidelines**: Web Content Accessibility Guidelines
- **Screen Readers**: VoiceOver, NVDA, JAWS testing
- **Color Contrast**: WebAIM Contrast Checker

---

This design system documentation provides the foundation for consistent, beautiful, and accessible user interfaces that truly capture the essence of Brava Island. For questions or additions to this system, please refer to the development team or create an issue in the project repository.