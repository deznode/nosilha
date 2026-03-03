# Implementing Micro-Interactions – Workflow

This workflow defines how to use the `implementing-micro-interactions` Skill inside a real codebase.

Copy this checklist and track progress for each task:

```
* [ ] Step 1: Discover current motion usage
* [ ] Step 2: Install or update lib/animation
* [ ] Step 3: Wire MotionConfig and PageTransitionProvider
* [ ] Step 4: Refactor buttons to AnimatedButton
* [ ] Step 5: Refactor cards to HoverCard
* [ ] Step 6: Introduce FadeInSection in marketing pages
* [ ] Step 7: Implement route transitions
* [ ] Step 8: Validate reduced-motion behavior
* [ ] Step 9: Run visual and performance checks
```

---

## Step 1 – Discover Current Motion Usage

1. Scan the repo for Framer Motion usage:
   - Search for `from "framer-motion"` and `whileHover`, `whileTap`, `useScroll`, `layout`, `layoutId`.
2. Note where animations are defined:
   - Shared variants?
   - Hardcoded durations?
   - Repeated patterns in buttons, cards, modals?
3. Identify anti-patterns:
   - Animating `width`, `height`, `top`, `left` for micro-interactions
   - Copy-pasted variants with slightly different numbers
   - Missing reduced-motion paths
   - Mixed CSS transitions + Motion on the same property

---

## Step 2 – Install or Update `lib/animation`

1. Copy the `assets/lib/animation/` folder from the Skill into your project:
   - Place under `src/lib/animation/` or similar.
2. Ensure imports are updated:
   - `import { motion } from "framer-motion";`
   - `import { motionDuration, motionEasing, motionDistance } from "@/lib/animation";`
3. Confirm TypeScript configuration:
   - Set `baseUrl` or `paths` to resolve `@/lib/animation` if needed.

---

## Step 3 – Wire MotionConfig and PageTransitionProvider

1. Wrap your root layout with `MotionConfigProvider`:
   - Import from `lib/animation/config` or `lib/animation`.
2. In a client provider (or layout), wrap page content with `PageTransitionProvider`.
3. Ensure `PageTransitionProvider` uses `key={pathname}` and `AnimatePresence`.

---

## Step 4 – Refactor Buttons to `AnimatedButton`

1. Identify primary, secondary, and ghost buttons in the project.
2. Replace inline Motion code with `AnimatedButton` where feasible.
3. Map variants:
   - Primary/secondary/ghost map to existing design system tokens (colors, shadows).
4. Ensure loading and disabled states are wired to props.

---

## Step 5 – Refactor Cards to `HoverCard`

1. Identify card-like components (dashboard cards, resource cards, listing tiles).
2. Wrap base card markup with `HoverCard`.
3. Remove redundant `whileHover` logic; keep card children pure.
4. Validate hover and tap behavior on desktop and mobile.

---

## Step 6 – Introduce `FadeInSection` in Marketing and Landing Pages

1. Apply `FadeInSection` to major content sections:
   - Hero body copy
   - Feature rows
   - Testimonials
2. Ensure `viewport={{ once: true, amount: 0.3 }}` to avoid janky repeated animations.
3. Confirm reduced-motion mode falls back to instant appearance or minimal fade.

---

## Step 7 – Implement Route Transitions

1. Add `PageTransitionProvider` around the main `children` in `app/layout.tsx`.
2. Use small movements and opacity transitions (`y: 6` or `-6`, `duration: 0.18–0.24`).
3. Avoid large sweeping transitions that affect perceived performance.
4. Test forward/back navigation and deep links.

---

## Step 8 – Validate Reduced-Motion Behavior

1. Enable reduced motion in system settings or dev tools.
2. Confirm:
   - No large movements
   - Durations shortened or set to 0 where appropriate
   - Route transitions and micro-interactions fall back to simple state changes
3. Fix any components that still perform excessive motion.

---

## Step 9 – Visual and Performance Checks

1. Use browser dev tools to monitor:
   - FPS while interacting with animated components
   - Layout thrashing (avoid repeated layout reads/writes)
2. Run `npm run build` and bundle analysis tools to ensure:
   - Framer Motion bundle size is reasonable
   - Animation code is not duplicated across many chunks
3. If necessary, lazy-load animation-heavy components with `next/dynamic`.

---

## Implementation Rules Reference

Apply these rules when implementing or modifying animations:

### 1. Always Use Tokens

Import durations, easing, and distances from `lib/animation/tokens.ts`. Never hardcode values like `duration: 0.37` or `y: 37`.

```typescript
// ✅ Correct
import { motionDuration, motionEasing } from "@/lib/animation"
transition={{ duration: motionDuration.micro, ease: motionEasing.easeOut }}

// ❌ Incorrect
transition={{ duration: 0.37, ease: "easeOut" }}
```

### 2. Prefer Factories and Shared Variants

Use `makeFadeInUp`, `makeScaleIn`, and variants like `buttonMicro`, `listStagger`, `listItem` for repeated patterns instead of defining new variants.

### 3. Respect Reduced Motion

Use `useMotionConfig()` to read `reducedMotion`. In reduced-motion mode, fall back to instant or simple opacity transitions.

```typescript
const { reducedMotion } = useMotionConfig()
const variants = reducedMotion ? reducedVariants : fullVariants
```

### 4. Animate Transform + Opacity

Prefer `x`, `y`, `scale`, `rotate`, and `opacity` (GPU-friendly). Use `layout` and `layoutId` sparingly for layout transitions.

### 5. Encapsulate Micro-Interactions

Keep button/card/accordion interactions inside dedicated components under `lib/animation/components` rather than scattered through the codebase.

### 6. Route Transitions

Use `PageTransitionProvider` (from `lib/animation/components`) with `AnimatePresence` and `key={pathname}` for App Router transitions.

### 7. Accessibility

Ensure ARIA and visual states are aligned with animations. Never rely solely on motion to convey state.

---
