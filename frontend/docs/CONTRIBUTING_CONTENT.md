# Contributing Content to Nos Ilha

Welcome! This guide will help you add articles, stories, and cultural heritage content to the Nos Ilha platform using our MDX-based content system.

## Table of Contents

- [Quick Start](#quick-start)
- [Content Structure](#content-structure)
- [Writing Your First Article](#writing-your-first-article)
- [Using the Scaffolding Tool](#using-the-scaffolding-tool)
- [Frontmatter Schema](#frontmatter-schema)
- [Using MDX Components](#using-mdx-components)
- [Validation & Quality Checks](#validation--quality-checks)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

## Quick Start

**5-Minute Onboarding:**

1. **Install dependencies**:

   ```bash
   cd frontend
   pnpm install
   ```

2. **Create a new article**:

   ```bash
   pnpm run scaffold:article
   ```

   Follow the prompts to create your article from a template.

3. **Write your content** in `content/pages/[category]/[slug]/en.mdx`

4. **Validate your content**:

   ```bash
   pnpm run validate:content
   ```

5. **Preview locally**:

   ```bash
   pnpm run dev
   ```

   Open `http://localhost:3000/[category]/[slug]`

6. **Submit** your content via pull request

## Content Structure

The Nos Ilha content platform uses **MDX** (Markdown + React components) for all articles and pages. All content lives in `content/pages/`:

### Content Organization (`content/pages/`)

**Structure**:

```
content/pages/
├── history/                    # Top-level page: /history
│   ├── en.mdx
│   └── pt.mdx
├── music/                      # Top-level page: /music
│   ├── en.mdx
│   ├── morna-origins/          # Sub-page: /music/morna-origins
│   │   ├── en.mdx
│   │   └── pt.mdx
│   └── funana-traditions/      # Sub-page: /music/funana-traditions
│       └── en.mdx
├── people/                     # Top-level page: /people
│   ├── en.mdx
│   ├── eugenio-tavares/        # Sub-page: /people/eugenio-tavares
│   │   └── en.mdx
│   └── daddy-grace/            # Sub-page: /people/daddy-grace
│       └── en.mdx
├── traditions/                 # Top-level page: /traditions
│   └── en.mdx
└── places/                     # Top-level page: /places
    └── en.mdx
```

**URL Patterns**:

- Top-level pages: `/[category]` (e.g., `/history`, `/music`, `/people`)
- Sub-pages: `/[category]/[slug]` (e.g., `/music/morna-origins`, `/people/eugenio-tavares`)

## Writing Your First Article

### Step 1: Choose Your Content Type

**Are you writing a sub-page (article, biography, topic)?** → Create in `content/pages/[category]/[slug]/`
**Are you creating a top-level section page?** → Create in `content/pages/[category]/` (requires coordination with maintainers)

### Step 2: Use the Scaffolding Tool

The scaffolding tool creates a new article with proper structure and template:

```bash
pnpm run scaffold:article
```

**You'll be prompted for**:

- Article category (history, music, people, traditions, places)
- Article slug (URL-friendly name, e.g., `brava-migration`)
- Article title
- Author name
- Brief description

**Output**: Creates `content/pages/[category]/[slug]/en.mdx` with template

### Step 3: Edit Your Article

Open the generated MDX file in your editor:

```mdx
---
title: "The Great Brava Migration"
description: "How Brava Islanders shaped New England's maritime history"
author: "Maria Silva"
publishDate: "2025-01-24"
category: "history"
tags: ["migration", "whaling", "diaspora"]
language: "en"
---

<PageHeader
  title="The Great Brava Migration"
  subtitle="How Brava Islanders shaped New England's maritime history"
/>

<Section variant="card">

## Introduction

Your content here...

</Section>
```

### Step 4: Add Your Content

Write using a combination of:

- **Markdown** for text formatting
- **Custom components** for rich layouts (see [Using MDX Components](#using-mdx-components))
- **Frontmatter data** for structured content (timelines, figures, statistics)

### Step 5: Validate and Preview

```bash
# Validate frontmatter, links, and references
pnpm run validate:content

# Start dev server
pnpm run dev

# Open in browser
open http://localhost:3000/history/brava-migration
```

## Frontmatter Schema

Frontmatter is the YAML metadata at the top of your MDX file. All fields are validated during build.

### Required Fields

```yaml
---
title: "Article Title" # Main title (max 100 chars)
description: "Brief description" # SEO description (max 200 chars)
author: "Author Name" # Your name
publishDate: "2025-01-24" # ISO format: YYYY-MM-DD
category: "history" # history | music | people | traditions | places
tags: ["tag1", "tag2"] # Array of tags
language: "en" # en | pt | kea | fr
---
```

### Optional Fields

```yaml
# Additional metadata
updatedDate: "2025-01-25" # ISO format: YYYY-MM-DD
featuredImage: "/images/article.jpg" # Featured image path
imageCredit: "Photo by John Doe" # Image attribution
readingTime: 10 # Minutes (auto-calculated if omitted)
isDraft: false # Set to true to hide from production

# Related content
relatedArticles: ["slug1", "slug2"] # Related article slugs

# SEO & Social
ogImage: "/images/og-image.jpg" # Open Graph image
twitterHandle: "@nosilha" # Twitter handle for author
```

### Structured Data Fields (Optional)

For complex cultural heritage pages (like `/history`), you can add structured data:

```yaml
# Hero section (full-width video/image)
hero:
  videoSrc: "/images/history/brava-overview.mp4"
  title: "Our Island, Our Story"
  subtitle: "From Vila Nova Sintra's heights..."

# Timeline events
timeline:
  - date: "1680"
    title: "The Great Migration"
    description: "Fogo eruption forces settlement"

# Historical figures
figures:
  - name: "Eugénio Tavares"
    role: "Poet & Composer"
    years: "1867-1930"
    description: "Renowned mornas composer..."
    imageSrc: "/images/people/eugenio-tavares.jpg"

# Icon grid items
iconGridItems:
  - icon: "musical-note"
    title: "Musical Heritage"
    description: "Home of the morna..."
    iconColor: "text-bougainvillea-pink"

# Statistics
statisticsData:
  - value: "70%"
    label: "Population Abroad"
    description: "Living in diaspora"
    color: "ocean-blue"
```

**Note**: See [`docs/MDX_COMPONENTS.md`](./MDX_COMPONENTS.md) for complete reference on data-driven components.

## Using MDX Components

MDX allows you to use React components directly in your Markdown. Nos Ilha provides 15+ custom components for rich layouts.

### Layout Components

#### Section

Wrapper for content sections with card styling:

```mdx
<Section variant="card">

## Your Section Title

Content here...

</Section>
```

**Variants**:

- `card` - White background, border, shadow (default for content sections)
- `default` - No background (just spacing)
- `gradient` - Ocean-blue to valley-green gradient background

#### TwoColumnGrid

Responsive two-column layout:

```mdx
<TwoColumnGrid gap="lg">
<div>

### Left Column

Content here...

</div>
<div>

### Right Column

Content here...

</div>
</TwoColumnGrid>
```

**Gap sizes**: `sm` (16px), `md` (24px), `lg` (32px)

#### CardGrid

Grid of cards (2 or 3 columns):

```mdx
<CardGrid columns={2}>
<Card>

### Card 1

Content...

</Card>
<Card>

### Card 2

Content...

</Card>
</CardGrid>
```

### Content Components

#### CalloutBox

Highlighted box for important information:

```mdx
<CalloutBox title="Did You Know?" variant="ocean-valley">

Brava Island is the westernmost point of Africa!

</CalloutBox>
```

**Variants**: `ocean-valley`, `valley-ocean`, `pink-yellow`, `yellow-pink`

#### ImageWithCourtesy

Image with attribution:

```mdx
<ImageWithCourtesy
  src="/images/history/whaling.jpg"
  alt="Whaling ship in New Bedford"
  courtesy="New Bedford Whaling Museum"
/>
```

#### ContentCard

Card with title and content:

```mdx
<ContentCard>

### Card Title

Card content here...

</ContentCard>
```

### Data-Driven Components

These components use structured data from frontmatter:

#### HistoricalTimeline

```mdx
{/* Define in frontmatter */}
timeline:

- date: "1680"
  title: "The Great Migration"
  description: "Fogo eruption forces settlement"

{/* Use in MDX */}

<HistoricalTimeline events={timeline} />
```

#### HistoricalFigures

```mdx
{/* Define in frontmatter */}
figures:

- name: "Eugénio Tavares"
  role: "Poet & Composer"
  years: "1867-1930"
  description: "Renowned mornas composer..."

{/* Use in MDX */}

<HistoricalFigures figures={figures} />
```

#### ThematicSections

Alternating image layout for thematic content:

```mdx
{/* Define in frontmatter */}
sections:

- title: "Musical Heritage"
  icon: "musical-note"
  imageSrc: "/images/music/morna.jpg"
  imagePosition: "left"
  content: "Brava is the birthplace..."

{/* Use in MDX */}

<ThematicSections sections={sections} />
```

**Complete Reference**: See [`docs/MDX_COMPONENTS.md`](./MDX_COMPONENTS.md) for all components with props and examples.

## Validation & Quality Checks

### Automated Validation

**Pre-commit Hook**: Validates content before every commit

- Frontmatter schema validation
- Internal link checking
- Cross-reference validation
- Markdown linting

**Manual Validation**:

```bash
pnpm run validate:content
```

### What Gets Validated

1. **Frontmatter Schema**:
   - Required fields present
   - Correct data types
   - Valid enum values (category, language)
   - Valid date formats

2. **Internal Links**:
   - All internal links resolve to existing content
   - No broken references to articles or pages

3. **Cross-References**:
   - Related articles exist
   - Referenced images exist in `/public/images/`

4. **Content Quality**:
   - No empty sections
   - Proper heading hierarchy
   - Alt text on images

### Fixing Validation Errors

**Common Error**: "Invalid frontmatter: category must be one of [history, music, people, traditions, places]"

**Fix**: Update category in frontmatter:

```yaml
category: "history" # Not "historical" or "heritage"
```

**Common Error**: "Internal link broken: /history/missing-article"

**Fix**: Either create the missing article or remove the link

**Common Error**: "Image not found: /images/history/photo.jpg"

**Fix**: Add the image to `/public/images/history/photo.jpg`

## Common Workflows

### Creating a Simple Article

```bash
# 1. Scaffold article
pnpm run scaffold:article

# 2. Write content in generated MDX file
code content/pages/history/my-article/en.mdx

# 3. Add images to public folder
cp ~/photos/hero.jpg public/images/history/

# 4. Validate
pnpm run validate:content

# 5. Preview
pnpm run dev

# 6. Commit
git add .
git commit -m "feat(content): add article about Brava migration"
```

### Creating a Complex Heritage Page

```bash
# 1. Create MDX file in pages directory
code content/pages/people/en.mdx

# 2. Define structured data in frontmatter
# Add hero, timeline, figures, iconGridItems, etc.

# 3. Use data-driven components in content
# <HistoricalTimeline events={timeline} />
# <HistoricalFigures figures={figures} />

# 4. Create custom page wrapper (if needed)
code src/app/(main)/people/people-page-content.tsx

# 5. Update Velite config for new structured fields
code velite.config.ts

# 6. Validate and preview
pnpm run validate:content
pnpm run dev
```

### Adding Translations

```bash
# 1. Check translation status
pnpm run check:translations

# 2. Create translation file (same directory as original)
code content/pages/history/my-article/pt.mdx

# 3. Copy frontmatter and translate
# Keep same structure, translate content

# 4. Validate
pnpm run validate:content

# 5. Preview with language switcher
pnpm run dev
open http://localhost:3000/history/my-article?lang=pt
```

**Detailed Translation Guide**: See [`docs/TRANSLATION_GUIDE.md`](./TRANSLATION_GUIDE.md)

### Updating Existing Content

```bash
# 1. Find the article
ls content/pages/history/

# 2. Edit the MDX file
code content/pages/history/brava-migration/en.mdx

# 3. Update updatedDate in frontmatter
updatedDate: "2025-01-24"

# 4. Validate
pnpm run validate:content

# 5. Preview changes
pnpm run dev

# 6. Commit with descriptive message
git commit -m "docs(content): update Brava migration article with new research"
```

## Troubleshooting

### Build Errors

**Error**: "Cannot find module '@/.velite'"

**Solution**: Run Velite to generate content:

```bash
pnpm run build
```

**Error**: "Expected component Section to be defined"

**Solution**: Component not imported in `mdx-components.tsx`. Add:

```tsx
import { Section } from "@/components/content/section";
```

### Content Not Appearing

**Issue**: Article doesn't show up on website

**Checklist**:

1. Is `isDraft: false` in frontmatter?
2. Is `publishDate` in the past?
3. Did you run `pnpm run build` to process content?
4. Did content pass validation?

### Image Not Loading

**Issue**: Image shows broken link icon

**Checklist**:

1. Is image in `/public/images/` directory?
2. Is path correct in MDX (starts with `/images/`)?
3. Is file extension correct (.jpg not .JPG)?
4. Did you commit the image file?

### Component Not Rendering

**Issue**: Component shows as plain text instead of rendering

**Solutions**:

1. Check component is imported in `src/lib/content/mdx-components.tsx`
2. Verify component name matches exactly (case-sensitive)
3. Ensure you're using JSX syntax: `<Component>` not `{Component}`

### Validation Failing

**Issue**: `pnpm run validate:content` shows errors

**Steps**:

1. Read error message carefully (shows field and issue)
2. Check frontmatter schema matches required fields
3. Verify all internal links exist
4. Ensure all referenced images exist
5. Run validation again to confirm fix

## Need Help?

- **Component Reference**: [`docs/MDX_COMPONENTS.md`](./MDX_COMPONENTS.md)
- **Translation Guide**: [`docs/TRANSLATION_GUIDE.md`](./TRANSLATION_GUIDE.md)
- **Quick Reference**: [`docs/MDX_QUICK_REFERENCE.md`](./MDX_QUICK_REFERENCE.md)
- **Design System**: [`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/yourusername/nosilha/issues)

## Cultural Heritage Guidelines

When contributing content about Brava Island and Cape Verdean culture:

1. **Accuracy First**: Verify historical facts with multiple sources
2. **Cultural Sensitivity**: Respect local perspectives and traditions
3. **Morabeza Spirit**: Write with warmth, hospitality, and authenticity
4. **Community Voice**: Prioritize stories from Bravense people
5. **Multilingual Support**: Consider translation to PT and KEA when possible

**Detailed Guidelines**: See [`docs/CULTURAL_HERITAGE_VERIFICATION.md`](./CULTURAL_HERITAGE_VERIFICATION.md)

---

**Thank you for contributing to Nos Ilha!** Your work helps preserve and celebrate Brava Island's rich cultural heritage for generations to come.
