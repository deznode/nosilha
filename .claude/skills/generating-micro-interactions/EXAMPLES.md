# EXAMPLES.md — Microinteraction Skill Examples

This file contains 15 real-world Skill invocation examples and the type of output the
`microinteraction` skill should produce.

These examples serve as reference for model behavior, QA testing, and consistent
component generation across your UI codebase.

---

## 1) Animated Primary Button (hover + tap micro-interactions)

**Input**
```
Create an animated primary button with hover lift and tap compression using our micro-interaction system.
```

**Output Highlights**
- Uses `buttonMicro` variant
- tokens: `motionDuration.fast`, `motionEasing.out`
- scale on hover 1.03
- tap 0.97
- React 19 + Tailwind + Motion

---

## 2) Animated Icon Button (Radix UI)

**Input**
```
Generate an icon button using Radix UI Button + Motion with subtle hover effects.
```

**Output Highlights**
- Radix `Button` wrapper
- `whileHover={{ scale: 1.05 }}` using tokens
- ARIA attributes preserved

---

## 3) Staggered Card Grid

**Input**
```
Create a card grid with staggered fade-in-up animations when it enters the viewport.
```

**Output Highlights**
- Uses `listStagger` + `listItem`
- uses `makeFadeInUp`
- `whileInView="visible"` + `viewport={{ once: true, amount: 0.3 }}`

---

## 4) Animated Accordion (Radix Accordion + Motion)

**Input**
```
Animate a Radix AccordionItem with expand/collapse transition, respecting data-state.
```

**Output Highlights**
- Height animation via `AnimatePresence`
- reduced-motion fallback
- Radix's `data-state="open"` → "closed" mapped to Motion variants

---

## 5) Tooltip with Animated Entrances

**Input**
```
Give me a tooltip that scales in at 0.96 -> 1 using makeScaleIn().
```

**Output Highlights**
- Motion wrapped around tooltip content
- Scale entrance variant

---

## 6) Modal with Backdrop

**Input**
```
Create a modal with fade + scale entrance and a fading backdrop.
```

**Output Highlights**
- Backdrop opacity animation
- Modal scale-in animation
- Uses `AnimatePresence`

---

## 7) Sliding Drawer

**Input**
```
Create a sliding right-side drawer with motion tokens and accessibility built-in.
```

**Output Highlights**
- Uses `makeSlideInFrom("right")`
- Radix dialog pattern supported

---

## 8) Animated List Item Hover Effect

**Input**
```
Add a subtle hover lift and shadow intensification on list items.
```

**Output Highlights**
- `whileHover={{ y: -2 }}`
- shadow deepening
- tokens only

---

## 9) Animated Navigation Link

**Input**
```
Create a nav link with an animated underline that slides in/out based on active state.
```

**Output Highlights**
- Motion `layoutId="nav-underline"`
- shared element animation

---

## 10) Toast Notification

**Input**
```
Create an animated toast that enters with fade+translate and exits upward.
```

**Output Highlights**
- Uses `AnimatePresence`
- fade-up on enter
- fade-up+opacity on exit

---

## 11) Animated Badge/Pill

**Input**
```
Create a small animated badge that pulses subtly on hover using our tokens.
```

**Output Highlights**
- subtle `scale: [1, 1.05, 1]`
- uses `motionDuration.micro`

---

## 12) Stepper / Multi-step Indicator

**Input**
```
Animate a step indicator where the active step grows slightly on selection.
```

**Output Highlights**
- scale variant based on active state
- reduced-motion safe

---

## 13) Suspense-Loaded Component Fade-In

**Input**
```
Wrap my component so it fades in after suspense resolves.
```

**Output Highlights**
- subtle opacity motion
- no layout shift
- minimal movement

---

## 14) Animated Empty State

**Input**
```
Create an empty state illustration container with fade-in-and-up on mount.
```

**Output Highlights**
- uses `makeFadeInUp(motionDistance.medium)`

---

## 15) Animated Select / Dropdown Menu

**Input**
```
Give me an animated dropdown menu using Radix Select + Motion that fades and scales.
```

**Output Highlights**
- Radix SelectContent wrapped with Motion
- scale 0.96 → 1 via `makeScaleIn()`
- fade-only fallback on reduced motion
