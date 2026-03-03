# Design Pattern: [Pattern Name]

> One-line description of what this pattern solves

**Pattern ID:** pattern-[name]
**Category:** UI | Animation | State | Layout | Data | Accessibility
**Created:** YYYY-MM-DD
**Status:** Proposed | Approved | Deprecated

## Problem

Describe the recurring problem this pattern addresses.

### Symptoms
- When you see [symptom 1]
- When you need [symptom 2]
- When the codebase has [symptom 3]

## Solution

### Pattern Overview
High-level description of the pattern approach.

### Visual Example
```
[ASCII diagram or reference to screenshot]
```

## Implementation

### Core Code

```tsx
// Primary implementation example
```

### Variants

#### Variant A: [Name]
```tsx
// Variant implementation
```

#### Variant B: [Name]
```tsx
// Variant implementation
```

## Design System Integration

### Tokens Used
| Token | Value | Purpose |
|-------|-------|---------|
| `--token-name` | value | [Purpose] |

### Components Used
- `ComponentName` from `path/to/component`

## Accessibility

### Requirements
- [ ] Keyboard navigable
- [ ] Screen reader announced
- [ ] Focus visible
- [ ] Motion respects `prefers-reduced-motion`

### ARIA Attributes
```tsx
<element
  role="[role]"
  aria-label="[label]"
  aria-describedby="[id]"
/>
```

## Usage Guidelines

### When to Use
- [Scenario 1]
- [Scenario 2]

### When NOT to Use
- [Anti-scenario 1]
- [Anti-scenario 2]

### Do
- [Best practice 1]
- [Best practice 2]

### Don't
- [Anti-pattern 1]
- [Anti-pattern 2]

## Examples in Codebase

| Location | Usage |
|----------|-------|
| `path/to/file.tsx:42` | [Description] |
| `path/to/file.tsx:87` | [Description] |

## Related Patterns

- [Pattern A](./pattern-a.md) - [Relationship]
- [Pattern B](./pattern-b.md) - [Relationship]

## Migration Notes

If replacing an older pattern:
1. [Migration step 1]
2. [Migration step 2]

---

## Changelog

| Date | Change |
|------|--------|
| YYYY-MM-DD | Initial creation |
