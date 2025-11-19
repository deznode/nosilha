---
name: architecting-motion-systems
description: Designs, audits, and refactors motion systems in React/Next.js applications using Framer Motion and shared animation primitives. Use when evaluating animation architecture, planning lib/animation structure, enforcing motion standards, reviewing micro-interactions, or user mentions 'audit animations', 'motion architecture', 'animation strategy', 'migration plan', 'motion guidelines'.
---

# Motion System Architect

This Skill acts as a motion system architect for React/Next.js applications that use Framer Motion and TailwindCSS.

It focuses on:
- Evaluating the existing motion architecture
- Designing or refining `lib/animation` and related patterns
- Defining motion standards (tokens, variants, factories, components)
- Ensuring accessibility, performance, and consistency across the app
- Producing architecture documents, migration plans, and review checklists

The Skill complements `implementing-micro-interactions` by operating at a higher level: it decides *how* the motion system should be structured, then the implementation Skill handles detailed code changes.

---

## When to Use This Skill

Use this Skill when:
- Auditing a codebase's current motion usage and architecture
- Planning introduction of a unified `lib/animation` layer
- Designing standards for durations, easings, distances, and naming
- Creating migration plans from ad-hoc animations to a shared system
- Reviewing PRs that introduce or refactor motion infrastructure
- Preparing documentation or guidelines for a team about motion usage

---

## Responsibilities

When this Skill is active, it should:

1. Map the current state of motion usage:
   - Where Framer Motion is used
   - Which components are animated
   - What patterns and anti-patterns exist

2. Define or refine the target architecture:
   - `lib/animation` structure (tokens, variants, factories, config, components)
   - Rules for when to use local vs. shared animation primitives
   - Motion governance (naming, tokens, allowed ranges)

3. Produce clear artifacts:
   - Architecture diagrams or text-based diagrams
   - Migration plans and prioritized backlogs
   - Checklists and style guides for motion usage

4. Ensure alignment with:
   - Micro-Interactions research blueprint
   - Agent Skill best practices (progressive disclosure, concise SKILLs)

---

## Architectural Framework

When designing a motion system, follow this framework:

1. **Domain analysis** – Identify key interaction types:
   - Buttons, cards, lists, toasts, modals, nav, accordions, route transitions

2. **Tokenization** – Define shared tokens:
   - Durations, easing curves, distances, motion intensities

3. **Primitives** – Create shared primitives:
   - Variants and factories (fade, scale, slide, stagger)

4. **Components** – Build motion-enhanced components:
   - Buttons, cards, wrappers, page transition shells

5. **Policies** – Codify usage rules:
   - Where motion is allowed, discouraged, or prohibited
   - Accessibility and reduced-motion requirements

6. **Governance** – Define review and evolution process:
   - Code review checklists
   - Versioning of motion standards
   - Metrics and monitoring (performance, UX feedback)

---

## Project Documentation

* `docs/MICRO_INTERACTION.md` – Foundational research, theory, timing, and best practices
* `docs/ANIMATION_SYSTEM.md` – Implementation guide with code examples and API reference

## Related Files

- `WORKFLOW.md` – Step-by-step architecture and review workflow.
- `EXAMPLES.md` – Example scenarios (audits, proposals, migration plans).
- `TROUBLESHOOTING.md` – Common architectural issues and resolutions.
- `references/MOTION_SYSTEM_ARCHITECTURE_NOTES.md` – Optional notes and decisions log for a specific project.

## Modern Motion.dev Best Practices

Motion.dev (formerly Framer Motion) provides native reduced motion support:

```tsx
import { MotionConfig } from "framer-motion";

// In root layout - automatically handles reduced motion
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

Options:
- `"user"` - Respects OS setting automatically
- `"always"` - Force reduced motion
- `"never"` - Ignore OS setting

The native `useReducedMotion` hook from framer-motion is also available for component-level checks.

---
