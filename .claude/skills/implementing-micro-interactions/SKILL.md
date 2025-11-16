---
name: implementing-micro-interactions
description: Implements production-grade micro-interactions in React/Next.js apps using a standardized lib/animation system with Framer Motion, TailwindCSS, and motion tokens. Use when setting up animation infrastructure, adding/refactoring/reviewing animation code, or user mentions 'lib/animation', 'motion system', 'animation tokens', 'setup animations', 'centralized animations'.
---

# Implementing Micro-Interactions

This Skill implements micro-interactions and motion patterns in React/Next.js applications using a reusable `lib/animation` system aligned with the Micro-Interactions blueprint and Motion best practices.

The focus is on:
- Consistent animation tokens (durations, easing, distances)
- Shared variants and factories
- Accessible and performant Framer Motion usage
- Integration with TailwindCSS, Next.js App Router, and React Server/Client Components

Refer to `references/MICRO_INTERACTIONS_BLUEPRINT.md` for the full research and conceptual foundations.

---

> **💡 Related Skill:** Once you've set up `lib/animation/` using this skill, you can use the **`generating-micro-interactions`**
> skill to quickly generate individual animated components that leverage this systematic animation infrastructure.
> This skill (`implementing-micro-interactions`) handles strategic architecture setup, while `generating-micro-interactions`
> provides tactical component generation from natural language prompts. Use them together for maximum productivity.

---

## When to Use This Skill

Use this Skill when:
- Implementing or refactoring micro-interactions in a React/Next.js codebase
- Adding or updating Framer Motion animations (`motion`, `variants`, `layout`, `layoutId`)
- Introducing a shared `lib/animation` directory (tokens, variants, factories, config)
- Ensuring animations follow consistent durations, easings, and accessibility rules
- Auditing existing motion code for anti-patterns (layout thrash, mixed CSS/JS transitions)

---

## Core Principles

To implement micro-interactions:

1. Use micro-interactions to provide feedback, status, context, or guidance—not decoration.
2. Prefer durations between `0.12–0.30s` for micro-interactions and `<=0.40s` for page transitions.
3. Animate `transform` + `opacity` first (GPU-friendly), avoid layout-affecting properties when possible.
4. Use shared tokens and factories from `lib/animation` rather than hardcoded numbers.
5. Always provide a reduced-motion path using `prefers-reduced-motion` and `MotionConfigProvider`.
6. Keep global transitions in a small wrapper (like `PageTransitionProvider`), keep micro-interactions local to components.

These principles are derived from the Micro-Interactions research blueprint and Motion docs. Reference the blueprint for detailed rationale and examples.

---

## Quick Start

To use this Skill in a project:

1. Create or update the `lib/animation` directory using the templates in:
   - `.claude/skills/implementing-micro-interactions/assets/lib/animation/`

2. Copy the `lib/animation` folder into your project, typically as:
   - `src/lib/animation/` or `app/lib/animation/`

3. Wire up the motion config provider and page transition provider:
   - Wrap your root layout with `MotionConfigProvider` and `PageTransitionProvider`.

4. Replace ad-hoc motion usage with shared tokens and variants:
   - Use `motionDuration`, `motionEasing`, `motionDistance`.
   - Use factories like `makeFadeInUp` and variants like `buttonMicro`.

5. Run through the implementation workflow in `WORKFLOW.md` whenever adding or refactoring animations.

---

## Output Structure

When this Skill is used correctly, the project should have:

```text
src/
  lib/
    animation/
      tokens.ts        # Durations, easing, distances
      variants.ts      # Common Variants (buttons, lists, modals, toasts)
      factories.ts     # Parametric factories like makeFadeInUp, makeScaleIn
      config.ts        # MotionConfigProvider + useMotionConfig hook
      index.ts         # Re-exports for convenience
      components/
        AnimatedButton.tsx
        HoverCard.tsx
        FadeInSection.tsx
        PageTransitionProvider.tsx
```

Components in `app/` or `src/app/` should import from `lib/animation` instead of defining custom ad-hoc motion values.

---

## Implementation Rules

When implementing or modifying animations with this Skill:

1. **Always use tokens**
   Import durations, easing, and distances from `lib/animation/tokens.ts`.
   Do not hardcode random numbers like `duration: 0.37` or `y: 37`.

2. **Prefer factories and shared variants**
   Use `makeFadeInUp`, `makeScaleIn`, and variants like `buttonMicro`, `listStagger`, `listItem` for repeated patterns.

3. **Respect reduced motion**
   Use `useMotionConfig()` to read `reducedMotion`.
   In reduced-motion mode, fall back to instant or simple opacity transitions.

4. **Animate transform + opacity**
   Prefer `x`, `y`, `scale`, `rotate`, and `opacity`.
   Use `layout` and `layoutId` sparingly for layout transitions.

5. **Encapsulate micro-interactions**
   Keep button/card/accordion interactions inside dedicated components under `lib/animation/components`.

6. **Route transitions**
   Use `PageTransitionProvider` (from `lib/animation/components`) with `AnimatePresence` and `key={pathname}` for App Router transitions.

7. **Accessibility**
   Do not rely solely on motion to convey state; ensure ARIA and visual states are aligned with animations.

---

## Related Files

* `WORKFLOW.md` – Step-by-step implementation workflow for using this Skill.
* `EXAMPLES.md` – Input → output examples of typical usage.
* `TROUBLESHOOTING.md` – Common issues and how to fix them.
* `references/MICRO_INTERACTIONS_BLUEPRINT.md` – Full research blueprint for micro-interactions and motion system design.
* `assets/lib/animation/` – Production-ready code templates for the animation system.

---
