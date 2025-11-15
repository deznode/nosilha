# Micro-Interactions & Framer Motion in React/Next.js — Research & Blueprint

## 0. Scope & Assumptions

This report assumes:

* **React 19 RC** (with React Compiler support)
* **Next.js 15** (October 2024 release with App Router, improved caching, and enhanced Server Components)
* **TypeScript 5.x**
* **TailwindCSS**
* **Framer Motion / Motion for React** (latest version with `motion`, `variants`, `layout`, `layoutId`, `whileInView`, gestures, etc.) ([Motion][1])
* **Radix UI** (accessible primitives for enhanced micro-interactions)

### Key Technology Updates (2024-2025)

* **Next.js 15**: Improved caching semantics, better dynamic imports for animation libraries, enhanced Server/Client Component boundaries
* **React 19 Compiler**: Automatic memoization and optimization may affect animation re-render behavior
* **Bundle Optimization**: Use `next/dynamic` for lazy-loading Framer Motion to reduce initial JS payload
* **Performance Monitoring**: Regular bundle analysis (`next build && npx next-bundle-analyzer`) recommended

Examples are written to be **LLM-friendly**: strong conventions, reusable tokens, and low "foot-gun" surface area.

---

## 1. Foundations of Micro-Interactions

### 1.1 What is a High-Quality Micro-Interaction?

A micro-interaction is a **small, focused animation** tied to a single user intent:

* Hovering a button
* Tapping a toggle
* Opening a dropdown
* Adding an item to a cart
* Navigating between small view changes (stepper, tabs, etc.)

High-quality micro-interactions share these properties:

1. **Purposeful**

   * Communicate *feedback* (“your click worked”), *status change* (“saving…” → “saved”), or *navigation* (“you moved to a new section”).
2. **Subtle by default**

   * Small distances, short durations, no large camera-like pans.
3. **Predictable**

   * Same component type → same animation grammar (e.g., all primary buttons scale to `1.03` on hover, `0.97` on press).
4. **Fast**

   * Most micro-interactions live in the **150–250ms** range; large page transitions can go up to **300–450ms**.
5. **Reversible**

   * Animations reverse smoothly when state is undone (hover out, collapse, unselect).
6. **Accessible**

   * Respect `prefers-reduced-motion`, avoid unnecessary motion for motion-sensitive users, and don't hide essential information in an animation-only form. ([W3C][2])

### 1.2 When to Use / Avoid Animation

**Use animation when:**

* Signaling **state change** (on/off, open/closed, success/failure).
* Providing **continuity of context** (shared-element transitions, layout morphing). ([Motion][3])
* Gently **guiding attention** to new or important content.
* Representing **spatial relationships** (drag-and-drop, reordering, tab switch).

**Avoid or minimize animation when:**

* It’s purely decorative and appears **frequently** (e.g., constant looping backgrounds).
* It **blocks interaction** (long intros, blocking splash transitions).
* It causes **large movement across the screen** without strong functional justification (swooping modals).
* It violates user preference for reduced motion.

**LLM-ready rule:**

> If the animation doesn’t improve feedback, context, or comprehension, **skip it or make it extremely subtle**.

### 1.3 Timing, Easing, and Personality

* **Durations (Research-Backed 2024-2025):**

  * Micro feedback (button hover/press): **100–180ms** (optimal: 120–150ms)
  * Small state changes (accordion, dropdown): **180–300ms** (optimal: 200–240ms)
  * Route/page transitions: **220–400ms** (optimal: 280–350ms)
  * Maximum recommended: **400ms** (except large overlays or page-level transitions)

  *Note: Research shows the acceptable range is 100–400ms, with most micro-interactions performing best in the 150–250ms range.*

* **Ease curves:**

  * Use **cubic-bezier tokens** aligned with your design system, e.g.:

    * `easeOut` for entrances: `(0.16, 1, 0.3, 1)`
    * `easeIn` for exits: `(0.7, 0, 0.84, 0)`
    * `easeInOut` for symmetric transitions.
* **Personality:**

  * "Professional/productive": lower amplitude, faster (100–200ms).
  * "Playful/consumer": slightly longer durations, gentle overshoot (200–350ms).
  * "Cultural/heritage": measured, respectful pacing (200–300ms) that doesn't rush important content.

**LLM-ready rule:**

> Prefer durations between **0.10–0.40s** with most micro-interactions in the **0.15–0.25s** range. Use standard easing tokens and avoid values above **0.5s** except for major transitions.

### 1.4 Accessibility & Reduced Motion

Key guidance from WCAG 2.3.3 and the `prefers-reduced-motion` media feature: animation from interactions must be **suppressible** for users who request reduced motion. ([W3C][2])

Strategies:

* Wrap global animation config behind a **user preference flag** (context or Zustand/store).
* For `prefers-reduced-motion`, switch to:

  * Fade-only transitions (no big positional movement).
  * Shorter durations.
  * Or instant state changes when safe.

Tailwind + CSS example:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
  }
  .motion-safe-only {
    animation: none !important;
    transition: none !important;
  }
}
```

**LLM-ready rule:**

> Always provide a “reduced motion” path. When generating animation-heavy components, include a `reducedMotion` flag or check `prefers-reduced-motion`.

---

## 2. Framer Motion Best Practices

### 2.1 Variants & Orchestrated Sequences

**Variants** are Motion’s core abstraction for reusable animation states (`initial`, `hover`, `tap`, `exit`, etc.). They enable:

* **Consistent grammar** across components
* **Parent-controlled orchestration** (stagger, delay)
* Separation of **what animates** from **when it animates**

Example: shared button variants in TypeScript.

```ts
// lib/animation/variants.ts
import { Variants } from "framer-motion";

