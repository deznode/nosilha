# Nos Ilha Design System

Frontend design system for the Nos Ilha cultural heritage platform. Built with Next.js 16, React 19, Tailwind CSS v4, and Catalyst UI components.

## Design Philosophy

**Brand Essence**: "Clean, inviting, authentic, and lush" — celebrating Brava Island's cultural heritage.

### Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Cultural Authenticity** | Fraunces serif evokes traditional storytelling; Ocean Blue reflects the Atlantic |
| **Content Sovereignty** | UI recedes to let cultural content shine; minimal chrome |
| **Calm Warmth** | Soft shadows, generous radii, breathing whitespace |
| **Progressive Disclosure** | Essential info first; details on demand |

### Visual Language Summary

- **Typography**: Fraunces for headings (cultural warmth), Outfit for body (modern clarity)
- **Colors**: Ocean Blue primary, Slate neutrals, warm brand accents
- **Motion**: Calm, confident transitions with `cubic-bezier(0.16, 1, 0.3, 1)`
- **Shape**: Generous border radii (16-24px for cards), multi-layered shadows

## Components

### Design System Gallery

Interactive gallery showcasing all design tokens and components.

- **URL**: `http://localhost:3000/design-system` (development only)
- **Route**: `apps/web/src/app/(main)/design-system/`
- **Features**: Sticky sidebar navigation, copy-to-clipboard for all tokens, dark mode preview toggle

> **Note**: Returns 404 in production builds.

### Component Library

| Component | Source | Description |
|-----------|--------|-------------|
| **AnimatedButton** | Custom | 4 variants, 3 sizes, icons, loading states, Framer Motion |
| **Input** | Catalyst UI | Icons, validation, helper text |
| **InputGroup** | Catalyst UI | Icon positioning |
| **Textarea** | Custom (HeadlessUI) | Multi-line input, rows, resize options, RHF compatible |
| **Select** | Custom (HeadlessUI) | Listbox-based, accessible, Controller pattern for RHF |
| **Checkbox** | Catalyst UI | 22 color variants, states |
| **CheckboxField** | Catalyst UI | Labels and descriptions |
| **Card** | Custom | Hoverable lift animation |
| **DirectoryCard** | Custom | Heritage entry display |
| **Banner** | Custom | Gradient promotional |
| **LoadingSpinner** | Custom | 3 sizes, dots, pulse variants |
| **ConfirmationDialog** | Custom | Default, warning, danger |
| **Toast System** | Custom | Fluent builder API, 4 variants |
| **PageHeader** | Custom | Breadcrumbs, accent bar |
| **ThemeToggle** | Custom | System/light/dark cycle |
| **MobileBottomNav** | Custom | 5-item thumb-zone navigation |
| **Avatar** | Custom | Size variants, initials fallback, status |
| **AvatarGroup** | Custom | Stacked display with overflow |
| **Tooltip** | Custom | Position variants, HeadlessUI Transition |
| **Popover** | Catalyst UI | HeadlessUI anchor positioning |
| **Dropdown** | Catalyst UI | Items, dividers, icons, shortcuts |

## Quick Reference

### Brand Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `ocean-blue` | `#003f60` | `#39bbf8` | Primary CTAs, links, focus rings |
| `valley-green` | `#236436` | - | Success states, nature elements |
| `bougainvillea-pink` | `#ae1173` | `#f36fb8` | Accent highlights, decorative |
| `sobrado-ochre` | `#cd6800` | - | Warnings, warm accents |
| `sunny-yellow` | `#f3ba26` | - | Ratings, call-to-action |

### Semantic Tokens (Preferred)

Use these short aliases throughout the codebase:

| Token | Maps To | Usage |
|-------|---------|-------|
| `canvas` | `bg-primary` | Page background |
| `surface` | `bg-secondary` | Cards, sidebars |
| `surface-alt` | `bg-tertiary` | Hover states |
| `body` | `text-primary` | Main reading text |
| `muted` | `text-secondary` | Metadata, captions |
| `brand` | `text-brand` | Brand-colored text |
| `hairline` | `border-subtle` | Light dividers |
| `edge` | `border-strong` | Strong borders |

