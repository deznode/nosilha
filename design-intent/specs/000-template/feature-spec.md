# Feature Specification Template

---
spec-id: XXX
title: [Feature Title]
status: draft | review | approved | implemented
author: Joaquim Costa
created: YYYY-MM-DD
updated: YYYY-MM-DD
scope: component | page | layout | interaction
---

## Overview

[2-3 sentence summary of what this feature does and why it matters]

## Problem Statement

### Current State

[Describe the current situation or pain point]

### Desired State

[Describe what success looks like]

### User Impact

[Who benefits and how — diaspora, residents, visitors, researchers]

## Requirements

### Functional Requirements

1. **[Requirement ID]**: [Description]
   - Acceptance criteria: [Testable condition]

2. **[Requirement ID]**: [Description]
   - Acceptance criteria: [Testable condition]

### Non-Functional Requirements

- **Performance**: LCP < 2.5s, CLS < 0.1
- **Accessibility**: WCAG 2.1 AA — keyboard navigation, screen reader, color contrast
- **Responsiveness**: Mobile-first, tested at 375px / 768px / 1280px
- **Dark Mode**: Verified in both light and dark themes

## User Stories

### Primary Flow

```
As a [diaspora member / resident / visitor / researcher]
I want to [action]
So that [benefit]
```

**Acceptance Criteria:**
- [ ] [Criteria 1]
- [ ] [Criteria 2]

### Alternative Flows

[Edge cases and alternative paths]

## Design

### Visual Reference

[Link to Figma, Google Stitch wireframes (`design-intent/google-stitch/`), or screenshots]

### Component Breakdown

| Component | Purpose | Source |
|-----------|---------|--------|
| [Name] | [Role] | Catalyst UI / Custom UI / New |

### Design Tokens

| Token | Usage |
|-------|-------|
| `bg-surface` | [Where used] |
| `text-body` | [Where used] |
| [Custom token] | [Where used] |

Reference: `apps/web/src/app/globals.css` for OKLCH token definitions.

### Interaction Patterns

[Animations, transitions, hover states — use Framer Motion for complex animations, Tailwind transitions for simple ones]

## Technical Approach

### Proposed Solution

[High-level approach — Server Component vs Client Component, ISR strategy, state management]

### Component Architecture

```
[Component tree / file structure]
```

### Dependencies

- [Dependency]: [Why needed]

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | High/Med/Low | [Strategy] |

## Cultural Heritage Considerations

- **Multilingual**: [Portuguese/Kriolu/English/French support needed?]
- **Imagery**: [Historical photos? Attribution needed? Respectful handling?]
- **Content Authenticity**: [Verification required? Community review?]
- **Accessibility**: [Diacritics support, RTL considerations]

## Out of Scope

[Explicitly list what this feature does NOT include]

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]

## Success Metrics

- [Metric 1]: [Target]
- [Metric 2]: [Target]

## References

- [Design files or wireframes]
- [Related feature specs]
- [External inspiration]

---

## Sign-off

- [ ] Reviewed and approved — [Date]