export const buttonMicro: Variants = {
  initial: { scale: 1, opacity: 0.98 },
  hover: {
    scale: 1.03,
    opacity: 1,
    transition: { duration: 0.16, ease: "easeOut" },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.12, ease: "easeInOut" },
  },
  disabled: { opacity: 0.5, scale: 1, pointerEvents: "none" },
};
```

Use orchestration at container level:

```ts
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};
```

**LLM-ready rule:**

> For any repeated structure (nav items, list cards, menu entries), **use parent variants + `staggerChildren`**; never hand-wire delays on each child.

### 2.2 Layout Transitions (`layout`, `layoutId`)

Motion supports **layout animations** via the `layout` prop and **shared element transitions** via `layoutId`. This lets you animate **position and size changes** automatically whenever React re-renders. ([Motion][3])

Typical patterns:

* Reordering card lists
* Expanding/collapsing panels
* Shared thumb moving between selected tabs
* Moving an item from list view → detail view

Example: animated card grid.

```tsx
// app/(main)/components/AnimatedCardGrid.tsx
"use client";

import { motion } from "framer-motion";
import { listStagger, listItem } from "@/lib/animation/variants";

type Card = { id: string; title: string; body: string };

interface AnimatedCardGridProps {
  cards: Card[];
}

export function AnimatedCardGrid({ cards }: AnimatedCardGridProps) {
  return (
    <motion.div
      variants={listStagger}
      initial="hidden"
      animate="show"
      layout
      className="grid gap-4 md:grid-cols-3"
    >
      {cards.map(card => (
        <motion.article
          key={card.id}
          layout
          variants={listItem}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold">{card.title}</h3>
          <p className="mt-1 text-xs text-slate-600">{card.body}</p>
        </motion.article>
      ))}
    </motion.div>
  );
}
```

For shared elements, use `layoutId`:

```tsx
<motion.div layoutId={`card-${card.id}`} />
```

**LLM-ready rules:**

* Use `layout` for **lists and reflow**.
* Use `layoutId` for **shared element transitions** across states/routes.
* Only wrap elements that **really need** layout measurements; avoid adding `layout` to huge trees.

### 2.3 Component-Level vs Global Animation Organization

**Component-level responsibility:**

* Local micro-interactions:

  * Button hover/press
  * Card hover
  * Toggle/thumb animation
* Component knows:

  * Its *role* (primary, secondary)
  * Its own *intensity* of animation

**Global responsibility:**

* **Route / page transitions**
* **Section transitions** (stepper, multi-step forms)
* **Global entrance sequences** (dashboard load)

Pattern:

* Use a `PageTransition` or `RouteTransitionShell` client component near the top of the App Router tree to manage route-level animations (see section 3).
* Keep micro-interactions encapsulated in leaf components.

**LLM-ready rule:**

> Put global transitions in a dedicated `PageTransition` wrapper; keep micro-interactions in leaf components (buttons, cards, toggles).

### 2.4 Gesture-Driven Interactions (hover, tap, drag)

Framer Motion provides `whileHover`, `whileTap`, and `drag` primitives. ([Motion][1])

Pattern for buttons:

```tsx
// app/(main)/components/PrimaryButton.tsx
"use client";

import { motion } from "framer-motion";
import { buttonMicro } from "@/lib/animation/variants";
import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
}