### Base Tokens (Full Names)

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `bg-primary` | white | `#0b1120` |
| `bg-secondary` | `mist-50` | `#1e293b` |
| `bg-tertiary` | `mist-100` | `#334155` |
| `text-primary` | `basalt-900` | `#f1f5f9` |
| `text-secondary` | `basalt-600` | `#94a3b8` |
| `text-tertiary` | `basalt-600` | `basalt-600` |
| `text-brand` | `ocean-blue` | `#7dd4fb` |
| `border-subtle` | `mist-200` | `#334155` |
| `border-strong` | `basalt-500` | `#475569` |

## Color System

### Two-Tier Token Architecture (Tailwind CSS v4)

The color system uses a two-tier architecture for optimal dark mode support and Tailwind integration:

**Tier 1: Raw Values** (`:root` and `.dark` selectors)
- CSS custom properties with OKLCH color values
- Brand colors: `--brand-ocean-blue`, `--brand-valley-green`, etc.
- Neutrals: `--neutral-mist-*`, `--neutral-basalt-*`
- Semantic tokens: `--background`, `--foreground`, `--primary`, etc.

**Tier 2: Tailwind Mappings** (`@theme inline`)
- Exposes CSS variables to Tailwind's color system
- Maps to `--color-*` namespace for utility classes
- Preserves all backward compatibility aliases

### Color Format: OKLCH

All colors are defined in OKLCH format for perceptual uniformity:

```css
/* OKLCH: oklch(Lightness Chroma Hue) */
--brand-ocean-blue: oklch(0.35 0.08 240);  /* Light mode */
--brand-ocean-blue: oklch(0.73 0.15 200);  /* Dark mode */
```

**Why OKLCH?**
- Perceptually uniform lightness (L=0.5 looks 50% bright regardless of hue)
- Better color interpolation for animations and gradients
- Industry standard for modern CSS color systems

### WCAG AA Compliance

The design system ensures WCAG AA color contrast compliance:

- **`--muted-foreground`**: Uses `oklch(0.55 0 0)` in light mode (≥4.5:1 contrast ratio)
- **`text-muted`**: Utility override maps to compliant muted foreground color
- All text colors tested against their intended backgrounds

### Neutral Scale (Bruma)

| Token | Hex | Usage |
|-------|-----|-------|
| `mist-50` | `#f6f9fc` | Lightest backgrounds |
| `mist-100` | `#eef2f6` | Secondary backgrounds |
| `mist-200` | `#e0e5eb` | Borders, dividers |
| `basalt-500` | `#677284` | Borders, icons, non-text elements |
| `basalt-600` | `#4c5666` | Secondary text (WCAG AA compliant) |
| `basalt-800` | `#202938` | Dark surfaces |
| `basalt-900` | `#0e1624` | Primary text (light mode) |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `status-error` | `#f0355d` | Error states, destructive actions |
| `status-success` | `#00b47a` | Success confirmations |
| `status-warning` | `#f49500` | Warnings, caution |

### Dark Mode

Dark mode is automatic via Tailwind CSS v4's `@variant dark`. Theme is managed by `ThemeToggle` component with state persisted to localStorage. Theme class is applied to `<html>` element.

```tsx
// Cycles: system -> light -> dark -> system
<ThemeToggle />
<ThemeToggle variant="light" />  // For dark backgrounds
```

### Usage Patterns

```tsx
// Semantic aliases (preferred - used in 42+ components)
<div className="bg-surface text-body border-hairline">
  <h1>Heading</h1>
  <p className="text-muted">Secondary text</p>
</div>

// Full token names (also valid)
<div className="bg-bg-secondary text-text-primary border-border-subtle">

// Brand colors for specific elements
<button className="bg-ocean-blue hover:bg-ocean-blue/90 text-white">
  Primary Action
</button>

// Status colors
<div className="bg-status-error/10 text-status-error">
  Error message
</div>
```

## Shape & Elevation

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-badge` | 8px | Tags, badges, toasts |
| `rounded-button` | 12px | Buttons, inputs, chips |
| `rounded-card` | 16px | Standard cards |
| `rounded-container` | 24px | Featured cards, modals |

```tsx
// Examples
<span className="rounded-badge px-2 py-1">Tag</span>
<button className="rounded-button px-4 py-2">Button</button>
<div className="rounded-card p-6">Card content</div>
<div className="rounded-container p-8">Featured section</div>
```

### Shadow Scale

Multi-layered shadows with Ocean Blue tint for brand warmth:

| Token | Usage |
|-------|-------|
| `shadow-subtle` | Default cards, inputs |
| `shadow-medium` | Hover states |
| `shadow-elevated` | Dropdowns, popovers |
| `shadow-floating` | Modals, toasts |
| `shadow-lift` | Card hover lift effect |

```tsx
// Card with hover lift
<div className="shadow-subtle hover:shadow-lift transition-shadow">
  Card content
