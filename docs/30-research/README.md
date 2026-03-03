# Research Documentation

This directory contains promoted research that has been verified and deemed valuable for the project. Research is initially cached in `~/.claude/plugins/research/` and promoted here when it becomes a team resource.

## Structure

Each research document has two sections:
- **TEAM-NOTES**: Project-specific decisions, context, and notes (preserved on refresh)
- **AUTO-GENERATED**: Research content that can be refreshed with `/research refresh <slug>`

## Promoted Research

| Slug | Title | Promoted | Tags |
|------|-------|----------|------|
| [tailwindcss-v4-color-tokens](./tailwindcss-v4-color-tokens.md) | Tailwind CSS v4 Color Token Systems and Design Patterns | 2026-01-23 | tailwindcss, design-tokens, dark-mode, oklch |
| [spring-modulith-event-testing](./spring-modulith-event-testing.md) | Spring Modulith Event Testing Patterns | 2026-02-07 | spring-modulith, testing, events |
| [mobile-first-performance-nextjs16](./mobile-first-performance-nextjs16.md) | Mobile-First Frontend Performance with Next.js 16 | 2026-02-26 | nextjs, performance, mobile, ppr, mapbox |

## Commands

```bash
# Research a new topic (cached)
/research <topic>

# Promote research to project docs
/research promote <slug>

# Refresh promoted research (updates AUTO-GENERATED section only)
/research refresh <slug>

# List all research (cached + promoted)
/research list
```

## Usage Guidelines

1. **Add team notes** to promoted research to capture project-specific decisions
2. **Refresh periodically** to get updated information while preserving team notes
3. **Reference in code** via relative links: `See [Tailwind v4 Colors](../30-research/tailwindcss-v4-color-tokens.md)`
