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
| [ai-image-analysis-apis-2025](./ai-image-analysis-apis-2025.md) | AI Image Analysis APIs for Heritage Projects - Free/Low-Cost Options (2025) | 2026-02-06 | ai-vision, image-analysis, spring-boot, cultural-heritage |

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