</div>
```

## Transitions

| Token | Duration | Curve | Usage |
|-------|----------|-------|-------|
| `duration-150` | 150ms | ease-calm | Buttons, toggles |
| `duration-200` | 200ms | ease-calm | Cards, dropdowns |
| `duration-300` | 300ms | ease-calm | Modals, page transitions |

**Easing**: `ease-calm` = `cubic-bezier(0.16, 1, 0.3, 1)` (calm, confident motion)

```tsx
// Standard transition pattern
<div className="transition-all duration-200 ease-calm hover:-translate-y-1">
```

## Interaction Patterns

### Card Hover

Standard card hover effect (all interactive cards):

```tsx
// Using Card component with hoverable prop
<Card hoverable>Content</Card>

// Manual application
className="transition-all duration-200 ease-calm hover:-translate-y-1 hover:shadow-lift"
```

### Button Hover

```tsx
className="transition-colors duration-150 ease-calm hover:bg-ocean-blue/90"
```

### Focus States

```tsx
// Standard focus ring (use .focus-ring utility)
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue focus-visible:ring-offset-2"
```

## Typography

### Font Stack

```css
--font-sans: "Outfit", system-ui, sans-serif;   /* Body, UI */
--font-serif: "Fraunces", Georgia, serif;        /* Headings */
```

- **Outfit** (Sans-serif): Geometric, modern, brand-focused. Body text, UI elements, navigation. Weights: 400, 500, 600, 700.
- **Fraunces** (Serif): Variable font with SOFT, WONK axes. Headings and storytelling. Weights: 400, 500, 700.

### Typography Scale

| Element | Font | Size (Mobile) | Size (Desktop) |
|---------|------|---------------|----------------|
| H1 | Fraunces Bold | `text-4xl` | `text-5xl/6xl` |
| H2 | Fraunces Bold | `text-3xl` | `text-4xl` |
| H3 | Fraunces Medium | `text-2xl` | `text-3xl` |
| Body | Outfit Regular | `text-base` | `text-lg` |
| Caption | Outfit Regular | `text-sm` | `text-sm` |
| Button | Outfit Semibold | `text-sm` | `text-base` |

```tsx
<h1 className="font-serif text-4xl font-bold sm:text-5xl">Page Title</h1>
<p className="font-sans text-base text-text-secondary">Body text</p>
```

## Layout & Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Container Patterns

```tsx
// Standard content container
<div className="mx-auto max-w-7xl px-6 lg:px-8">

// Centered content
<div className="mx-auto max-w-2xl lg:text-center">

// Section spacing
<section className="py-20 sm:py-24">

// 1-2-4 column responsive grid
<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
```

## Key Components

### Card

Base card component with optional hover animation:

```tsx
import { Card } from "@/components/ui/card";

// Static card
<Card className="p-6">Content</Card>

// Hoverable card with lift effect
<Card hoverable className="p-6">Interactive content</Card>
```

### Catalyst UI Components

The project uses a curated subset of Catalyst UI for complex interactive components. 9 components are retained, with simplified color variants aligned to the brand palette.

| Component | File | Usage |
|-----------|------|-------|
| **Button** | `button.tsx` | Primary actions, form submissions |
| **Dialog** | `dialog.tsx` | Modal dialogs with backdrop |
| **Input** | `input.tsx` | Form text inputs |
| **Fieldset** | `fieldset.tsx` | Form grouping with labels, errors |
| **Checkbox** | `checkbox.tsx` | Boolean toggles |
| **Badge** | `badge.tsx` | Status indicators |
| **Popover** | `popover.tsx` | HeadlessUI anchor positioning |
| **Dropdown** | `dropdown.tsx` | Menu items, dividers, icons, keyboard shortcuts |

#### Button

```tsx
import { Button } from "@/components/catalyst-ui/button";

// Color variants (aligned to brand palette)
<Button color="blue">Primary</Button>      {/* Ocean Blue - primary actions */}
<Button color="dark">Secondary</Button>    {/* Basalt - secondary actions */}
<Button color="red">Destructive</Button>   {/* Error red - destructive */}
<Button color="green">Success</Button>     {/* Success green */}
<Button color="yellow">Warning</Button>    {/* Sobrado ochre - warning */}

