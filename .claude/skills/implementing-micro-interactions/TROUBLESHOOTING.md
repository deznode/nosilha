# Implementing Micro-Interactions – Troubleshooting

This guide covers common issues when using the `implementing-micro-interactions` Skill.

---

## Issue 1 – Animations Feel Inconsistent Across the UI

**Symptoms:**
- Some buttons animate strongly, others very subtly.
- Different durations used for similar interactions.

**Likely Causes:**
- Hardcoded values instead of tokens.
- Multiple ad-hoc variants defined per component.

**Fix:**
1. Search for `duration:` and `whileHover` in the codebase.
2. Replace ad-hoc values with `motionDuration`, `motionEasing`, `motionDistance`.
3. Use shared variants (`buttonMicro`, `listStagger`, `listItem`) and factories (`makeFadeInUp`).

---

## Issue 2 – Motion Ignores Reduced-Motion Preference

**Symptoms:**
- Users with `prefers-reduced-motion` still see big transitions.
- Animations feel overwhelming for some users.

**Likely Causes:**
- MotionConfigProvider not wired.
- Components do not check `useMotionConfig`.

**Fix:**
1. Ensure `MotionConfigProvider` wraps the app body.
2. Use `useMotionConfig()` in animated components and:
   - Reduce motion to opacity-only or instant transitions.
   - Avoid large positional changes when `reducedMotion` is true.

---

## Issue 3 – Layout Jank or Jitter During Animations

**Symptoms:**
- Elements jump or jitter during layout transitions.
- Scroll performance feels choppy.

**Likely Causes:**
- Animating layout properties like `width`, `height`, `top`, `left` unnecessarily.
- Applying `layout` to too many nodes in large lists.

**Fix:**
1. Prefer transforming `x`, `y`, `scale`, `rotate`, `opacity` for micro-interactions.
2. Use `layout` only for elements that need layout animations.
3. Avoid adding `layout` to every child in large lists; keep it at the smallest meaningful scope.

---

## Issue 4 – Route Transitions Cause Double Content or Glitches

**Symptoms:**
- Old and new routes visible at the same time.
- Transition flickers when navigating.

**Likely Causes:**
- `AnimatePresence` misconfigured or missing `mode="wait"`.
- `key` not set to `pathname`.

**Fix:**
1. Ensure `PageTransitionProvider` uses `AnimatePresence` with `mode="wait"`.
2. Use `key={pathname}` on the motion wrapper.
3. Keep transitions short and focus on simple opacity + small y offset.

---

## Issue 5 – TypeScript Errors in `lib/animation` Files

**Symptoms:**
- TS errors around variant typing, tokens, or props.

**Likely Causes:**
- Incorrect import paths.
- Missing `as const` on token objects or variants.

**Fix:**
1. Confirm imports: `import { motionDuration } from "@/lib/animation";`
2. Mark token objects and variants with `as const` where appropriate.
3. Ensure `tsconfig.json` `baseUrl` or `paths` align with the `@/` alias.

---

## Issue 6 – Bundle Size Increase After Adding Framer Motion

**Symptoms:**
- Bundle reports show a noticeable increase.
- CLS/LCP impacted by heavy animation code.

**Likely Causes:**
- Framer Motion imported in many modules.
- Animation-heavy components included in initial route chunk.

**Fix:**
1. Use `next/dynamic` for animation-heavy components where possible.
2. Keep Motion imports in shared utilities (`lib/animation`) and avoid duplicating patterns.
3. Consider lazy-loading marketing-only animations for non-critical routes.

---

## Issue 7 – Hover Effects Feel Too Aggressive

**Symptoms:**
- Cards jump too far.
- Buttons feel bouncy or slow.

**Likely Causes:**
- Hover scale > 1.08.
- Durations too long (>0.3s) for small interactions.

**Fix:**
1. Set hover scale range to `1.02–1.05`.
2. Use `motionDuration.fast` or `motionDuration.micro` for hover transitions.
3. Review easing curves; prefer `motionEasing.out` for entrance and `motionEasing.in` for exit.

---
