---
name: implementing-micro-interactions
description: Implements production-grade micro-interactions in React/Next.js apps using a standardized lib/animation system with Framer Motion, TailwindCSS, and motion tokens. Use when setting up animation infrastructure, adding/refactoring/reviewing animation code, or user mentions 'lib/animation', 'motion system', 'animation tokens', 'setup animations', 'centralized animations'.
---

# Implementing Micro-Interactions

Implements micro-interactions and motion patterns in React/Next.js using a reusable `lib/animation` system.

> **Related Skill**: Use `generating-micro-interactions` to quickly generate animated components that leverage this systematic infrastructure.

## When to Use

- Implementing or refactoring micro-interactions in React/Next.js
- Adding Framer Motion animations (motion, variants, layout, layoutId)
- Introducing shared `lib/animation` directory (tokens, variants, factories)
- Ensuring consistent durations, easings, and accessibility
- Auditing motion code for anti-patterns

## Core Principles

1. Use micro-interactions for feedback, status, context—not decoration
2. Prefer durations 0.12–0.30s for micro, ≤0.40s for page transitions
3. Animate `transform` + `opacity` first (GPU-friendly)
4. Use shared tokens from `lib/animation`, never hardcode values
5. Provide reduced-motion path via `prefers-reduced-motion`
6. Keep global transitions in wrapper, micro-interactions local

## Quick Start

1. Copy `assets/lib/animation/` to `src/lib/animation/`
2. Wrap root layout with `MotionConfigProvider` and `PageTransitionProvider`
3. Replace ad-hoc motion with shared tokens and variants
4. Use `motionDuration`, `motionEasing`, `motionDistance` from tokens
5. Run through [WORKFLOW.md](WORKFLOW.md) for each refactor

## Output Structure

```text
src/
  lib/
    animation/
      tokens.ts        # Durations, easing, distances
      variants.ts      # Common variants (buttons, lists, modals)
      factories.ts     # Parametric factories (makeFadeInUp, makeScaleIn)
      config.tsx       # MotionConfigProvider + useMotionConfig hook
      index.ts         # Re-exports
```

Animated components (`AnimatedButton`, `HoverCard`) live in `src/components/ui/` and import from `lib/animation`.

## Documentation References

**Skill docs**:
- [WORKFLOW.md](WORKFLOW.md) - Step-by-step implementation workflow
- [EXAMPLES.md](EXAMPLES.md) - Input/output usage examples
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and fixes
- [references/MICRO_INTERACTIONS_BLUEPRINT.md](references/MICRO_INTERACTIONS_BLUEPRINT.md) - Research blueprint
- [references/MOTION_DEV_API.md](references/MOTION_DEV_API.md) - Motion.dev best practices

**Project docs**:
- `docs/MICRO_INTERACTION.md` - Foundational research and theory
- `docs/ANIMATION_SYSTEM.md` - Implementation guide with API reference

## Best Practices

1. Always use tokens: Import from `lib/animation/tokens.ts`
2. Prefer factories: Use `makeFadeInUp`, `buttonMicro`, `listStagger`
3. Respect reduced motion: Use `useMotionConfig()` for accessibility
4. Encapsulate interactions: Dedicated components in `lib/animation/components`
5. Route transitions: `PageTransitionProvider` with `AnimatePresence`
6. Accessibility: Align ARIA states with animations