export function PrimaryButton({ children, disabled }: PrimaryButtonProps) {
  return (
    <motion.button
      type="button"
      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      variants={buttonMicro}
      initial="initial"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      animate={disabled ? "disabled" : "initial"}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
```

For drag:

* Restrict drag axis: `drag="x"` or `"y"`.
* Use **small ranges** and `dragConstraints`.
* Use `dragElastic` to control “rubber band” feel.

### 2.5 Scroll & Viewport-Based Animation

Motion supports:

* `whileInView`
* `viewport={{ once: true, amount: 0.4 }}`
* Scroll-linked animation hooks (`useScroll` / `useTransform` equivalents). ([Shakuro][4])

Example: fade-up section on scroll.

```tsx
// app/(marketing)/components/FadeInSection.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

interface FadeInSectionProps {
  children: ReactNode;
}

export function FadeInSection({ children }: FadeInSectionProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="motion-safe-only"
    >
      {children}
    </motion.section>
  );
}
```

### 2.6 Performance Tuning & Anti-Patterns

Performance best practices from Motion docs and expert articles: ([Medium][5])

**Do:**

* Animate **transform** (`x`, `y`, `scale`, `rotate`) and `opacity` whenever possible → GPU friendly.
* Use `layout` only where you need automatic layout transitions.
* Use `whileInView`, lazy load, or conditional rendering for off-screen animations.
* Use `LazyMotion` / code-splitting when animations are heavy or rarely used.
* For scrollable containers with layout animations, use `layoutScroll`. ([Motion][1])

**Avoid:**

* Animating `width`, `height`, `top`, `left` directly unless necessary.
* Adding `layout` to every child in huge lists → layout thrash.
* Storing variant objects inside component bodies (causes recreation every render).
* Combining CSS `transition` on the same property that Motion controls → conflicting animations.

**LLM-ready rules:**

* Prefer `transform` + `opacity`.
* Put variant objects **outside** components.
* Don't mix CSS `transition` with Motion on the same CSS property.

### 2.7 Advanced Performance Optimization & Bundle Analysis

Beyond basic performance patterns, production applications require systematic optimization and monitoring.

**Bundle Analysis Workflow:**

Regular bundle analysis helps identify animation library overhead:

```bash
# Build and analyze bundle
npm run build
npx next-bundle-analyzer

# Look for:
# - Framer Motion bundle size (should be tree-shaken)
# - Duplicate animation code across chunks
# - Unnecessary motion components in initial bundle
```

**Lazy-Loading Animation Libraries:**

Use Next.js dynamic imports to defer animation library loading:

```tsx
import dynamic from 'next/dynamic';

// Lazy-load heavy animated component
const AnimatedHero = dynamic(
  () => import('@/components/AnimatedHero'),
  {
    ssr: false, // Skip SSR for animation-heavy components
    loading: () => <StaticHeroFallback />
  }
);

// Lazy-load Framer Motion itself for rarely-used features
const LazyMotion = dynamic(() => import('framer-motion').then(mod => ({
  default: mod.LazyMotion
})));
```

**Code Splitting for Animation Variants:**

Separate complex animation variants into their own modules:

```ts
// lib/animation/variants/complex.ts - loaded only when needed
export const complexPageTransitions: Variants = {
  // Heavy animation logic here...
};

// Usage with dynamic import
const loadComplexVariants = () =>
  import('@/lib/animation/variants/complex');

// In component
const [variants, setVariants] = useState(null);
useEffect(() => {
  if (needsComplexAnimation) {
    loadComplexVariants().then(mod => setVariants(mod.complexPageTransitions));
  }
}, [needsComplexAnimation]);
```

**Offscreen Animation Management:**

Automatically pause animations outside the viewport:

```tsx
import { useInView } from 'framer-motion';

const AnimatedSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false, // Re-trigger when scrolling back
    margin: "0px 0px -200px 0px" // Start before fully visible
  });

  return (
    <motion.section
      ref={ref}
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInVariants}
    >
      {/* Content only animates when in viewport */}
    </motion.section>
  );
};
```

**Device Capability Detection:**

Adjust animation complexity based on device performance:

```ts
// lib/utils/device-detection.ts
export const getDeviceCapability = () => {
  if (typeof window === 'undefined') return 'high';

  const memory = (navigator as any).deviceMemory; // GB
  const cores = navigator.hardwareConcurrency;
  const connection = (navigator as any).connection;

  // Low-end: <4GB RAM or <4 cores
  if (memory < 4 || cores < 4) return 'low';

  // Medium: slow connection even with decent hardware
  if (connection?.effectiveType === '3g') return 'medium';

  return 'high';
};

// Usage in animation config
const capability = getDeviceCapability();

const animationConfig = {
  low: { duration: 0.1, complexity: 'minimal' },
  medium: { duration: 0.2, complexity: 'moderate' },
  high: { duration: 0.3, complexity: 'full' }
}[capability];
```

**Frame Rate Monitoring:**

Monitor and adapt to poor performance at runtime:

```tsx
import { useEffect, useState } from 'react';

const useFrameRate = () => {
  const [isLowFPS, setIsLowFPS] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const checkFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setIsLowFPS(fps < 30); // Flag if below 30 FPS

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(checkFrameRate);
    };

    const rafId = requestAnimationFrame(checkFrameRate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return isLowFPS;
};

// Usage: simplify animations if FPS drops
const Component = () => {
  const isLowFPS = useFrameRate();

  return (
    <motion.div
      animate={{ scale: isLowFPS ? 1 : 1.05 }}
      transition={{ duration: isLowFPS ? 0 : 0.2 }}
    />
  );
};
```

**Optimized Asset Loading:**

Use efficient formats for animated assets:

```tsx
// Prefer SVG for simple icons and loaders
const LoadingSpinner = () => (
  <svg className="animate-spin" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  </svg>
);

// CSS animation instead of JS for simple spinners
// globals.css
/*
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
*/
```

**Edge Caching for Animation Data:**

Leverage Next.js 15's caching for animation configuration:

```ts
// app/actions/animation-config.ts
'use server';

import { unstable_cache } from 'next/cache';

export const getAnimationConfig = unstable_cache(
  async () => {
    // Heavy computation or API call for animation settings
    return {
      enableParallax: true,
      complexTransitions: false,
      // ... more config
    };
  },
  ['animation-config'],
  { revalidate: 3600 } // Cache for 1 hour
);
```

**Performance Monitoring:**

Track Core Web Vitals impact of animations:

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights /> {/* Monitors FCP, LCP, CLS, etc. */}
      </body>
    </html>
  );
}
```

**LLM-ready rules for performance:**

> 1. **Bundle analysis**: Run `npx next-bundle-analyzer` after adding animations
> 2. **Lazy loading**: Use `next/dynamic` for animation-heavy components
> 3. **Viewport detection**: Only animate visible elements with `useInView`
> 4. **Device adaptation**: Adjust complexity based on `deviceMemory` and `hardwareConcurrency`
> 5. **Frame monitoring**: Simplify animations if FPS drops below 30
> 6. **Asset optimization**: Prefer SVG/CSS for simple animations over JS

### 2.8 Enhancing Radix UI Primitives with Micro-Interactions

