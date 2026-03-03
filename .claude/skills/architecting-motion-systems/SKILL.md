---
name: architecting-motion-systems
description: Designs, audits, and refactors motion systems in React/Next.js applications using Framer Motion and shared animation primitives. Use when evaluating animation architecture, planning lib/animation structure, enforcing motion standards, reviewing micro-interactions, or user mentions 'audit animations', 'motion architecture', 'animation strategy', 'migration plan', 'motion guidelines'.
---

# Motion System Architect

Operates at architectural level to design motion systems, complementing `implementing-micro-interactions` which handles detailed code changes.

## When to Use

- Auditing codebase motion usage and architecture
- Planning introduction of unified `lib/animation` layer
- Designing standards for durations, easings, distances, naming
- Creating migration plans from ad-hoc to shared animations
- Preparing team documentation or guidelines for motion usage

## Architectural Framework

1. **Domain Analysis**: Identify key interaction types (buttons, cards, lists, modals, nav, route transitions)
2. **Tokenization**: Define shared tokens (durations, easing curves, distances, motion intensities)
3. **Primitives**: Create shared variants and factories (fade, scale, slide, stagger)
4. **Components**: Build motion-enhanced components (buttons, cards, wrappers, page transition shells)
5. **Policies**: Codify usage rules (where motion is allowed/discouraged, accessibility requirements)
6. **Governance**: Define review and evolution process (code review checklists, versioning, metrics)

See [WORKFLOW.md](WORKFLOW.md) for detailed step-by-step architecture workflow.

## Output Artifacts

| Artifact | Purpose |
|----------|---------|
| Architecture diagrams | Visual system structure |
| Migration plans | Prioritized refactoring backlog |
| Motion standards | Tokens, naming conventions, allowed ranges |
| Review checklists | PR review criteria for motion code |
| Style guides | Team documentation for motion usage |

## Documentation References

**Skill docs**:

| File | Purpose |
|------|---------|
| [WORKFLOW.md](WORKFLOW.md) | Step-by-step architecture and review workflow |
| [EXAMPLES.md](EXAMPLES.md) | Example scenarios (audits, proposals, migration plans) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common architectural issues and resolutions |
| [references/MOTION_SYSTEM_ARCHITECTURE_NOTES.md](references/MOTION_SYSTEM_ARCHITECTURE_NOTES.md) | Project-specific decisions log |
| [references/motion-best-practices.md](references/motion-best-practices.md) | Motion.dev patterns and accessibility |

**Project docs**:
- `docs/MICRO_INTERACTION.md` - Foundational research, theory, timing
- `docs/ANIMATION_SYSTEM.md` - Implementation guide with code examples

## Best Practices

1. Map current motion state before proposing changes
2. Define clear boundaries between local and shared animation primitives
3. Tokenize all durations, easings, and distances
4. Require reduced-motion paths for all animations
5. Align with micro-interactions research blueprint
6. Version motion standards and track evolution
7. Include performance metrics in governance
