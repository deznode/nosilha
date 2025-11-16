# Motion System Architect – Workflow

This workflow describes how to analyze, design, and evolve a motion system using this Skill.

Copy this checklist:

```
* [ ] Step 1: Inventory current motion usage
* [ ] Step 2: Identify gaps and anti-patterns
* [ ] Step 3: Define target architecture
* [ ] Step 4: Design tokens and primitives
* [ ] Step 5: Plan migration and refactors
* [ ] Step 6: Document standards and patterns
* [ ] Step 7: Establish governance and review process
```

---

## Step 1 – Inventory Current Motion Usage

1. Scan the project for:
   - Imports from `framer-motion` or `motion`
   - `whileHover`, `whileTap`, `AnimatePresence`, `layout`, `layoutId`
2. Group usage by:
   - Component type (buttons, cards, lists, modals, nav)
   - Route or section (marketing, dashboard, settings)
3. Note variation in:
   - Durations, easing, distances
   - Naming style for variants
   - Accessibility (reduced-motion, ARIA alignment)

---

## Step 2 – Identify Gaps and Anti-Patterns

1. Look for:
   - Hardcoded magic numbers
   - Mixed CSS and Motion animations on the same property
   - Inconsistent behavior for similar components
   - Missing reduced-motion paths
2. Create a short list of the top issues:
   - E.g. "Button animations inconsistent", "No route transitions", "No lib/animation layer".

---

## Step 3 – Define Target Architecture

1. Decide on the desired `lib/animation` structure:
   - `tokens.ts`, `variants.ts`, `factories.ts`, `config.ts`, `components/`
2. Decide where motion is centralized vs local:
   - Shared components vs inline use
3. Create an architecture description:
   - One or two pages describing the target model and guiding principles.

---

## Step 4 – Design Tokens and Primitives

1. Define tokens:
   - Duration ranges (micro/fast/normal/slow/page)
   - Easing presets
   - Distance presets (xSmall/small/medium/large)
2. Define variants:
   - Buttons, lists, modals, toasts, fades
3. Define factories:
   - `makeFadeInUp`, `makeScaleIn`, `makeSlideInFrom(direction)`
4. Ensure tokens reflect the brand and UX goals.

---

## Step 5 – Plan Migration and Refactors

1. Prioritize high-impact areas:
   - User-facing core flows (auth, checkout, editor, etc.)
   - High-traffic surfaces (landing, dashboard home)
2. Create a migration backlog:
   - "Replace button animations with AnimatedButton"
   - "Add PageTransitionProvider"
   - "Introduce HoverCard in dashboard tiles"
3. For each item:
   - State the problem
   - State target implementation
   - Estimate effort and risk

---

## Step 6 – Document Standards and Patterns

1. Write a concise Motion Guidelines document for the team:
   - When to animate
   - Allowed ranges for durations/scale/distance
   - Accessibility expectations
2. Provide code snippets using the shared `lib/animation` primitives.
3. Link to the implementation skill and micro-interactions blueprint.

---

## Step 7 – Establish Governance and Review Process

1. Define motion-related review checklist items:
   - Tokens used correctly
   - Reduced-motion supported
   - No layout thrash or janky transitions
2. Agree on ownership:
   - Motion "steward" or guild
3. Plan periodic review:
   - Audit every quarter or after major feature launches.

---
