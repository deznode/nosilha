# Session Diary Template

---
session-id: YYYY-MM-DD-[sequence]
date: YYYY-MM-DD
duration: [approximate time]
focus: [main topic/feature]
spec-ref: [Link to feature spec, if applicable]
status: in-progress | completed | paused
---

## Session Goal

[What we set out to accomplish this session]

## Context

### Starting Point

[State of the feature/component at session start]

### Relevant Background

[Any context needed to understand this session's work]

## Work Completed

### [Task/Feature 1]

**What**: [Description of work done]

**Files Changed**:
- `apps/web/src/components/[path].tsx` — [What changed]
- `apps/web/src/app/[path]/page.tsx` — [What changed]

**Decisions Made**:
- [Decision]: [Rationale]

**Challenges**:
- [Challenge]: [How resolved]

### [Task/Feature 2]

[Same structure as above]

## Design Decisions

### Decision: [Title]

**Context**: [Why this decision was needed]

**Options Considered**:
1. [Option A]: [Pros/Cons]
2. [Option B]: [Pros/Cons]

**Chosen**: [Option X]

**Rationale**: [Why this option]

## Design Token Changes

| Token | Action | Value |
|-------|--------|-------|
| [Token name] | Added / Modified | [OKLCH value or semantic reference] |

Reference: `apps/web/src/app/globals.css`

## Discoveries

### Codebase Insights

- [Something learned about existing components or patterns]

### Technical Learnings

- [Something learned about Next.js, Tailwind, Catalyst UI, etc.]

### Pattern Observations

- [Patterns that emerged or should be documented in `design-intent/patterns/`]

## Issues Encountered

### Issue: [Title]

**Symptom**: [What was observed]
**Cause**: [Root cause if found]
**Resolution**: [How it was fixed]

## Visual Verification

### playwright-cli Screenshots

- [ ] [Page/state] — light mode, mobile (375px)
- [ ] [Page/state] — light mode, desktop (1280px)
- [ ] [Page/state] — dark mode

### Manual Testing

- [ ] [Scenario]: [Result]

## Incomplete Work

### Paused Items

- [ ] [Item]: [Why paused, what's needed to continue]

### Known Issues

- [ ] [Issue]: [Priority, next steps]

## Memory Updates

[Things worth saving to auto-memory (`/Users/jcosta/.claude/projects/` memory files) for future sessions:]

- [Pattern/convention discovered]
- [Gotcha to remember]

## Next Session

### Priorities

1. [Most important next task]
2. [Second priority]

### Questions to Resolve

- [Question]: [Who/what can answer]

## Handoff Notes

[Anything needed to continue effectively]

### Quick Start

```bash
cd apps/web && pnpm run dev    # Start dev server
# Visit http://localhost:3000/[route]
```

### Key Files to Review

- `apps/web/src/components/[path].tsx` — [Why important]

### Current State

[Brief description of where things stand]

---

## Session Metrics

- Components created/modified: [N]
- Design tokens added: [N]
- Playwright verifications: [N]