Radix UI provides accessible, unstyled component primitives that comply with WAI-ARIA and WCAG 2.1 AA standards. Adding micro-interactions requires careful integration to preserve accessibility.

**Interaction States Requiring Visual Feedback:**

* **Hover** (`:hover`, `data-state="hover"`)
  - Change background or outline to indicate interactivity
  - Maintain minimum 3:1 contrast ratio with background
  - Use subtle scale (1.02) or elevation changes

* **Focus** (`data-state="focus"`, `:focus-visible`)
  - Provide clear focus rings for keyboard navigation
  - Maintain 4.5:1 contrast ratio for focus indicators
  - Ensure focus states are visible on all backgrounds

* **Active/Pressed** (`data-state="active"`, `:active`)
  - Slight scale-down (0.97–0.98) or color shift with `whileTap`
  - Ensure state persists long enough for screen reader feedback
  - Don't rely solely on animation to communicate state

* **Disabled** (`data-disabled`, `aria-disabled`)
  - Dimmed styling (opacity: 0.5–0.6)
  - `cursor: not-allowed` to prevent interaction attempts
  - Maintain sufficient contrast for text readability (even when disabled)

* **Expanded/Collapsed** (`data-state="open|closed"`)
  - Animate accordion panels with height transitions
  - Announce state changes via `aria-expanded`
  - Use chevron rotation to reinforce visual state

**Compound Component Pattern:**

Wrap Radix triggers and content in `motion` components while forwarding refs:

```tsx
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const MotionAccordionContent = motion(
  forwardRef<HTMLDivElement, Accordion.AccordionContentProps>(
    (props, ref) => <Accordion.Content ref={ref} {...props} />
  )
);

// Usage with animation
<Accordion.Root type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>
      <motion.div whileHover={{ scale: 1.02 }}>
        What is Radix UI?
      </motion.div>
    </Accordion.Trigger>
    <MotionAccordionContent
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      Radix UI is an accessible component library...
    </MotionAccordionContent>
  </Accordion.Item>
</Accordion.Root>
```

**Reduced-Motion Support:**

Always check `prefers-reduced-motion` when animating Radix components:

```tsx
import { useReducedMotion } from 'framer-motion';

const reducedMotion = useReducedMotion();

const accordionTransition = reducedMotion
  ? { duration: 0 } // Instant for reduced motion
  : { duration: 0.2, ease: "easeOut" };
```

**Accessible State Announcements:**

Ensure visual animations are accompanied by proper ARIA announcements:

```tsx
<Accordion.Trigger
  aria-expanded={isOpen}
  aria-controls="content-id"
>
  <motion.div
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <ChevronIcon />
  </motion.div>
  {title}
</Accordion.Trigger>
```

**Common Radix + Motion Patterns:**

* **Dialog/Modal**: Animate backdrop opacity + content scale/slide
* **Dropdown Menu**: Animate height/opacity with `AnimatePresence`
* **Tooltip**: Subtle fade-in with slight Y offset
* **Toggle**: Thumb slide animation with spring physics
* **Tabs**: Animated underline using `layoutId` for shared element transitions

**LLM-ready rules for Radix UI:**

> 1. **Forward refs**: Use `forwardRef` when wrapping Radix components with `motion`
> 2. **Preserve ARIA**: Never remove or override Radix's accessibility attributes
> 3. **Contrast ratios**: Hover (3:1), Focus (4.5:1), Text (4.5:1 for normal, 3:1 for large)
> 4. **Reduced motion**: Always provide instant or simplified alternatives
> 5. **State sync**: Ensure visual animations match `data-state` attributes

---

## 3. Next.js App Router Integration

### 3.1 Client vs Server Components for Animated UI

Current reality: Framer Motion/Motion relies on **client-side React**. To use animations within the App Router:

* Animation components must be **Client Components** (`"use client"` at top).
* They can be **leaf nodes** inside Server Components, receiving data via props.

Pattern:

```tsx
// app/(main)/page.tsx — Server Component
import { AnimatedCardGrid } from "./components/AnimatedCardGrid";

export default async function Page() {
  const cards = await getCards(); // server data
  return (
    <div className="px-6 py-10">
      <AnimatedCardGrid cards={cards} />
    </div>
  );
}
```

```tsx
// app/(main)/components/AnimatedCardGrid.tsx — Client Component
"use client";

import { motion } from "framer-motion";
// ...same as earlier example
```

### 3.2 Route Transitions in the App Router

App Router + Framer Motion has some known integration limitations due to React Server Components. Community approaches wrap Framer Motion in client boundaries and use `AnimatePresence` with `usePathname` from `next/navigation`. ([GitHub][6])

Pattern:

```tsx
// app/providers/PageTransitionProvider.tsx
"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface Props {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: Props) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.22 } }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

Usage in `app/layout.tsx`:

```tsx
// app/layout.tsx — Server Component
import type { ReactNode } from "react";
import "./globals.css";
import { PageTransitionProvider } from "./providers/PageTransitionProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
```

**LLM-ready rules:**

* Put **all page content** under a single animated wrapper with `key={pathname}`.
* Use `AnimatePresence` with `mode="wait"` for route transitions.
* Keep route transitions **short and subtle**; don’t animate huge translations.

### 3.3 Streaming & Suspense Boundaries

With App Router, parts of the UI stream in through **Suspense**.

Guidelines:

* Prefer animations on **final content**, not skeletons, unless the skeleton is central to UX.
* If animating skeletons, use **simple opacity / shimmer** only.
* Avoid long entrance animations the moment data resolves; they add perceived latency.
* If a component is frequently suspended/resumed, keep its animation **idempotent and cheap**.

Pattern:

```tsx
// app/(dashboard)/page.tsx
import { Suspense } from "react";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { DashboardContent } from "./components/DashboardContent";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