// Style variants
<Button outline>Outline</Button>
<Button plain>Plain/Text</Button>

// As link
<Button href="/path" color="blue">Link Button</Button>
```

#### Badge

```tsx
import { Badge } from "@/components/catalyst-ui/badge";

<Badge color="blue">Info</Badge>       {/* Ocean Blue */}
<Badge color="green">Success</Badge>   {/* Green */}
<Badge color="yellow">Warning</Badge>  {/* Sobrado ochre */}
<Badge color="red">Error</Badge>       {/* Red */}
<Badge color="zinc">Default</Badge>    {/* Neutral */}
```

#### Dialog

```tsx
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/catalyst-ui/dialog";

<Dialog open={isOpen} onClose={setIsOpen}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogDescription>Are you sure you want to proceed?</DialogDescription>
  <DialogBody>{/* Form content */}</DialogBody>
  <DialogActions>
    <Button plain onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button color="blue">Confirm</Button>
  </DialogActions>
</Dialog>
```

### Form Patterns

The design system standardizes on **React Hook Form + Zod** for form validation. This pattern is used across all forms in the application.

#### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Input` | `catalyst-ui/input.tsx` | Text, email, number inputs |
| `Textarea` | `ui/textarea.tsx` | Multi-line text input (HeadlessUI) |
| `Select` | `ui/select.tsx` | Dropdown selection (HeadlessUI Listbox) |
| `Checkbox` | `catalyst-ui/checkbox.tsx` | Boolean toggles |
| `Field`, `Label`, `ErrorMessage` | `catalyst-ui/fieldset.tsx` | Form field wrappers |

#### Basic Form Setup

```tsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/catalyst-ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(2, "Name required"),
  message: z.string().min(10, "Message too short"),
  category: z.enum(["option1", "option2"]),
});
type FormData = z.infer<typeof formSchema>;

// 2. Setup form
const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(formSchema),
});

// 3. Use components
<Field>
  <Label>Name</Label>
  <Input {...register("name")} data-invalid={errors.name ? "" : undefined} />
  {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
</Field>

<Field>
  <Label>Message</Label>
  <Textarea {...register("message")} rows={4} />
  {errors.message && <ErrorMessage>{errors.message.message}</ErrorMessage>}
</Field>

// Select requires Controller (Listbox doesn't work with register)
<Field>
  <Label>Category</Label>
  <Controller
    name="category"
    control={control}
    render={({ field }) => (
      <Select
        options={[{ value: "option1", label: "Option 1" }, { value: "option2", label: "Option 2" }]}
        value={field.value}
        onChange={field.onChange}
        invalid={!!errors.category}
      />
    )}
  />
</Field>
```

#### Textarea Props

```tsx
<Textarea
  rows={4}              // Default: 4
  resize="vertical"     // "none" | "vertical" | "horizontal" | "both"
  disabled={false}
  data-invalid=""       // Triggers invalid styling
/>
```

#### Select Props

```tsx
<Select
  options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B", disabled: true }]}
  value={selectedValue}
  onChange={(value) => handleChange(value)}
  placeholder="Select an option"
  disabled={false}
  invalid={false}
/>
```

#### Validation Schemas

Schemas are located in `apps/web/src/schemas/`:

| Schema | Purpose |
|--------|---------|
| `contactSchema.ts` | Contact form validation |
| `suggestionSchema.ts` | Suggestion/feedback form |
| `directorySubmissionSchema.ts` | Directory entry form |
| `newsletterSchema.ts` | Newsletter subscription |
| `authSchema.ts` | Authentication forms |

### PageHeader

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
  title="Directory"
  subtitle="Explore Brava's cultural sites"
  as="h1"
  showAccentBar
  centered
  size="large"
/>
```

### DirectoryCard

```tsx
import { DirectoryCard } from "@/components/ui/directory-card";

<DirectoryCard entry={directoryEntry} showBookmark={true} />
// Features: Image, category badge, bookmark, rating, tags, hover animations
```

### ThemeToggle

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

<ThemeToggle />
<ThemeToggle variant="light" />
<ThemeToggle showContainer={false} />
```

## Feedback Components

### Toast System

Position: Bottom-left (desktop), bottom-center (mobile)

