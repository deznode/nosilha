# Motion System Architect – Troubleshooting

---

## Issue 1 – Architecture Is Over-Engineered

**Symptoms:**
- Too many tokens or variants.
- Hard to explain the system to new engineers.

**Fix:**
- Simplify to a minimal set of tokens and primitives.
- Remove rarely used or redundant variants.
- Document only the patterns that matter in practice.

---

## Issue 2 – Team Ignores Motion Standards

**Symptoms:**
- New components don't use `lib/animation`.
- Ad-hoc animations reappear.

**Fix:**
- Add motion checks to code review templates.
- Create lint rules or simple heuristics to detect ad-hoc motion values.
- Provide easy-to-copy snippets and components.

---

## Issue 3 – Reduced-Motion Not Systematically Enforced

**Symptoms:**
- Some components support reduced motion, others do not.

**Fix:**
- Require that all new motion components use `useMotionConfig`.
- Update the architecture guidelines to include reduced-motion as a non-negotiable requirement.
- Gradually refactor older components as part of migration phases.

---

## Issue 4 – Conflicting Motion Systems

**Symptoms:**
- Multiple motion layers or different approaches across teams.

**Fix:**
- Choose one canonical `lib/animation` implementation.
- Deprecate alternative patterns with clear migration instructions.
- Maintain a single source of truth for motion tokens and variants.

---