`DashboardContent` can use Motion for subtle **fade-in** once loaded.

### 3.4 Hydration & Motion Placement

To avoid hydration issues and oversized client bundles:

* Keep the **root layout** mostly server-rendered.
* Use Motion only in targeted client components:

  * `AnimatedNav`
  * `PageTransitionProvider`
  * `AnimatedCardGrid`
  * `Modal`, `Drawer`, etc.

**LLM-ready rule:**

> When adding animations in App Router, create **small client wrappers** for motion, and keep heavy logic and data fetching in Server Components.

---

## 4. Mobile-First Micro-Interaction Considerations

Mobile devices introduce unique constraints and opportunities for micro-interactions. Designing mobile-first ensures optimal performance and user experience across all devices.

### 4.1 Touch Gestures & Tactile Feedback

**Touch Targets:**

* **Minimum size**: 44×44 px for all interactive elements (WCAG 2.1 AA requirement)
* Add sufficient spacing between interactive elements to prevent accidental taps
* Use `touch-action: manipulation` CSS to prevent 300ms tap delay

**Gesture Support:**

* Use natural gestures: swipe, pinch, long-press for common actions
* Provide haptic feedback via the Vibration API where supported:

```ts
// Simple haptic feedback on button tap
const handleTap = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // Brief 10ms vibration
  }
  // Continue with action...
};
```

**Haptic Alternatives:**

When haptic feedback isn't available or user has reduced motion enabled:

* Short, crisp visual animations (scale pulse, color flash)
* Audio clicks or confirmation sounds (with user preference toggle)
* Immediate visual state change (button press effect, selection highlight)

### 4.2 Performance on Lower-Powered Devices

**Offscreen Animation Management:**

* Pause or disable animations for elements outside the viewport
* Use Intersection Observer to detect visibility:

```tsx
const [isVisible, setIsVisible] = useState(false);
const ref = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsVisible(entry.isIntersecting);
  });
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

return (
  <motion.div
    ref={ref}
    animate={isVisible ? "visible" : "hidden"}
    variants={fadeInVariants}
  />
);
```

**Device Capability Detection:**

* Detect device performance and adjust animation complexity:

```ts
// Simple performance detection
const isLowEndDevice = () => {
  const memory = (navigator as any).deviceMemory; // GB
  const cores = navigator.hardwareConcurrency;
  return memory < 4 || cores < 4;
};

// Adjust animation based on device
const animationDuration = isLowEndDevice() ? 0.1 : 0.25;
```

**Reduced Frame Rate Fallback:**

* For complex animations, reduce frame rate or switch to CSS transitions on low-end devices
* Use `will-change` sparingly to hint GPU acceleration only when needed

**Optimized Assets:**

* Use animated SVG or CSS sprites instead of heavy JS for simple icons and loaders
* Lazy-load animation libraries with `next/dynamic`:

```tsx
const AnimatedComponent = dynamic(() => import('./AnimatedComponent'), {
  ssr: false,
  loading: () => <StaticFallback />
});
```

### 4.3 Mobile-Specific UX Patterns

**Pull-to-Refresh:**

* Use drag gesture with rubber-band effect
* Provide clear visual feedback during the drag
* Animate state transition from "pull" → "loading" → "complete"

**Swipe Actions:**

* Reveal actions on horizontal swipe (delete, archive, etc.)
* Provide visual hint with partially revealed action icons
* Use haptic feedback when action threshold is reached

**Scroll-Based Animations:**

* Keep scroll-triggered animations subtle on mobile to avoid janky performance
* Use `viewport={{ once: true, amount: 0.3 }}` to trigger animations earlier on small screens

**LLM-ready rules:**

> For mobile-first micro-interactions:
> 1. **Touch targets**: minimum 44×44 px
> 2. **Haptic feedback**: implement with fallbacks
> 3. **Performance**: detect device capability and adjust
> 4. **Offscreen**: pause or simplify animations outside viewport
> 5. **Assets**: prefer CSS/SVG over heavy JS animations

---

## 5. Cultural Heritage & Community-Focused Micro-Interactions

Cultural heritage platforms benefit from micro-interactions that foster engagement, storytelling, and social connection while respecting the cultural significance of content.

### 5.1 Contextual Storytelling Patterns

**Historical Map Overlays:**

* Animate map layer transitions with fade and slide to guide exploration
* Use subtle pulse animations to highlight points of interest
* Implement smooth zoom transitions when focusing on specific locations

```tsx
// Map overlay fade-in pattern
const mapLayerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

<motion.div
  variants={mapLayerVariants}
  initial="hidden"
  animate="visible"
  className="map-historical-overlay"
>
  {/* Historical layer content */}
</motion.div>
```

**Artifact & Heritage Detail Reveals:**

* Reveal tooltips with subtle scale-up on tap or hover
* Display provenance information with staggered fade-in
* Use respectful, measured timing (250–300ms) that doesn't rush cultural content

```tsx
// Artifact tooltip pattern
const artifactTooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" }
  }
};
```

