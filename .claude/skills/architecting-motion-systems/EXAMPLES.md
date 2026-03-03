# Motion System Architect – Usage Examples

---

## Example 1 – New Project Motion Architecture

**Input:**
"Design the motion system architecture for a new Next.js 16 app using Framer Motion and Tailwind."

**Expected behavior:**
- Propose a `lib/animation` structure with tokens, variants, factories, config, components.
- Describe how Server/Client Components interact with motion.
- Specify rules for route transitions and micro-interactions.

---

## Example 2 – Audit Existing Motion Usage

**Input:**
"We already use Framer Motion in several components. Audit our motion usage and propose improvements."

**Expected behavior:**
- Ask the user to share representative components or run `grep`/`Read` on relevant files.
- Identify anti-patterns (hardcoded durations, mixed CSS/Motion, missing reduced-motion).
- Produce a list of issues and a prioritized refactor plan.

---

## Example 3 – Introduce Tokens and Variants

**Input:**
"We have inconsistent durations everywhere. Define motion tokens and a shared variants file."

**Expected behavior:**
- Propose `motionDuration`, `motionEasing`, `motionDistance`.
- Create `variants.ts` with button, list, fade, scale variants.
- Explain how to migrate existing components to use these tokens.

---

## Example 4 – Plan Route Transition Strategy

**Input:**
"How should we handle route transitions in our App Router setup?"

**Expected behavior:**
- Recommend a `PageTransitionProvider` with `AnimatePresence` and `key={pathname}`.
- Propose subtle transitions (opacity + small y shift).
- Address streaming, Suspense, and reduced-motion concerns.

---

## Example 5 – Motion Guidelines for the Team

**Input:**
"Write a one-page motion guidelines doc for our team."

**Expected behavior:**
- Summarize when to animate, recommended durations, properties to animate.
- Reference `lib/animation` and shared primitives.
- Include accessibility and reduced-motion expectations.

---

## Example 6 – Migration Plan from Ad-Hoc to System

**Input:**
"We have a lot of legacy animations. Create a step-by-step migration plan."

**Expected behavior:**
- Analyze legacy patterns.
- Group migration tasks by component type and route.
- Provide phases (baseline, token adoption, component refactors, route transitions).

---

## Example 7 – Performance-Focused Review

**Input:**
"We suspect animations are hurting performance on mobile. Review our motion architecture."

**Expected behavior:**
- Check for layout thrash and heavy layout animations.
- Suggest using transform + opacity only for most interactions.
- Recommend lazy-loading animation-heavy code and using viewport triggers.

---
