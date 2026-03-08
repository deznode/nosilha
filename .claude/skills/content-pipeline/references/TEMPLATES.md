# Content and Report Templates

## Table of Contents
- [Content Plan Template](#content-plan-template)
- [Schema Markup Examples](#schema-markup-examples)
- [Research Output Template](#research-output-template)
- [Verification Report Template](#verification-report-template)

## Content Plan Template

Save to `plan/content/{slug}/content-plan.md`:

```markdown
# [Topic] Content Plan — Nos Ilha Cultural Heritage

**Created**: [Date]
**Content Type**: [Heritage Educational Page / Diaspora Connection / Directory Entry]
**Primary Audience**: Cape Verdean Diaspora + Cultural Travelers
**Cultural Priority**: [High/Medium/Low] — [Reason]

---

## Cultural Context & Authenticity
- Brava Island significance: [why this matters to community]
- Community voices to include: [tradition keepers, historians, practitioners]
- Morabeza spirit: [how to embody warmth and hospitality]
- Cultural boundaries: [sacred practices, sensitivity considerations]

## Cultural Verification Checkpoints
- [ ] [Historical claim] — verify with [source type]
- [ ] [Cultural practice] — validate authenticity
- [ ] [Geographic details] — within Brava bounds
- [ ] [Cultural terms] — verified context

## SEO Strategy
- Primary keyword: [keyword] — [volume] — [intent]
- Secondary keywords: [list]
- Cultural term keywords: [list with definitions needed]
- E-E-A-T signals planned: [specific examples]

## Content Outline
### I. Introduction (100-150 words)
[Cultural hook + value proposition + primary keyword]

### II. Cultural Significance (300-400 words)
[Community perspective, living tradition]

### III. Historical Context (400-500 words)
[Verified background, evolution, key figures]

### IV. Contemporary Practice (300-400 words)
[How tradition lives today, practitioners, youth]

### V. Diaspora Connection (200-300 words)
[Global engagement, sodade, participation]

### VI. Conclusion (100-150 words)
[Summary, CTA, morabeza closing]

## Multilingual Notes
- English: [reading level, terms to define]
- Portuguese: [Kriolu integration, dialect notes]
- French: [West African connections, diaspora bridges]

## Schema Markup
[Article/Place/Event/FAQ — specify type and key fields]

## Internal Linking
- [Related heritage content]
- [Related directory entries]
```

Adapt sections based on content type. Directory entries use a shorter structure.

## Schema Markup Examples

### Article Schema (Heritage Pages)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Title — 50-60 chars]",
  "description": "[Meta description — 150-160 chars]",
  "author": {
    "@type": "Organization",
    "name": "Nos Ilha — Brava Island Cultural Heritage Platform"
  },
  "about": {
    "@type": "Thing",
    "name": "[Cultural topic]",
    "description": "[Brief cultural significance]"
  }
}
```

### Place Schema (Directory Entries)
```json
{
  "@context": "https://schema.org",
  "@type": "[Restaurant/Hotel/LandmarksOrHistoricalBuildings]",
  "name": "[Name]",
  "description": "[Cultural description]",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[14.80-14.90]",
    "longitude": "[-24.75 to -24.65]"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[Town]",
    "addressRegion": "Brava",
    "addressCountry": "CV"
  }
}
```

### FAQ Schema (Cultural Term Definitions)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is morabeza?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Cultural definition and context]"
      }
    }
  ]
}
```

## Research Output Template

See `.claude/skills/web-searching/RESEARCH_TEMPLATE.md` for the research document template.

## Verification Report Template

See `references/VERIFICATION.md` for the verification report structure.
