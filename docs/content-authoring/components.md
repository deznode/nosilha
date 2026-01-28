# MDX Components Reference

Comprehensive reference for all custom React components available in Nos Ilha MDX files. These components enable rich layouts and interactive content for cultural heritage storytelling.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Layout Components](#layout-components)
- [Content Components](#content-components)
- [Data-Driven Components](#data-driven-components)
- [Interactive Components](#interactive-components)
- [Media Components](#media-components)
- [Typography Components](#typography-components)
- [Utility Components](#utility-components)
- [Complete Examples](#complete-examples)

## Quick Reference

| Component                | Purpose                 | Common Use                      |
| ------------------------ | ----------------------- | ------------------------------- |
| `<Section>`              | Content section wrapper | Main sections with card styling |
| `<TwoColumnGrid>`        | Two-column layout       | Side-by-side content            |
| `<CardGrid>`             | Grid of cards           | Multiple cards in grid          |
| `<Card>`                 | Single card             | Individual card in grid         |
| `<ContentCard>`          | Card with padding       | Nested content card             |
| `<SectionTitle>`         | Section heading         | Consistent h3 titles            |
| `<CalloutBox>`           | Highlighted content     | Important info/quotes           |
| `<ImageWithCourtesy>`    | Image with credit       | Historical photos               |
| `<ImageGallery>`         | Image gallery           | Multiple photos                 |
| `<HistoricalTimeline>`   | Timeline events         | Historical chronology           |
| `<HistoricalFigures>`    | People cards            | Biographical info               |
| `<ThematicSections>`     | Alternating images      | Thematic content blocks         |
| `<IconGrid>`             | Icon grid layout        | Features/traditions             |
| `<StatisticsGrid>`       | Statistics boxes        | Key metrics                     |
| `<CitationSection>`      | Expandable citations    | References                      |
| `<ContentActionToolbar>` | Share/reactions         | Engagement actions              |
| `<PageHeader>`           | Page title/subtitle     | Page introduction               |
| `<RelatedEntries>`       | Related content         | Cross-linking                   |
| `<PrintPageWrapper>`     | Print layout            | Printable content               |
| `<BackToTopButton>`      | Scroll to top           | Long pages                      |
| `<PrintButton>`          | Print action            | Print functionality             |

## Layout Components

### Section

Wrapper component for content sections with variant styling.

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type                                | Default     | Description            |
| ----------- | ----------------------------------- | ----------- | ---------------------- |
| `variant`   | `"card" \| "default" \| "gradient"` | `"default"` | Visual style           |
| `children`  | `ReactNode`                         | Required    | Section content        |
| `className` | `string`                            | `""`        | Additional CSS classes |

**Variants**:

- `card` - White background with border, shadow, and padding (p-8)
- `default` - No background, just top margin (mt-16)
- `gradient` - Ocean-blue to valley-green gradient background

**Examples**:

```mdx
{/* Card variant - standard content section */}

<Section variant="card">

## A Land Born of Fire

Content with card background and border...

</Section>

{/* Default variant - no background */}

<Section variant="default">

## Continue Your Journey

Centered content without card...

</Section>

{/* Gradient variant - colorful background */}

<Section variant="gradient">

## Living Traditions

Content with gradient background...

</Section>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - Introduction section, "A Land Born of Fire" section

---

### TwoColumnGrid

Responsive two-column grid that stacks on mobile.

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type                   | Default  | Description               |
| ----------- | ---------------------- | -------- | ------------------------- |
| `children`  | `ReactNode`            | Required | Grid content (2 children) |
| `gap`       | `"sm" \| "md" \| "lg"` | `"lg"`   | Gap between columns       |
| `className` | `string`               | `""`     | Additional CSS classes    |

**Gap Sizes**:

- `sm` - 16px gap (gap-4)
- `md` - 24px gap (gap-6)
- `lg` - 32px gap (gap-8)

**Responsive Behavior**:

- **Desktop (lg+)**: Two columns side-by-side
- **Mobile**: Stacks vertically

**Example**:

```mdx
<Section variant="card">

<TwoColumnGrid gap="lg">
<div>

### Left Column

Content for left side...

- Point 1
- Point 2

</div>
<div>

### Right Column

Content for right side...

<ImageWithCourtesy
  src="/images/history/photo.jpg"
  alt="Historical photo"
  courtesy="Museum Archive"
/>

</div>
</TwoColumnGrid>

</Section>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "A Land Born of Fire" section, "The Yankee Connection" section

---

### CardGrid

Grid layout for multiple cards (2 or 3 columns).

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type                   | Default  | Description            |
| ----------- | ---------------------- | -------- | ---------------------- |
| `columns`   | `2 \| 3`               | `2`      | Number of columns      |
| `children`  | `ReactNode`            | Required | Card components        |
| `gap`       | `"sm" \| "md" \| "lg"` | `"md"`   | Gap between cards      |
| `className` | `string`               | `""`     | Additional CSS classes |

**Responsive Behavior**:

- **Desktop**: 2 or 3 columns (as specified)
- **Tablet**: 2 columns (for 3-column grids)
- **Mobile**: 1 column (stacks)

**Example**:

```mdx
<CardGrid columns={2} gap="md">
<Card>

### Card 1 Title

Card 1 content...

</Card>
<Card>

### Card 2 Title

Card 2 content...

</Card>
</CardGrid>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "The Yankee Connection" section (2-column card grid)

---

### Card

Individual card component for use in CardGrid.

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type        | Default  | Description            |
| ----------- | ----------- | -------- | ---------------------- |
| `children`  | `ReactNode` | Required | Card content           |
| `className` | `string`    | `""`     | Additional CSS classes |

**Styling**: White background, border, rounded corners, shadow, padding (p-6)

**Example**:

```mdx
<Card>

### The Brava Packet Trade

Regular steamship service connected Brava to New Bedford and Providence...

</Card>
```

---

### ContentCard

Card component for nested content (similar to Card but with semantic difference).

**Import**: Automatically available in MDX files

**Props**: Same as `<Card>`

**Use Case**: Use when nesting cards inside sections (e.g., a card inside a Section with card variant)

**Example**:

```mdx
<Section variant="default">

<ContentCard>

### Nested Card

This card is inside a section without a card background...

</ContentCard>

</Section>
```

---

### SectionTitle

Consistent styling for section titles (h3 elements).

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type        | Default  | Description            |
| ----------- | ----------- | -------- | ---------------------- |
| `children`  | `ReactNode` | Required | Title text             |
| `centered`  | `boolean`   | `false`  | Center align title     |
| `className` | `string`    | `""`     | Additional CSS classes |

**Styling**:

- Font: Serif (Merriweather)
- Size: 2xl
- Weight: Bold
- Spacing: mb-8 (bottom margin)

**Example**:

```mdx
<SectionTitle centered>
  The Yankee Connection: Whaling & Maritime Heritage
</SectionTitle>
```

**Note**: For custom spacing, use direct `<h3>` element:

```mdx
<h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
  Continue Your Journey
</h3>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "The Yankee Connection" section

---

## Content Components

### CalloutBox

Highlighted box for important information, quotes, or context.

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type                                                                 | Default          | Description            |
| ----------- | -------------------------------------------------------------------- | ---------------- | ---------------------- |
| `title`     | `string`                                                             | Optional         | Callout title          |
| `variant`   | `"ocean-valley" \| "valley-ocean" \| "pink-yellow" \| "yellow-pink"` | `"ocean-valley"` | Color gradient         |
| `children`  | `ReactNode`                                                          | Required         | Callout content        |
| `className` | `string`                                                             | `""`             | Additional CSS classes |

**Variants**:

| Variant        | Gradient                          | Border             | Use Case                     |
| -------------- | --------------------------------- | ------------------ | ---------------------------- |
| `ocean-valley` | Ocean-blue → Valley-green         | Ocean-blue         | General info                 |
| `valley-ocean` | Valley-green → Ocean-blue         | Valley-green       | Environmental/natural topics |
| `pink-yellow`  | Bougainvillea-pink → Sunny-yellow | Bougainvillea-pink | Cultural/artistic topics     |
| `yellow-pink`  | Sunny-yellow → Bougainvillea-pink | Sunny-yellow       | Celebratory content          |

**Styling**: Rounded corners, left border (4px), gradient background, padding (p-6)

**Example**:

```mdx
<CalloutBox title="A Community Forged by Compassion" variant="ocean-valley">

This initial act of refuge set the tone for Brava's identity: a place where
hardship breeds solidarity, and where the community's survival depends on
collective effort and mutual care.

</CalloutBox>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "A Land Born of Fire" section, "The Yankee Connection" section

---

### ImageWithCourtesy

Image component with attribution credit.

**Import**: Automatically available in MDX files

**Props**:

| Prop        | Type     | Default  | Description                 |
| ----------- | -------- | -------- | --------------------------- |
| `src`       | `string` | Required | Image path (from `/public`) |
| `alt`       | `string` | Required | Alt text for accessibility  |
| `courtesy`  | `string` | Required | Photo credit/source         |
| `className` | `string` | `""`     | Additional CSS classes      |

**Styling**:

- Image: Rounded corners, full width
- Credit: Small text, gray color, italic, below image

**Example**:

```mdx
<ImageWithCourtesy
  src="/images/history/whaling-ship.jpg"
  alt="Whaling ship in New Bedford Harbor, 1890s"
  courtesy="New Bedford Whaling Museum"
/>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "The Yankee Connection" section, "Chapters of Brava's Story" section

---

## Data-Driven Components

These components use structured data from frontmatter instead of inline content.

### HistoricalTimeline

Vertical timeline for chronological events.

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
timeline:
  - date: "1680"
    title: "The Great Migration"
    description: "Following the eruption of Pico do Fogo, refugees from Fogo Island establish permanent settlements on Brava."
  - date: "1843"
    title: "Whaling Era Begins"
    description: "First Bravense sailors join American whaling ships, beginning a maritime tradition."
```

**Props**:

| Prop     | Type              | Description                               |
| -------- | ----------------- | ----------------------------------------- |
| `events` | `TimelineEvent[]` | Array of timeline events from frontmatter |

**TypeScript Interface**:

```typescript
interface TimelineEvent {
  date: string; // Display date (any format)
  title: string; // Event title
  description: string; // Event description
}
```

**Usage in MDX**:

```mdx
<Section variant="card">

<SectionTitle>Key Historical Periods</SectionTitle>

<HistoricalTimeline events={timeline} />

</Section>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "Key Historical Periods" section

---

### HistoricalFigures

Grid of historical figure cards with biographies.

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
figures:
  - name: "Eugénio Tavares"
    role: "Poet & Composer"
    years: "1867-1930"
    description: "Renowned composer of mornas and chronicler of Brava's soul..."
    slug: "eugenio-tavares" # Optional: links to bio page
  - name: "Marcelino 'Daddy' Grace"
    role: "Religious Leader"
    years: "1881-1960"
    description: "Founded the United House of Prayer for All People..."
```

**Props**:

| Prop      | Type                 | Description                       |
| --------- | -------------------- | --------------------------------- |
| `figures` | `HistoricalFigure[]` | Array of figures from frontmatter |

**TypeScript Interface**:

```typescript
interface HistoricalFigure {
  name: string; // Person's name
  role: string; // Role/occupation
  years: string; // Lifespan (e.g., "1867-1930")
  description: string; // Short biography/description
  slug?: string; // Optional slug for linking to bio page
}
```

**Usage in MDX**:

```mdx
<Section variant="card">

<SectionTitle>Cultural Architects of Brava</SectionTitle>

<HistoricalFigures figures={figures} />

</Section>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "Cultural Architects of Brava" section

---

### ThematicSections

Alternating image layout for thematic content blocks (image left/right alternating).

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
sections:
  - title: "Portuguese Settlement & Governance"
    description: "Brief overview of the section"
    content: "From its first permanent settlement in 1680, Brava developed..."
    image: "/images/history/portuguese-settlement.jpg"
    imageCourtesy: "Arquivo Histórico Nacional"
    icon: "globe-alt"
  - title: "The Musical Soul of Brava"
    description: "Brava's unique musical heritage"
    content: "Brava Island holds a unique position in Cape Verdean music..."
    image: "/images/music/morna-musicians.jpg"
    imageCourtesy: "Arquivo da Morna"
    icon: "musical-note"
```

**Props**:

| Prop       | Type                | Description                        |
| ---------- | ------------------- | ---------------------------------- |
| `sections` | `ThematicSection[]` | Array of sections from frontmatter |

**TypeScript Interface**:

```typescript
interface ThematicSection {
  title: string; // Section title
  description: string; // Brief overview
  content: string; // Detailed content text
  image: string; // Image path
  imageCourtesy: string; // Photo credit
  icon?: string; // Heroicon name (e.g., "musical-note")
}
```

**Available Icons**: Any [Heroicons](https://heroicons.com/) outline icon name:

- `globe-alt`, `musical-note`, `book-open`, `clock`, `map`, `camera`, etc.

**Usage in MDX**:

```mdx
<Section variant="card">

<SectionTitle>Chapters of Brava's Story</SectionTitle>

<ThematicSections sections={sections} />

</Section>
```

**Live Example**: See [`/history`](http://localhost:3000/history) - "Chapters of Brava's Story" section

---

### IconGrid

Grid of icons with titles and descriptions.

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
iconGridItems:
  - icon: "musical-note"
    title: "Musical Heritage"
    description: "Home of the morna, Cape Verde's blues"
    iconColor: "text-bougainvillea-pink"
  - icon: "book-open"
    title: "Literary Tradition"
    description: "Birthplace of renowned poets and writers"
    iconColor: "text-ocean-blue"
  - icon: "globe-alt"
    title: "Global Diaspora"
    description: "Connected communities across continents"
    iconColor: "text-valley-green"
```

**Props**:

| Prop    | Type             | Description                     |
| ------- | ---------------- | ------------------------------- |
| `items` | `IconGridItem[]` | Array of items from frontmatter |
| `title` | `string`         | Optional section title          |

**TypeScript Interface**:

```typescript
interface IconGridItem {
  icon: string; // Heroicon name
  title: string; // Item title
  description: string; // Item description
  iconColor?: string; // Tailwind text color class
}
```

**Color Options**:

- `text-ocean-blue`, `text-valley-green`, `text-bougainvillea-pink`, `text-sunny-yellow`

**Usage in MDX**:

```mdx
<IconGrid
  title="Living Traditions: The Cultural DNA of Brava"
  items={iconGridItems}
/>
```

**Styling**: Gradient background (ocean-blue to valley-green), 3-column grid on desktop

**Live Example**: See [`/history`](http://localhost:3000/history) - "Living Traditions" section

---

### StatisticsGrid

Grid of statistics boxes with colored backgrounds.

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
statisticsData:
  - value: "70%"
    label: "Population Abroad"
    description: "An estimated 70% of Brava's population lives in the diaspora"
    color: "ocean-blue"
  - value: "6,000"
    label: "Island Population"
    description: "Current population on Brava Island"
    color: "valley-green"
  - value: "100+"
    label: "Years of Migration"
    description: "Over a century of diaspora connections"
    color: "bougainvillea-pink"
```

**Props**:

| Prop         | Type          | Description                          |
| ------------ | ------------- | ------------------------------------ |
| `statistics` | `Statistic[]` | Array of statistics from frontmatter |

**TypeScript Interface**:

```typescript
interface Statistic {
  value: string; // Statistic value (e.g., "70%", "6,000")
  label: string; // Statistic label
  description: string; // Detailed description
  color: string; // Color variant
}
```

**Color Options**:

- `ocean-blue`, `valley-green`, `bougainvillea-pink`, `sunny-yellow`

**Usage in MDX**:

```mdx
<Section variant="card">

## Contemporary Brava: Heritage & Innovation

<StatisticsGrid statistics={statisticsData} />

</Section>
```

**Styling**: Colored gradient backgrounds, rounded corners, 2-column grid

**Live Example**: See [`/history`](http://localhost:3000/history) - "Contemporary Brava" section

---

## Interactive Components

### CitationSection

Expandable section for citations and references.

**Import**: Automatically available in MDX files

**Data Structure** (in frontmatter):

```yaml
citations:
  - source: "Cape Verde: Crioulo Colony to Independent Nation"
    author: "Richard Lobban & Marilyn Halter"
    year: 1988
    url: "https://example.com"
  - source: "The Brava Migration to New England"
    author: "Maria Silva"
    year: 2015
```

**Props**:

| Prop        | Type         | Description                         |
| ----------- | ------------ | ----------------------------------- |
| `citations` | `Citation[]` | Array of citations from frontmatter |

**TypeScript Interface**:

```typescript
interface Citation {
  source: string; // Source title
  author: string; // Author name(s)
  year?: number; // Publication year (optional)
  url?: string; // URL (optional)
}
```

**Usage in MDX**:

```mdx
{/* Use at end of article */}

<CitationSection citations={citations} />
```

**Behavior**:

- Initially collapsed
- Click to expand/collapse
- Shows chevron icon
- Lists all citations

**Live Example**: See [`/history`](http://localhost:3000/history) - Bottom of page

---

### ContentActionToolbar

Sticky toolbar with share, reactions, and content actions.

**Import**: Automatically available in MDX files

**Props**:

| Prop              | Type                  | Description           |
| ----------------- | --------------------- | --------------------- |
| `contentId`       | `string`              | UUID for content      |
| `contentSlug`     | `string`              | URL slug              |
| `contentTitle`    | `string`              | Content title         |
| `contentUrl`      | `string`              | Full URL              |
| `contentType`     | `"Page" \| "Article"` | Content type          |
| `reactions`       | `string[]`            | Emoji reactions array |
| `isAuthenticated` | `boolean`             | User auth status      |
| `showOnScroll`    | `boolean`             | Show on scroll only   |

**Usage in MDX**:

```mdx
<ContentActionToolbar
  contentId="11111111-2222-4333-8444-555555555555"
  contentSlug="history"
  contentTitle="History & Heritage"
  contentUrl="https://nosilha.com/history"
  contentType="Page"
  reactions={["❤️", "🎉", "💡", "👏"]}
  isAuthenticated={true}
  showOnScroll={true}
/>
```

**Features**:

- Share button (copy link)
- Emoji reactions (like, celebrate, idea, applause)
- Print button
- Suggest edits button
- Sticky positioning on scroll

**Live Example**: See [`/history`](http://localhost:3000/history) - Scrolls with page

---

## Media Components

### VideoHeroSection

Full-viewport video hero section with overlay text.

**Note**: This component is rendered from **frontmatter data**, not directly in MDX content.

**Data Structure** (in frontmatter):

```yaml
hero:
  videoSrc: "/images/history/brava-overview.mp4"
  title: "Our Island, Our Story: The History of Brava"
  subtitle: "From Vila Nova Sintra's heights, discover the rich tapestry of Brava Island"
```

**Rendering**: The page wrapper component (e.g., `history-page-content.tsx`) renders this **outside** the content container for full-width display.

**Styling**:

- Height: Full viewport minus nav (calc(100vh - 81px))
- Background: Video or fallback image
- Overlay: Dark gradient for text readability
- Text: Centered, white, with title and subtitle

**Live Example**: See [`/history`](http://localhost:3000/history) - Hero section at top

---

### ImageGallery

Display a gallery of images with lightbox functionality.

**Import**: Automatically available in MDX files

**Props**:

| Prop     | Type           | Description              |
| -------- | -------------- | ------------------------ |
| `images` | `GalleryImage[]` | Array of images to display |

**TypeScript Interface**:

```typescript
interface GalleryImage {
  src: string; // Image path
  alt: string; // Alt text
  caption?: string; // Optional caption
}
```

**Usage in MDX**:

```mdx
<ImageGallery
  images={[
    { src: "/images/history/photo1.jpg", alt: "Historical photo 1", caption: "Vila Nova Sintra, 1920" },
    { src: "/images/history/photo2.jpg", alt: "Historical photo 2", caption: "Harbor view, 1935" },
  ]}
/>
```

---

### RelatedEntries

Display related content entries (articles, pages).

**Import**: Automatically available in MDX files

**Props**:

| Prop      | Type       | Description                    |
| --------- | ---------- | ------------------------------ |
| `entries` | `Entry[]`  | Array of related entries       |
| `title`   | `string`   | Optional section title         |

**Usage in MDX**:

```mdx
<RelatedEntries
  title="Continue Exploring"
  entries={relatedArticles}
/>
```

---

## Typography Components

### PageHeader

Page title and subtitle component.

**Import**: Automatically available in MDX files

**Props**:

| Prop       | Type     | Description   |
| ---------- | -------- | ------------- |
| `title`    | `string` | Page title    |
| `subtitle` | `string` | Page subtitle |

**Usage in MDX**:

```mdx
<PageHeader
  title="History & Heritage"
  subtitle="Discover the rich cultural tapestry and fascinating history of Brava Island, from its volcanic origins to its vibrant musical traditions."
/>
```

**Styling**:

- Title: Large, bold, serif font
- Subtitle: Medium, gray text
- Spacing: Bottom margin for content separation

**Live Example**: See [`/history`](http://localhost:3000/history) - After hero section

---

## Utility Components

### PrintPageWrapper

Wrapper component for printable content with optimized print styling.

**Import**: Automatically available in MDX files

**Props**:

| Prop       | Type        | Description     |
| ---------- | ----------- | --------------- |
| `children` | `ReactNode` | Content to wrap |

**Usage in MDX**:

```mdx
<PrintPageWrapper>

{/* Content that should be optimized for printing */}

</PrintPageWrapper>
```

---

### BackToTopButton

Floating button that scrolls to the top of the page.

**Import**: Automatically available in MDX files

**Props**: None

**Usage in MDX**:

```mdx
{/* Place at end of long content */}

<BackToTopButton />
```

**Behavior**: Appears after scrolling down, smooth scrolls to top on click.

---

### PrintButton

Button that triggers the browser's print dialog.

**Import**: Automatically available in MDX files

**Props**: None

**Usage in MDX**:

```mdx
<PrintButton />
```

---

## Complete Examples

### Simple Article Layout

```mdx
---
title: "The Morna: Brava's Musical Legacy"
description: "Exploring the origins and evolution of Cape Verde's signature musical genre"
author: "Maria Silva"
publishDate: "2025-01-24"
category: "music"
tags: ["morna", "music", "culture"]
language: "en"
slug: "morna-legacy"

citations:
  - source: "The Music of Cape Verde"
    author: "João Silva"
    year: 2010
---

<PageHeader
  title="The Morna: Brava's Musical Legacy"
  subtitle="Exploring the origins and evolution of Cape Verde's signature musical genre"
/>

<ContentActionToolbar
  contentId="22222222-3333-4444-5555-666666666666"
  contentSlug="morna-legacy"
  contentTitle="The Morna: Brava's Musical Legacy"
  contentUrl="https://nosilha.com/music/morna-legacy"
  contentType="Article"
  reactions={["❤️", "🎉", "💡", "👏"]}
  isAuthenticated={true}
  showOnScroll={true}
/>

<Section variant="card">

## Origins of the Morna

The morna, often called "Cape Verde's blues," originated on Boa Vista Island but found
its most eloquent expression on Brava...

</Section>

<Section variant="card">

<TwoColumnGrid>
<div>

### Eugénio Tavares

The father of modern morna, Eugénio Tavares (1867-1930) transformed the genre...

</div>
<div>

<ImageWithCourtesy
  src="/images/people/eugenio-tavares.jpg"
  alt="Eugénio Tavares playing guitar"
  courtesy="Arquivo Histórico Nacional"
/>

</div>
</TwoColumnGrid>

</Section>

<Section variant="card">

<CalloutBox title="The Morna's Global Reach" variant="ocean-valley">

Today, the morna is recognized as a symbol of Cape Verdean identity worldwide, with
Cesária Évora's recordings bringing it to international acclaim.

</CalloutBox>

</Section>

<CitationSection citations={citations} />
```

---

### Complex Heritage Page Layout

```mdx
---
title: "People of Brava"
description: "Meet the poets, musicians, and visionaries who shaped Brava's identity"
author: "José Costa"
publishDate: "2025-01-24"
category: "people"
tags: ["biography", "culture", "history"]
language: "en"
slug: "people"

# Hero section
hero:
  videoSrc: "/images/people/community.mp4"
  title: "The People of Brava"
  subtitle: "Stories of resilience, creativity, and morabeza"

# Historical figures
figures:
  - name: "Eugénio Tavares"
    role: "Poet & Composer"
    years: "1867-1930"
    description: "Renowned composer of mornas and chronicler of Brava's soul"
    slug: "eugenio-tavares"
  - name: "Marcelino 'Daddy' Grace"
    role: "Religious Leader"
    years: "1881-1960"
    description: "Founded the United House of Prayer for All People"

# Timeline of key events
timeline:
  - date: "1867"
    title: "Birth of Eugénio Tavares"
    description: "The father of modern morna is born in Brava"
  - date: "1881"
    title: "Daddy Grace Born"
    description: "Marcelino Grace born in Brava, later moves to US"

# Statistics
statisticsData:
  - value: "500+"
    label: "Notable Figures"
    description: "Documented Bravense leaders, artists, and innovators"
    color: "ocean-blue"
---

<PageHeader
  title="People of Brava"
  subtitle="Meet the poets, musicians, and visionaries who shaped Brava's identity"
/>

<Section variant="card">
<div className="mx-auto max-w-4xl">

Brava Island, despite its small size, has produced an extraordinary number of influential
figures in arts, music, literature, and social movements...

</div>
</Section>

<Section variant="card">

<SectionTitle>Cultural Icons</SectionTitle>

<HistoricalFigures figures={figures} />

</Section>

<Section variant="card">

<SectionTitle>Timeline of Notable Lives</SectionTitle>

<HistoricalTimeline events={timeline} />

</Section>

<Section variant="card">

## Impact & Legacy

<StatisticsGrid statistics={statisticsData} />

<CalloutBox title="Living Heritage" variant="valley-ocean">

The legacy of Brava's people continues today through the diaspora communities
in New England, Europe, and beyond.

</CalloutBox>

</Section>

<CitationSection citations={citations} />
```

---

## Best Practices

### Component Selection

**Use `<Section variant="card">` when**:

- Content needs visual separation
- Creating distinct topic sections
- Standard article sections

**Use `<Section variant="default">` when**:

- Content should blend with page background
- Creating transitional sections
- Hero sections or introductions

**Use `<TwoColumnGrid>` when**:

- Side-by-side content makes sense
- Pairing text with images
- Comparing two concepts

**Use `<CardGrid>` when**:

- Multiple similar items
- Card-based layouts
- Lists of resources or links

### Data-Driven vs Inline Content

**Use data-driven components** (frontmatter + component) when:

- Structured, repeating data (timelines, figures, statistics)
- Content that might be reused or filtered
- Machine-readable data for SEO

**Use inline MDX content** when:

- Narrative text
- Unique, one-off layouts
- Flexibility is priority

### Accessibility

All components include accessibility features:

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader compatibility
- Alt text on images

**Always provide**:

- Alt text for images: `<ImageWithCourtesy alt="Description" />`
- Meaningful heading hierarchy: h2 → h3 → h4 (no skipping)
- Descriptive link text: "Learn more about mornas" not "Click here"

---

## Need Help?

- **Main Contributor Guide**: [README.md](./README.md)
- **Translation Guide**: [translations.md](./translations.md)
- **Quick Reference**: [quick-reference.md](./quick-reference.md)
- **Design System**: [../design-system.md](../design-system.md)
- **Component Source Code**: `apps/web/src/components/content/`

---

**Component Not Listed?** Check `src/lib/content/mdx-components.tsx` for the complete registry of available components.
