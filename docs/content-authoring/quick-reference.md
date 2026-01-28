# MDX Quick Reference Card

Quick reference for Nos Ilha content contributors. Print this page for offline reference!

## Common Commands

```bash
# Create new article
pnpm run scaffold:article

# Validate content
pnpm run validate:content

# Check translation status
pnpm run check:translations

# Local preview
pnpm run dev

# Build for production
pnpm run build
```

## Frontmatter Template

### Article (Required Fields)

```yaml
---
title: "Article Title (max 100 chars)"
description: "Brief description for SEO (max 200 chars)"
author: "Your Name"
publishDate: "2025-01-24" # YYYY-MM-DD
category: "history" # history | music | people | traditions | places
tags: ["tag1", "tag2", "tag3"]
language: "en" # en | pt | kea | fr
slug: "article-slug" # URL-friendly identifier
---
```

### Article (Optional Fields)

```yaml
updatedDate: "2025-01-25" # YYYY-MM-DD
coverImage: "/images/article.jpg"
draft: false # Hide from production
relatedArticles: ["slug1", "slug2"]

# Translation tracking
sourceHash: "abc123"
translationStatus: "complete" # complete | partial | outdated
lastTranslated: "2025-01-25"
```

### Page with Hero Section

```yaml
hero:
  videoSrc: "/images/history/video.mp4"
  title: "Hero Title"
  subtitle: "Hero subtitle text"
```

### Structured Data

```yaml
# Timeline
timeline:
  - date: "1680"
    title: "Event Title"
    description: "Event description"

# Historical Figures
figures:
  - name: "Person Name"
    role: "Role/Occupation"
    years: "1867-1930"
    description: "Short bio..."
    slug: "person-slug" # Optional link to bio

# Thematic Sections
sections:
  - title: "Section Title"
    description: "Brief overview"
    content: "Detailed content..."
    image: "/images/photo.jpg"
    imageCourtesy: "Photo credit"
    icon: "musical-note"

# Icon Grid
iconGridItems:
  - icon: "musical-note"
    title: "Item Title"
    description: "Item description"
    iconColor: "text-ocean-blue"

# Statistics
statisticsData:
  - value: "70%"
    label: "Label Text"
    description: "Description"
    color: "ocean-blue"

# Citations
citations:
  - source: "Book Title"
    author: "Author Name"
    year: 2015
    url: "https://example.com"
```

## Component Syntax

### Layout

```mdx
{/* Section with card background */}

<Section variant="card">Content here...</Section>

{/* Two-column grid */}

<TwoColumnGrid gap="lg">
  <div>Left column...</div>
  <div>Right column...</div>
</TwoColumnGrid>

{/* Card grid */}

<CardGrid columns={2}>
  <Card>Card 1...</Card>
  <Card>Card 2...</Card>
</CardGrid>

{/* Section title */}

<SectionTitle centered>Section Title</SectionTitle>
```

### Content

```mdx
{/* Callout box */}

<CalloutBox title="Title" variant="ocean-valley">
  Important information...
</CalloutBox>

{/* Image with credit */}

<ImageWithCourtesy
  src="/images/photo.jpg"
  alt="Description"
  courtesy="Photo credit"
/>

{/* Content card */}

<ContentCard>Card content...</ContentCard>
```

### Data-Driven

```mdx
{/* Timeline (data from frontmatter) */}

<HistoricalTimeline events={timeline} />

{/* Historical figures */}

<HistoricalFigures figures={figures} />

{/* Thematic sections */}

<ThematicSections sections={sections} />

{/* Icon grid */}

<IconGrid title="Grid Title" items={iconGridItems} />

{/* Statistics */}

<StatisticsGrid statistics={statisticsData} />

{/* Citations */}

<CitationSection citations={citations} />
```

### Interactive

```mdx
{/* Page header */}

<PageHeader title="Page Title" subtitle="Page subtitle" />

{/* Content toolbar */}

<ContentActionToolbar
  contentId="uuid-here"
  contentSlug="article-slug"
  contentTitle="Article Title"
  contentUrl="https://nosilha.com/music/..."
  contentType="Article"
  reactions={["❤️", "🎉", "💡", "👏"]}
  isAuthenticated={true}
  showOnScroll={true}
/>
```

## Markdown Syntax

```mdx
# Heading 1 (avoid - use h2 for top-level)

## Heading 2 (main sections)

### Heading 3 (subsections)

#### Heading 4 (minor headings)

**Bold text**
_Italic text_
**_Bold and italic_**

[Link text](https://example.com)
[Internal link](/history/article-slug)

- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item

> Blockquote

`inline code`
```

code block

```

---
Horizontal rule
```

## Translation Workflow

### Quick Steps

1. Copy English file:

   ```bash
   cp content/pages/category/slug/en.mdx \
      content/pages/category/slug/pt.mdx
   ```

2. Update frontmatter:

   ```yaml
   title: "Translated Title"
   description: "Translated description"
   tags: ["translated", "tags"]
   language: "pt" # CHANGE THIS!
   ```