**Timeline & Historical Narrative:**

* Animate timeline segments with progressive disclosure
* Use scroll-linked animations to reveal historical periods
* Implement gentle parallax effects for depth without distraction

### 5.2 Community Engagement Patterns

**Participation Badges & Achievements:**

* Animate badge unlocks with celebratory flip or bounce
* Use haptic feedback (mobile) when badges are earned
* Provide satisfying visual feedback to reinforce positive contributions

```tsx
// Badge unlock animation
const badgeUnlockVariants: Variants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.6
    }
  }
};
```

**Discussion Threads & Comments:**

* Use skeleton loaders with pulse animations for loading replies
* Animate new comment appearance with subtle slide-in
* Highlight mentioned users or quoted text with gentle background flash

```tsx
// Comment skeleton loader
const skeletonPulse = {
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};
```

**Contribution Indicators:**

* Animate upload progress with smooth transitions
* Provide immediate visual feedback for likes, shares, bookmarks
* Use micro-celebrations for meaningful contributions (first post, milestone achievements)

### 5.3 Multilingual & Inclusive Design

**Language Switcher Animations:**

* Animate language dropdown expand/collapse to orient users
* Fade-swap text content when language changes
* Use layout animations to handle text length changes gracefully

```tsx
// Language switch with layout animation
<motion.div layout transition={{ duration: 0.2 }}>
  <AnimatePresence mode="wait">
    <motion.p
      key={currentLanguage}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
    >
      {translatedContent[currentLanguage]}
    </motion.p>
  </AnimatePresence>
</motion.div>
```

**Accessibility Feature Toggles:**

* Provide step-by-step animated guidance for assistive features
* Animate text-to-speech activation with clear visual indicator
* Use respectful, clear animations for high-contrast mode transitions

**Cultural Sensitivity Considerations:**

* Avoid overly playful or frivolous animations for sacred or sensitive content
* Use measured, dignified pacing (250–350ms) for memorial or historical trauma content
* Provide option to disable decorative animations while preserving functional feedback

### 5.4 Discovery & Exploration

**Directory Entry Cards:**

* Hover elevation effect to indicate interactivity
* Stagger card grid animations on initial load
* Use subtle scale and shadow transitions for selection states

```tsx
// Directory card hover pattern
const directoryCardVariants: Variants = {
  initial: { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};
```

**Filter & Search Interactions:**

* Animate filter panel slide-in/out
* Provide immediate visual feedback on filter selection
* Use loading skeletons during search result updates

**Media Gallery Navigation:**

* Implement smooth image carousel transitions
* Use thumbnail preview animations on hover
* Provide context-preserving zoom animations for image detail views

**LLM-ready rules for cultural heritage:**

> 1. **Respectful timing**: Use 200–300ms for cultural content (measured, not rushed)
> 2. **Purposeful animation**: Every animation should serve storytelling or engagement
> 3. **Accessibility first**: Ensure reduced-motion alternatives for all decorative effects
> 4. **Cultural sensitivity**: Avoid playful animations for sensitive historical content
> 5. **Community engagement**: Celebrate contributions with satisfying micro-interactions

---

## 6. TailwindCSS + Motion as an Animation System

Modern templates and component libraries successfully blend Tailwind with Motion to ship production-ready animated UIs. ([Medium][7])

### 6.1 Division of Responsibilities

* **TailwindCSS**:

  * Layout (flex, grid, spacing)
  * Color, typography, radius, shadow
  * Simple transitions (color, background, box-shadow)
* **Framer Motion**:

  * Spatial movement (x/y, scale, rotate)
  * Opacity transitions
  * Entrance/exit, whileInView, dragging
  * Complex choreography (stagger, layoutId, gestures)

**LLM-ready rule:**

> Tailwind → **static style & simple transitions**, Motion → **stateful motion and spatial change**.

### 6.2 Clean Composition Patterns

Good pattern:

```tsx
<motion.button
  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
/>
```

Avoid:

* Using Tailwind’s `transition-transform` on the same element when Motion animates `scale` or `translate` — pick one or ensure static transitions handle **different properties**.

### 6.3 Shared Durations & Easings via Tailwind Config

You can codify animation tokens in Tailwind and re-export them to TypeScript.

`tailwind.config.ts`:

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export const animationTokens = {
  fast: 0.16,
  normal: 0.22,
  slow: 0.32,
};

export const easingTokens = {
  inOut: "cubic-bezier(0.45, 0, 0.55, 1)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
};

const config: Config = {
  theme: {
    extend: {
      transitionDuration: {
        fast: `${animationTokens.fast * 1000}ms`,
        normal: `${animationTokens.normal * 1000}ms`,
      },
      transitionTimingFunction: {
        "ease-out-productive": easingTokens.out,
        "ease-in-out-productive": easingTokens.inOut,
      },
    },
  },
  plugins: [],
};

export default config;
```

Then in `lib/animation/tokens.ts`:

```ts
// lib/animation/tokens.ts
export const motionDuration = {
  fast: 0.16,
  normal: 0.22,
  slow: 0.32,
} as const;

export const motionEasing = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.45, 0, 0.55, 1] as const,
};
```

**LLM-ready rule:**

> When generating animations, **import durations/easings from `tokens.ts`** instead of hardcoding numbers.

---

## 6. Patterns for LLM / Code-Gen Integration

The goal: make it easy for an LLM to generate **correct, consistent** animations by default.

### 6.1 Reusable Animation Tokens

Create a central `tokens.ts`:

```ts
// lib/animation/tokens.ts
export const motionDuration = {
  instant: 0,
  micro: 0.12,
  fast: 0.18,
  normal: 0.24,
  slow: 0.32,
} as const;