| Variant | Duration | Color |
|---------|----------|-------|
| `success` | 4s | Valley Green |
| `error` | 10s | Status Error |
| `info` | 4s | Ocean Blue |
| `warning` | 6s | Sobrado Ochre |

Features:
- Timer pauses on hover
- Single toast at a time (queued)
- Slide-from-bottom animation

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return (
    <>
      <button onClick={() => showSuccess("Profile updated.")}>Save</button>
      <button onClick={() => showError("Couldn't save changes.")}>Error</button>
      <button onClick={() => showWarning("Storage almost full.")}>Warn</button>
      <button onClick={() => showInfo("New features available.")}>Info</button>
    </>
  );
}
```

## Navigation

### Mobile Bottom Navigation

Persistent bottom bar for thumb-zone accessibility (mobile only, `md:hidden`).

| Item | Icon | Route | Active Match |
|------|------|-------|--------------|
| Home | `Home` | `/` | Exact |
| Directory | `Grid3X3` | `/directory` | Starts with `/directory` |
| Culture | `BookOpen` | `/history` | `/history`, `/people` |
| Map | `Map` | `/map` | Exact |
| More | `Menu` | - | Opens popover menu |

**Behavior:**
- Hidden on detail pages (`/directory/[cat]/[slug]`, `/stories/[slug]`, `/people/[slug]`)
- Safe area padding for iOS home indicator: `pb-[env(safe-area-inset-bottom)]`
- Height: 56px (h-14)

**"More" Menu Contents:**
- Stories, Media links
- Profile/Login link
- Theme toggle

```tsx
// Automatically included in (main) layout
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
```

## Animation & Utility Classes

### Animations

| Class | Effect |
|-------|--------|
| `.animate-glow` | Ocean blue glow effect |
| `.animate-fog-flow` | Mist flow animation |
| `.animate-pulse-subtle` | Subtle pulse |
| `.animate-slide-up` | Entrance animation |
| `.animate-fade-in` | Fade in |

All animations respect `prefers-reduced-motion`.

### Utility Classes

| Class | Effect |
|-------|--------|
| `.focus-ring` | Standard focus ring styling |
| `.touch-target` | Minimum 44x44px touch target |
| `.hover-surface` | Subtle hover background |
| `.hover-surface-strong` | Strong hover background |
| `.glass-panel` | Glassmorphism effect |

## Development Guidelines

### Component Styling Pattern

```tsx
import clsx from "clsx";

const Component = ({ className, ...props }) => (
  <div
    className={clsx(
      // Base layout with new tokens
      "rounded-card p-4 shadow-subtle",
      // Semantic aliases (auto dark mode)
      "bg-surface text-body border-hairline",
      // Interactive states
      "transition-all duration-200 ease-calm hover:shadow-medium",
      // Custom classes
      className
    )}
    {...props}
  />
);
```

### Color Selection Guide

| Building... | Use | Example |
|-------------|-----|---------|
| Cards, sections | Semantic alias | `bg-surface`, `bg-canvas` |
| Text content | Semantic alias | `text-body`, `text-muted` |
| Borders | Semantic alias | `border-hairline`, `border-edge` |
| CTAs, buttons | Brand | `bg-ocean-blue` |
| Decorative | Brand | `text-bougainvillea-pink` |
| Status feedback | Status | `text-status-error` |

### New Component Checklist

- [ ] Uses semantic color tokens
- [ ] Uses new shape tokens (`rounded-card`, etc.)
- [ ] Uses new shadow tokens (`shadow-subtle`, etc.)
- [ ] Uses `ease-calm` for transitions
- [ ] Responsive (mobile-first)
- [ ] Keyboard accessible
- [ ] Focus states visible (use `.focus-ring`)
- [ ] Touch targets 44x44px minimum (use `.touch-target`)
- [ ] Respects reduced motion
- [ ] Works in light and dark modes

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | Color tokens, shape tokens, animations |
| `apps/web/src/app/layout.tsx` | Font loading, theme init |
| `apps/web/tailwind.config.ts` | Tailwind theme extensions |
| `apps/web/src/stores/uiStore.ts` | Theme state management |
| `apps/web/src/components/catalyst-ui/` | Catalyst UI components (9 retained) |
| `apps/web/src/components/ui/card.tsx` | Base card with hoverable |
| `apps/web/src/components/providers/toast-provider.tsx` | Toast system |
| `apps/web/src/components/ui/mobile-bottom-nav.tsx` | Mobile navigation |
