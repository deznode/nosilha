---
paths: frontend/content/**
---

# MDX Content Platform (Feature 007)

## Content Processing

Velite processes MDX files at build time with type-safe schemas.

## Multilingual Support

Co-located translations (EN/PT/KEA/FR) with fallback chains and translation status tracking.

## Content Structure

All content lives in `frontend/content/pages/`:

- **Top-level pages**: `content/pages/[category]/en.mdx` → URL `/[category]` (e.g., `/history`, `/music`)
- **Sub-pages**: `content/pages/[category]/[slug]/en.mdx` → URL `/[category]/[slug]` (e.g., `/music/morna-origins`)
- **Categories**: `history`, `music`, `people`, `traditions`, `places`

## Commands

```bash
pnpm run scaffold:article           # Create new article from template
pnpm run validate:content           # Validate MDX content (frontmatter, links, refs)
pnpm run check:translations         # Generate translation status report
```

## Data-Driven Components

Reusable components for cultural heritage pages:

- `HistoricalTimeline` - Timeline events with dates, titles, descriptions
- `HistoricalFigures` - Historical figures with roles, years, descriptions
- `ThematicSections` - Thematic content sections with alternating image layouts

All components support structured data in YAML frontmatter.

## Pattern for Complex Pages

Cultural heritage pages (like `/history`) use data-driven MDX:

1. Define structured data in YAML frontmatter (sections, figures, timeline, citations)
2. Extend Page schema in `velite.config.ts` with optional structured fields
3. Create client component to render MDX with structured data as props
4. Components access data from props, not hardcoded in JSX

## Additional Features

- **Search**: Pagefind for static, client-side search with language-specific indexes and faceted filtering
- **Validation**: Pre-commit hooks validate frontmatter schemas, internal links, and cross-references
- **Scaffolding**: CLI tools for creating new articles from templates
- **Translation Management**: Admin dashboard at `/admin/translations` shows translation status and outdated content

## Key Files

| File | Purpose |
|------|---------|
| `frontend/velite.config.ts` | Velite configuration with Page collection |
| `frontend/src/lib/content/schemas.ts` | Zod schemas for content validation |
| `frontend/src/lib/content/translations.ts` | Translation utilities and fallback logic |
| `frontend/src/lib/content/mdx-components.tsx` | MDX component registry (includes data-driven components) |
| `frontend/src/components/content/` | Data-driven content components |
| `frontend/scripts/validate-content.ts` | Content validation script |
| `frontend/scripts/scaffold-article.ts` | Article scaffolding CLI |
| `frontend/scripts/check-translations.ts` | Translation status reporting |

## Reference

- See `plan/specs/007-mdx-content-platform/` for complete specification
- Pattern Reference: See `/history` page implementation for data-driven MDX with structured frontmatter