export const motionEasing = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.45, 0, 0.55, 1] as const,
};

export const motionDistance = {
  xSmall: 4,
  small: 8,
  medium: 16,
} as const;
```

LLM behavior:

* For new micro-interactions, pick **`fast` or `micro`**.
* For entrances/exits, use `normal` or `slow` depending on distance.

### 6.2 Variant Factories

Rather than bespoke variants, define **factory functions**:

```ts
// lib/animation/factories.ts
import { Variants } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "./tokens";

export function makeFadeInUp(distance = motionDistance.small): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionDuration.normal,
        ease: motionEasing.out,
      },
    },
  };
}

export function makeScaleIn(): Variants {
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.out,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.in,
      },
    },
  };
}
```

**LLM-ready rule:**

> When asked to create a new component’s micro-interaction, **use factory functions** from `factories.ts` before inventing new variants.

### 6.3 Component Templates

#### 6.3.1 Animated Button Template

* Uses shared tokens
* Supports `loading` and `disabled`
* Performs subtle scale on hover/tap

```tsx
// lib/components/motion/AnimatedButton.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { buttonMicro } from "@/lib/animation/variants";

type Variant = "primary" | "secondary" | "ghost";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

const variantClassName: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-slate-800 text-slate-50 hover:bg-slate-700 focus-visible:ring-slate-500",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
};

export function AnimatedButton({
  children,
  variant = "primary",
  loading,
  disabled,
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variantClassName[variant],
        isDisabled && "opacity-60 cursor-not-allowed",
      ]
        .filter(Boolean)
        .join(" ")}
      variants={buttonMicro}
      initial="initial"
      whileHover={isDisabled ? undefined : "hover"}
      whileTap={isDisabled ? undefined : "tap"}
      animate={isDisabled ? "disabled" : "initial"}
      disabled={isDisabled}
    >
      {children}
    </motion.button>
  );
}
```

LLM should **clone** this pattern for all button-like controls (icon buttons, segmented controls, etc.).

#### 6.3.2 Card + Hover Elevation

```tsx
// lib/components/motion/HoverCard.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { motionDuration, motionEasing } from "@/lib/animation/tokens";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.article
      className={`rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm ${className ?? ""}`}
      whileHover={{
        y: -2,
        boxShadow: "0 10px 25px rgba(15,23,42,0.45)",
        transition: {
          duration: motionDuration.fast,
          ease: motionEasing.out,
        },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.article>
  );
}
```

#### 6.3.3 Modal with Backdrop

Key rules:

* Animate **backdrop opacity** and **modal scale/position**.
* Use `AnimatePresence` for exit.
* Close on `onClick` of backdrop.

(You can pattern-match from common Framer Motion modal examples; LLM should reuse the same structure each time.)

### 6.4 Encoding Animation Semantics in Prompts/Metadata

To help LLMs reason about intent:

* Use **semantic names**: `fadeInUp`, `scaleIn`, `subtleHover`, `navUnderline`.
* Include JSdoc tags:

```ts
/**
 * @microinteraction
 * @purpose feedback
 * @intensity subtle
 */
export function makeFadeInUp(...) { ... }
```

* For components, document expected motion behavior in comments, e.g.:

```tsx
// Behavior: On hover, card lifts slightly and shadow deepens.
// On tap, card compresses subtly.
export function HoverCard(...) { ... }
```

### 6.5 Error-Resistant Defaults

Hard rules you can encode into tools:

1. **Durations**:

   * Micro: `0.12–0.18s`
   * Normal transitions: `0.2–0.3s`
   * Avoid `> 0.5s` except for large overlays or page-level transitions.
2. **Scale**:

   * Hover: `1.02–1.05`
   * Tap: `0.95–0.98`
3. **Distance**:

   * Fade-up/down: `4–16px`
4. **Properties**:

   * Stick to `transform` + `opacity`.
5. **A11y**:

   * Always allow a reduced-motion path.

---

## 7. LLM-Ready Rules Summary (Checklists)

### Generation Checklist for Any Animated Component

When an LLM generates a Motion component, it should:

1. Import shared **tokens** and **factories** from `lib/animation`.
2. Use a **named variant** or factory instead of ad-hoc values.
3. Animate **transform/opacity** only, unless layout animations are intended.
4. Respect a **reduced-motion flag** (prop, context, or hook).
5. For repeated elements, use **parent variants with `staggerChildren`**.
6. Keep durations **within defined token ranges**.

### Route Transition Checklist

For route-level transitions in Next.js App Router:

1. Wrap `children` of `RootLayout` in a **client `PageTransitionProvider`**.
2. Use `AnimatePresence` with `key={pathname}`.
3. Use short, subtle transitions (opacity + small y offset).
4. Do not animate huge viewport-wide movements for every route change.

---

## 8. Micro-Interaction Library Blueprint

This is a blueprint an LLM (or human) can follow to implement a reusable micro-interaction layer.

### 8.1 Directory Structure

```text
src/
  lib/
    animation/
      tokens.ts         # durations, easing, distances
      variants.ts       # common Variants (button, list, modal, toast)
      factories.ts      # makeFadeInUp, makeScaleIn, etc.
      config.ts         # global settings (reduced motion, enable/disable)
    components/
      motion/
        AnimatedButton.tsx
        HoverCard.tsx
        NavLinkUnderline.tsx
        Modal.tsx
        AccordionItem.tsx
        ListStagger.tsx
  app/
    providers/
      PageTransitionProvider.tsx
    (main)/
      page.tsx
      components/
        AnimatedCardGrid.tsx
        FadeInSection.tsx
