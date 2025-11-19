---
name: generating-micro-interactions
version: 1.0.0
description: Generates production-ready React components with micro-interactions using Framer Motion, Radix UI, and Tailwind CSS. Use when creating/adding/building animated components, converting static to animated UI, or user mentions 'animate this', 'add hover effect', 'create button with animation', 'micro-interaction', 'Framer Motion component'.

capabilities:
  - code_generation
  - component_creation
  - animation_architecture
  - accessibility_compliance
  - performance_optimization
  - refactoring

entrypoint: skill:generate
---

# Micro-Interaction Component Skill

## 🧠 Purpose & Scope
This skill generates **React components that include micro-interactions** using:

- **Next.js 16 App Router**
- **React 19.2**
- **TailwindCSS**
- **Framer Motion (Motion)**
- **Radix UI primitives**
- **Accessibility, reduced-motion support, and design consistency**

The skill **does not** generate entire animation systems or variant libraries (Option A).
It only generates **components** that follow the global Motion System defined in:

📄 **MICRO_INTERACTION.md**

All outputs MUST follow the timing, easing, motion grammar, accessibility, performance,
and architectural rules defined in that research file.

---

> **💡 Related Skill:** For setting up a centralized animation system (`lib/animation/` with tokens, variants,
> factories, and components), use the **`implementing-micro-interactions`** skill first. This skill
> (`generating-micro-interactions`) is best for quickly generating individual components that leverage that systematic
> animation infrastructure. Together, they provide strategic infrastructure setup + tactical component generation.

---

# 📐 How This Skill Behaves

When invoked, the skill:

1. Reads the user request
2. Determines the UI component being asked (button, card, modal, menu, etc.)
3. Applies the **canonical micro-interaction rules**:
   - 120–240ms durations
   - scale hover 1.02–1.05
   - tap scale 0.95–0.98
   - 4–16px motion distances
   - transform+opacity only
   - no animating layout properties unless required
4. Uses your established:
   - animation tokens
   - variant factories
   - reusable variants (buttonMicro, listStagger, fadeInUp, etc.)
5. Respects accessibility:
   - `prefers-reduced-motion`
   - Radix `data-state` semantics
   - aria-expanded, aria-disabled, etc.
6. Outputs:
   - A complete React 19 component
   - TypeScript
   - Tailwind styling
   - `"use client"` where required
   - Organized imports
   - External variant imports when appropriate
   - Inline comments explaining behavior

---

# 🧩 Example Inputs this Skill Handles

Examples from the best-practice file and expanded:

```
"Create a micro-interaction for a primary button with hover and tap animations."
```

```
"Give me an animated dropdown menu using Radix UI + Framer Motion."
```

```
"Animate a card list with staggered entrance transitions."
```

```
"Add a subtle hover lift effect to this component."
```

```
"Create a toast component with enter + exit Motion animation."
```

```
"Build an animated accordion item respecting Radix's data-state."
```

```
"Convert this static component into an animated one using the micro-interaction blueprint."
```

---

# ⚙️ Implementation Rules

## 1. Motion Token Usage
All animations MUST use tokens defined in your research:

- `motionDuration.fast`, `.normal`, `.slow`
- `motionEasing.out`, `.inOut`, `.in`
- `motionDistance.xSmall`, `.small`, `.medium`

Never hardcode durations or random easing curves unless the research explicitly allows.

## 2. Variant Factory Usage
Use factories like:

- `makeFadeInUp()`
- `makeScaleIn()`
- `makeSlideInFrom()`

or shared variants like:

- `buttonMicro`
- `listStagger`
- `listItem`

## 3. Accessibility Compliance
Every component must:

- Respect `prefers-reduced-motion`
- Provide instant or fade-only fallback
- Maintain Radix UI ARIA and `data-state` rules
- Never hide essential information exclusively inside animations

## 4. Performance Requirements
Must follow these rules from MICRO_INTERACTION.md:

- Use transforms (scale/x/y) + opacity whenever possible
- Keep variants **outside** components
- Avoid CSS transitions on animated Motion properties
- Avoid animating width, height, top, left unless layout animations require it
- Use `AnimatePresence` for mounting/unmounting

## 5. Next.js App Router Integration
Components must:

- Be `"use client"` when Motion is used
- Not break streaming or suspense boundaries
- Work with route-level transitions (but not create them; that's Option B)

---

# 🚀 skill:generate (Entrypoint)

```python
def generate(prompt: str) -> str:
    """
    Generate a production-ready UI component that includes micro-interactions.
    Applies the rules, patterns, architecture, accessibility standards,
    and motion grammar defined in MICRO_INTERACTION.md.
    """
```

## Behavior:

When invoked with a prompt, the skill will:

1. Interpret the desired component
2. Select the correct micro-interaction pattern
3. Generate TypeScript code following:

   * React 19 conventions
   * Next.js 16 Client Component rules
   * TailwindCSS best practices
   * Framer Motion best practices
   * Accessibility & reduced-motion compliance
4. Provide inline comments ONLY when helpful for clarity
5. Never use inconsistent timings, easings, or motion patterns

---

# ✨ Response Format

The skill ALWAYS responds with:

### 1. **A complete component**

TypeScript, ready to paste into a Next.js App Router project.

### 2. **Imported motion tokens & variants**

No ad-hoc numbers.

### 3. **Short explanation**

Only when needed.

### 4. **Optional multi-file output**

If the component requires variants or helper files, the skill will generate multiple files following your library layout.

---

# 🔒 Out-of-Scope

This skill *must not* generate:

* Entire animation systems
* Variant libraries
* Page transition architecture
* File trees unrelated to component output
* Motion Config Providers or global state managers

These belong to the **`implementing-micro-interactions`** skill (for infrastructure setup) or **`architecting-motion-systems`** skill (for architecture planning).

---

## Project Documentation

* `docs/MICRO_INTERACTION.md` – Foundational research, theory, timing, and best practices
* `docs/ANIMATION_SYSTEM.md` – Implementation guide with code examples and API reference

## Modern Motion.dev Best Practices

Motion.dev (formerly Framer Motion) provides native reduced motion support:

```tsx
import { MotionConfig } from "framer-motion";

// In root layout - automatically handles reduced motion
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

The native `useReducedMotion` hook from framer-motion is also available for component-level checks.

---

# 📎 References

This skill is strictly based on:

* **MICRO_INTERACTION.md** (timings, patterns, tokens, factories, rules)
* **ANIMATION_SYSTEM.md** (implementation guide, API reference, usage patterns)
* **Skill Development Best Practices** (scope definition, invocation triggers, skill boundaries)
* **SKILLS.md** (canonical structure, layout, metadata, do/don't guidance)
