# Stage 3: Content Authoring

## Table of Contents
- [Input](#input)
- [Mandatory Cultural Standards](#mandatory-cultural-standards)
- [Voice Guidelines](#voice-guidelines)
- [SEO Integration](#seo-integration)
- [Content Formatting](#content-formatting)
- [Multilingual Adaptation](#multilingual-adaptation)
- [Schema Markup](#schema-markup)
- [Output](#output)
- [Checkpoint](#checkpoint)

Write culturally authentic content for Nos Ilha, combining Cape Verdean heritage with SEO optimization.

## Input

Read `plan/content/{slug}/content-plan.md` from Stage 2. Follow the outline, SEO strategy, and cultural requirements specified in the plan.

## Mandatory Cultural Standards

### Morabeza Spirit
Express genuine Cape Verdean hospitality without stereotypical tourism language. Write from residents' lived experiences, not an external observer perspective. Show culture as dynamic and contemporary, not a frozen historical artifact.

### Community Voice
- Write from the community perspective: "The Santos family has preserved Brava Island's culinary heritage..."
- Include direct quotes and specific community members when possible
- Emphasize community agency, not passive "discovery" by outsiders

### Cultural Terms
Consult `references/GLOSSARY.md` for Cape Verdean terminology. On first use, integrate terms naturally with brief explanations:
- *Morabeza* — Cape Verdean spirit of hospitality and warmth
- *Sodade* — deep longing connecting diaspora to homeland
- *Cachupa* — national dish, a cultural cornerstone
- *Morna* — traditional music genre expressing sodade
- *Kriolu* — Cape Verdean Creole language

### Geographic Validation
All coordinates must fall within Brava Island bounds: lat 14.80-14.90, lng -24.75 to -24.65.

## Voice Guidelines

### Write Like This
- "For three decades, the Santos family has preserved Brava Island's culinary heritage"
- "Each bowl of cachupa tells a family story spanning generations"
- "We don't just preserve morna — we live it" (community voice)

### Never Write Like This
- "This charming little restaurant..." (tourism cliché)
- "Exotic flavors of Cape Verde..." (othering language)
- "Time seems to stand still..." (frozen artifact framing)
- "Visitors will be delighted to discover..." (external observer)
- "The locals are friendly and welcoming..." (condescending)

## SEO Integration

Follow the SEO strategy from the content plan. Key rules:
- Primary keyword in first 100 words, naturally integrated
- Semantic keyword variations distributed at 0.5-1.5% density
- H2/H3 headings include relevant keywords
- E-E-A-T signals: experience quotes, expert references, data citations, community validation
- Never compromise cultural authenticity for keyword density

Consult `references/SEO_KEYWORDS.md` for diaspora discovery keyword patterns.

## Content Formatting

| Element | Guideline |
|---------|-----------|
| Headings | H2/H3 for logical organization |
| Paragraphs | Short (2-3 sentences) for scannability |
| Lists | Bullet points where appropriate |
| Reading Level | 8th-10th grade |
| Cultural Terms | Define on first use, italicize |

## Multilingual Adaptation

If the content plan includes multilingual requirements:

### English (Primary)
- 8th-10th grade reading level
- Define all cultural terms for international audience
- Include pronunciation guides for Kriolu terms

### Portuguese Adaptation
- Integrate Kriolu naturally with Cape Verdean dialect awareness
- Emphasize homeland perspective more strongly
- Adapt cultural context for Portuguese-speaking audience familiarity

### French Adaptation
- Emphasize West African cultural connections
- Bridge to francophone diaspora experience
- Adapt context for French-speaking audience background

## Schema Markup

Include appropriate schema markup per content type:
- **Heritage pages**: Article schema with cultural metadata
- **Directory entries**: Restaurant/Hotel/Place schema with geo coordinates
- **Events**: Event schema with cultural significance
- **Cultural terms**: FAQ schema for definitions

See `references/TEMPLATES.md` for schema markup examples.

## Output

Write content to its destination path. For heritage pages: `apps/web/content/`. For directory entries: follow existing directory structure.

## Checkpoint

Present the authored draft to user:
- Full content rendered
- Word count and structure summary
- SEO integration notes (keyword placement, E-E-A-T signals)
- Cultural terms used and defined
- Any areas where cultural verification is especially important

Wait for user confirmation before proceeding to Stage 4 (Verify).