```

### 8.2 Responsibilities

* `tokens.ts`

  * Single source of truth for durations, easing, distances.
* `variants.ts`

  * Simple named `Variants` for core primitives:

    * `buttonMicro`
    * `listStagger`, `listItem`
    * `modal`, `backdrop`
    * `toast`
* `factories.ts`

  * Parametric variant generators (`makeFadeInUp`, `makeScaleIn`, `makeSlideInFrom(direction)`).
* `config.ts`

  * Reads `prefers-reduced-motion` and propagates a `reducedMotion` boolean via context/hook.

### 8.3 Example: `config.ts` + Hook

```ts
// lib/animation/config.ts
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface MotionConfig {
  reducedMotion: boolean;
}

const MotionConfigContext = createContext<MotionConfig>({
  reducedMotion: false,
});

export function MotionConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <MotionConfigContext.Provider value={{ reducedMotion }}>
      {children}
    </MotionConfigContext.Provider>
  );
}

export function useMotionConfig() {
  return useContext(MotionConfigContext);
}
```

LLM behavior:

* Wrap the app body in `MotionConfigProvider`.
* In animated components, read `reducedMotion` and switch to simpler variants if true.

### 8.4 Blueprint Usage Flow (for LLMs)

When asked, for example, “Create an animated accordion item”:

1. Import `useMotionConfig`, `motionDuration`, `motionEasing`.
2. Use `layout` and `AnimatePresence` for height/opacity.
3. Use subtle `y` + opacity for content.
4. Respect `reducedMotion` by skipping `y` and using faster durations.

Rough ASCII wiring:

```text
[Server Layout] -> [PageTransitionProvider] -> [Page Content]
                          |
                    [MotionConfigProvider]
                          |
           [Leaf Motion Components (button, card, modal, etc.)]
```

---

## 9. Further Reading & Reference Material

These are high-signal resources that reinforce the patterns above:

* **Motion / Framer Motion Docs (Official)**
  Layout animations, `layout`/`layoutId`, `layoutScroll`, Motion component API, and performance guidance. ([Motion][3])
* **Framer Motion Layout Animations Deep Dive** (Maxime Heckel)
  Excellent conceptual overview and practical patterns for layout and shared element animations. ([Maxime Heckel Blog][8])
* **Framer Motion “New and Underestimated Features”** (gestures, scroll, accessibility) ([Shakuro][4])
* **Accessibility & Reduced Motion**

  * WCAG techniques for animation from interactions ([W3C][2])
  * MDN `prefers-reduced-motion` reference ([MDN Web Docs][9])
* **Tailwind + Framer Motion Real-World Examples**

  * Tailwind + Motion integration guides and blog posts ([Hoverify][10])
  * Production-ready animated component libraries (Aceternity components, Kokonut UI) ([Aceternity][11])
* **Next.js App Router & Framer Motion Discussions**

  * Community approaches to App Router page transitions and limitations. ([GitHub][6])

If you’d like, next step I can:

* Turn this blueprint into a **concrete `lib/animation` folder** with full code, or
* Design a **“Motion Skill” prompt spec** expressly for LLMs (Claude/Gemini) using these rules as constraints.

[1]: https://motion.dev/docs/react-motion-component?utm_source=chatgpt.com "Motion component - React"
[2]: https://www.w3.org/WAI/WCAG21/Techniques/css/C39?utm_source=chatgpt.com "Using the CSS prefers-reduced-motion query to prevent ..."
[3]: https://motion.dev/docs/react-layout-animations?utm_source=chatgpt.com "Layout Animation — React FLIP & Shared Element - Motion"
[4]: https://shakuro.com/blog/framer-motion-new-and-underestimated-features?utm_source=chatgpt.com "Framer-Motion: New And Underestimated Features"
[5]: https://medium.com/%40pareekpnt/mastering-framer-motion-a-deep-dive-into-modern-animation-for-react-0e71d86ffdf6?utm_source=chatgpt.com "The Ultimate Guide to Framer Motion"
[6]: https://github.com/vercel/next.js/discussions/42658?utm_source=chatgpt.com "How to animate route transitions in `app` directory? #42658"
[7]: https://er-raj-aryan.medium.com/tailwind-css-framer-motion-the-pocket-template-new-tailwind-jobs-portal-712e11ae4fc8?utm_source=chatgpt.com "Tailwind CSS + Framer Motion = The “Pocket” Template ..."
[8]: https://blog.maximeheckel.com/posts/framer-motion-layout-animations/?utm_source=chatgpt.com "Everything about Framer Motion layout animations"
[9]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion?utm_source=chatgpt.com "prefers-reduced-motion - CSS - MDN Web Docs"
[10]: https://tryhoverify.com/blog/animating-react-components-with-tailwind-and-framer-motion/?utm_source=chatgpt.com "Animating React Components with Tailwind and Framer ..."
[11]: https://www.aceternity.com/components?utm_source=chatgpt.com "Tailwind CSS and Framer Motion Components - Aceternity"