3. Translate content (keep component structure)

4. Validate:

   ```bash
   pnpm run validate:content
   ```

5. Preview:
   ```bash
   open http://localhost:3000/category/slug?lang=pt
   ```

### Translation Checklist

- [ ] `language` field matches filename (`pt.mdx` → `language: "pt"`)
- [ ] All headings translated
- [ ] All paragraph text translated
- [ ] Component content translated (not component names)
- [ ] Alt text on images translated
- [ ] Structured data in frontmatter translated
- [ ] No English fragments remaining
- [ ] `category` field NOT translated (must stay `history`, `music`, `people`, `traditions`, or `places`)
- [ ] Validation passes
- [ ] Preview looks correct
- [ ] Language switcher works

## Validation Fixes

### Common Error: Invalid Category

**Error**: `category must be one of [history, music, people, traditions, places]`

**Fix**:

```yaml
category: "history" # Not "historical" or "heritage"
```

### Common Error: Language Mismatch

**Error**: `Frontmatter language 'en' doesn't match filename language 'pt'`

**Fix**:

```yaml
language: "pt" # Must match pt.mdx
```

### Common Error: Broken Internal Link

**Error**: `Internal link broken: /history/missing`

**Fix**:

- Create the missing article, OR
- Remove the link, OR
- Link to English version: `/history/missing?lang=en`

### Common Error: Missing Image

**Error**: `Image not found: /images/history/photo.jpg`

**Fix**:

- Add image to `/public/images/history/photo.jpg`
- Verify path starts with `/images/` (not `./images/`)
- Check file extension case (.jpg not .JPG)

### Common Error: Invalid Date Format

**Error**: `publishDate must be in YYYY-MM-DD format`

**Fix**:

```yaml
publishDate: "2025-01-24" # Not "01/24/2025" or "24-01-2025"
```

## File Locations

```
apps/web/
├── content/
│   └── pages/             # All content (top-level & sub-pages)
│       ├── history/       # /history + sub-pages
│       ├── music/         # /music + sub-pages
│       ├── people/        # /people + sub-pages
│       ├── traditions/    # /traditions + sub-pages
│       └── places/        # /places + sub-pages
├── public/
│   └── images/            # Image assets
│       ├── history/
│       ├── music/
│       ├── people/
│       └── traditions/
└── src/
    ├── components/
    │   └── content/       # Component source
    └── lib/
        └── content/       # Content utilities
```

## Design System Colors

Use these Tailwind color classes:

| Color              | Class                                              | Use Case           |
| ------------------ | -------------------------------------------------- | ------------------ |
| Ocean Blue         | `text-ocean-blue`, `bg-ocean-blue`                 | Primary brand      |
| Valley Green       | `text-valley-green`, `bg-valley-green`             | Nature/environment |
| Bougainvillea Pink | `text-bougainvillea-pink`, `bg-bougainvillea-pink` | Culture/arts       |
| Sunny Yellow       | `text-sunny-yellow`, `bg-sunny-yellow`             | Celebration        |

## Heroicons Reference

Common icon names for `icon` prop:

- `musical-note`, `book-open`, `globe-alt`, `clock`
- `map`, `camera`, `heart`, `star`
- `user-group`, `home`, `academic-cap`, `lightbulb`
- `chat-bubble-left-right`, `newspaper`, `photo`, `video-camera`

[Full icon list](https://heroicons.com/)

## Quick Troubleshooting

| Problem                  | Solution                                       |
| ------------------------ | ---------------------------------------------- |
| Content not appearing    | Check `draft: false`, run `pnpm run build`     |
| Image not loading        | Verify path: `/images/...`, check file exists  |
| Component not rendering  | Check `src/lib/content/mdx-components.tsx`     |
| Build error              | Run `pnpm run validate:content` first          |
| Language switcher broken | Verify file named correctly (`.mdx` not `.md`) |
| Validation failing       | Read error message, fix field, run again       |

## Help Resources

- **Full Contributor Guide**: [README.md](./README.md)
- **Translation Guide**: [translations.md](./translations.md)
- **Component Reference**: [components.md](./components.md)
- **Design System**: [../design-system.md](../design-system.md)
- **GitHub Issues**: Report bugs or request features

## Submission Checklist

Before submitting content:

- [ ] Content validates (`pnpm run validate:content`)
- [ ] Preview looks correct (`pnpm run dev`)
- [ ] Images are optimized (< 500KB each)
- [ ] Alt text on all images
- [ ] Internal links work
- [ ] Frontmatter complete
- [ ] Spelling/grammar checked
- [ ] Cultural sensitivity reviewed
- [ ] Attribution/credits added
- [ ] Git commit message descriptive

**Commit Message Format**:

```bash
feat(content): add article about Brava migration
docs(content): update history page with new research
docs(i18n): add Portuguese translation for morna article
```

---

**Print this page** for quick offline reference while writing content!

For detailed explanations, see the full documentation guides listed above.
