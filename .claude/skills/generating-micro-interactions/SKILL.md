---
name: generating-micro-interactions
description: Generates production-ready React components with micro-interactions using Framer Motion, Radix UI, and Tailwind CSS. Use when creating/adding/building animated components, converting static to animated UI, or user mentions 'animate this', 'add hover effect', 'create button with animation', 'micro-interaction', 'Framer Motion component'.
---

# Micro-Interaction Component Generator

Generates React components with micro-interactions using Next.js 16, React 19.2, TailwindCSS, Framer Motion, and Radix UI.

**Related Skills**:
- `implementing-micro-interactions` - Setup centralized animation system (`lib/animation/`)
- `architecting-motion-systems` - Architecture planning and audits

## When to Use

- Create animated button, card, modal, menu components
- Add hover, tap, entrance animations
- Convert static components to animated
- Build staggered list animations
- Implement Radix UI + Framer Motion patterns

## Example Prompts

- "Create a micro-interaction for a primary button with hover and tap animations"
- "Give me an animated dropdown menu using Radix UI + Framer Motion"
- "Animate a card list with staggered entrance transitions"
- "Add a subtle hover lift effect to this component"
- "Build an animated accordion respecting Radix's data-state"

## Implementation Rules

### Motion Tokens (required)
All animations must use tokens:
- Duration: `motionDuration.fast`, `.normal`, `.slow`
- Easing: `motionEasing.out`, `.inOut`, `.in`
- Distance: `motionDistance.xSmall`, `.small`, `.medium`

### Canonical Values
- Duration: 120-240ms
- Hover scale: 1.02-1.05
- Tap scale: 0.95-0.98
- Motion distance: 4-16px
- Properties: transform + opacity only

### Variant Usage
Use factories: `makeFadeInUp()`, `makeScaleIn()`, `makeSlideInFrom()`
Use variants: `buttonMicro`, `listStagger`, `listItem`, `fadeInUp`

### Accessibility (required)
- Respect `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">`
- Provide fade-only fallback for reduced motion
- Maintain Radix UI ARIA and `data-state` semantics
- Never hide information exclusively in animations

### Performance (required)
- Keep variants outside components
- Use `AnimatePresence` for mount/unmount
- Avoid animating width, height, top, left
- No CSS transitions on Motion-animated properties

### Next.js Integration
- Use `"use client"` when Motion is used
- Don't break streaming or suspense boundaries

## Output Format

Generated components include:
1. Complete TypeScript component
2. Imported motion tokens and variants
3. `"use client"` directive
4. Inline comments for clarity (when helpful)

## Out of Scope

This skill does NOT generate:
- Entire animation systems (use `implementing-micro-interactions`)
- Variant libraries or page transitions
- Motion Config Providers (use `implementing-micro-interactions`)
- Architecture planning (use `architecting-motion-systems`)

## Documentation References

- `docs/MICRO_INTERACTION.md` - Timing, patterns, tokens, rules
- `docs/ANIMATION_SYSTEM.md` - Implementation guide, API reference
