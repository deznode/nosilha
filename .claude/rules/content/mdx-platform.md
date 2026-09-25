---
paths: apps/web/content/**
---

# MDX Content Platform (Feature 007)

## Content Processing

Velite processes MDX files at build time with type-safe schemas.

## Multilingual Support

Co-located translations (EN/PT/KEA/FR) are supported, with fallback chains and translation status tracking. Only English (`en.mdx`) files exist today.

## Content Structure

All content lives in `apps/web/content/pages/`:

- **Sub-pages**: `content/pages/[category]/[slug]/en.mdx`
- **Categories**: `history`, `music`, `people`, `traditions` (`history/` holds only `_meta.yaml`)
- **Routes**: only `(main)/history/[slug]` and `(main)/people/[slug]` render MDX pages. `music/` and `traditions/` content has no route yet.
- **`/history` itself** is not MDX: it loads typed data from `src/lib/content/history/`.

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

MDX pages can use data-driven components through structured frontmatter (the Page schema in `velite.config.ts` has optional timeline, figures, sections and citations fields):

1. Define structured data in YAML frontmatter (sections, figures, timeline, citations)
2. Extend Page schema in `velite.config.ts` with optional structured fields
3. Create client component to render MDX with structured data as props
4. Components access data from props, not hardcoded in JSX

## Additional Features

- **Search**: Pagefind for static, client-side search with language-specific indexes and faceted filtering
- **Validation**: lefthook runs `scripts/validate-content.ts` on staged MDX (frontmatter schemas, internal links, cross-references, series)
- **Scaffolding**: CLI tools for creating new articles from templates
- **Translation Management**: Admin dashboard at `/admin/translations` shows translation status and outdated content

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/velite.config.ts` | Velite configuration with Page collection |
| `apps/web/src/lib/content/schemas.ts` | Zod schemas for content validation |
| `apps/web/src/lib/content/translations.ts` | Translation utilities and fallback logic |
| `apps/web/src/lib/content/mdx-components.tsx` | MDX component registry (includes data-driven components) |
| `apps/web/src/components/content/` | Data-driven content components |
| `apps/web/scripts/validate-content.ts` | Content validation script |
| `apps/web/scripts/scaffold-article.ts` | Article scaffolding CLI |
| `apps/web/scripts/check-translations.ts` | Translation status reporting |

## Reference

- See `plan/research/reference/mdx-content-platform.md` for the original specification
- Pattern Reference: `src/lib/content/history/` for the typed-data version of the same components
