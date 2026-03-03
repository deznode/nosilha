# Design Pattern Template

---
pattern-id: [unique-identifier]
title: [Pattern Name]
category: component | layout | interaction | data | styling | animation
status: draft | active | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Intent

[One sentence describing what this pattern solves]

## Problem

[Describe the recurring problem this pattern addresses]

## Solution

[High-level description of the pattern approach]

## When to Use

- [Scenario 1]
- [Scenario 2]

## When NOT to Use

- [Anti-scenario 1]
- [Anti-scenario 2]

## Structure

### Components

```
[Component tree or file structure]
```

### Relationships

[How components interact — props, context, events]

## Implementation

### Basic Example

```tsx
import { clsx } from "clsx";

interface ExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "accent";
}

export function Example({ variant = "default", className, children, ...props }: ExampleProps) {
  return (
    <div
      className={clsx(
        "bg-surface border-hairline rounded-card border",
        variant === "accent" && "border-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### With forwardRef

```tsx
import * as React from "react";
import { clsx } from "clsx";

interface ExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  // props
}

export const Example = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx("bg-surface", className)} {...props}>
      {children}
    </div>
  )
);
Example.displayName = "Example";
```

### With Animation (Framer Motion)

```tsx
"use client";

import { motion } from "framer-motion";

export function AnimatedExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-surface rounded-card"
    >
      {/* content */}
    </motion.div>
  );
}
```

## Design Tokens

| Token | Purpose in Pattern |
|-------|--------------------|
| `bg-surface` | [Usage] |
| `text-body` | [Usage] |
| `border-hairline` | [Usage] |
| `shadow-subtle` / `shadow-lift` | [Usage] |
| `rounded-card` / `rounded-button` | [Usage] |
| `ease-calm` | [Transition timing] |

Reference: `apps/web/src/app/globals.css`

## Variants

### Variant A: [Name]

[When to use this variant]

```tsx
// Variant implementation
```

### Variant B: [Name]

[When to use this variant]

```tsx
// Variant implementation
```

## Accessibility

- [ARIA roles and labels]
- [Keyboard navigation (Tab, Enter, Escape)]
- [Screen reader announcements]
- [Color contrast — OKLCH tokens maintain AA compliance]
- [Focus indicators]

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (< 640px) | [Description] |
| Tablet (640–1024px) | [Description] |
| Desktop (> 1024px) | [Description] |

## Dark Mode

[Describe any dark mode specific adjustments — semantic tokens handle most cases automatically]

## Testing

### playwright-cli Verification

```
1. Navigate to page containing pattern
2. Screenshot at 375px, 768px, 1280px
3. Toggle dark mode, screenshot
4. Test keyboard navigation
```

## Known Issues

- [Issue]: [Workaround]

## Related Patterns

- [Pattern A]: [Relationship]
- [Catalyst UI Component]: [How this pattern extends/complements it]

## Examples in Codebase

- `apps/web/src/components/[path].tsx` — [Context]

## References

- [External resource]

## Changelog

| Date | Change |
|------|--------|
| YYYY-MM-DD | Initial pattern documented |
