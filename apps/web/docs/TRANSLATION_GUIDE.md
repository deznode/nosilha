# Translation Guide for Nos Ilha

This guide explains how to translate articles and pages into Portuguese (PT), Kabuverdianu (KEA), and French (FR) to make Brava Island's cultural heritage accessible to diverse audiences.

## Table of Contents

- [Supported Languages](#supported-languages)
- [Translation File Structure](#translation-file-structure)
- [Translation Workflow](#translation-workflow)
- [Using Translation Tools](#using-translation-tools)
- [Tracking Translation Status](#tracking-translation-status)
- [Cultural Adaptation](#cultural-adaptation)
- [Quality Guidelines](#quality-guidelines)
- [Common Issues](#common-issues)

## Supported Languages

Nos Ilha supports four languages with intelligent fallback:

| Language         | Code  | Use Case                                           | Priority     |
| ---------------- | ----- | -------------------------------------------------- | ------------ |
| **English**      | `en`  | Primary language, international audience           | 1 (Required) |
| **Portuguese**   | `pt`  | Cape Verdean official language, Lusophone diaspora | 2 (High)     |
| **Kabuverdianu** | `kea` | Cape Verdean Creole, local community               | 3 (Medium)   |
| **French**       | `fr`  | West African francophone audience                  | 4 (Low)      |

### Language Fallback Chain

When a translation is unavailable, the system uses this fallback order:

```
User requests Portuguese (pt) → Check pt → Check en → 404
User requests Kabuverdianu (kea) → Check kea → Check pt → Check en → 404
User requests French (fr) → Check fr → Check pt → Check en → 404
```

**Key Point**: English (`en`) is the base language. All content must have an English version before adding translations.

## Translation File Structure

Translations are **co-located** with the original content in the same directory:

### Content Structure

```
content/pages/history/brava-migration/
├── en.mdx          # English (original)
├── pt.mdx          # Portuguese translation
├── kea.mdx         # Kabuverdianu translation
└── fr.mdx          # French translation (optional)
```

**All translations share the same URL structure**:

- `/history/brava-migration` (auto-detects language)
- `/history/brava-migration?lang=pt` (explicit Portuguese)
- `/history/brava-migration?lang=kea` (explicit Kabuverdianu)

## Translation Workflow

### Step 1: Choose Content to Translate

**Priority Order**:

1. **High-priority pages**: `/history`, `/people`, `/culture` (main sections)
2. **Popular articles**: Check analytics for most-viewed content
3. **Recent articles**: New content published in last 30 days
4. **Historical archives**: Older content with cultural significance

**Check translation status**:

```bash
pnpm run check:translations
```

This shows which articles need translations and which are outdated.

### Step 2: Create Translation File

**Manual Method**:

```bash
# Copy the English file as a starting point
cp content/pages/history/brava-migration/en.mdx \
   content/pages/history/brava-migration/pt.mdx
```

**Using Scaffolding Tool** (for new articles):

```bash
pnpm run scaffold:article
# Select language: pt
# Follow prompts
```

### Step 3: Translate Frontmatter

Open the translation file and update the frontmatter:

```yaml
---
title: "A Grande Migração de Brava" # Translated title
description: "Como os ilhéus de Brava moldaram a história marítima da Nova Inglaterra" # Translated
author: "Maria Silva" # Keep same (or add translator)
publishDate: "2025-01-24" # Keep same
category: "history" # NEVER translate
tags: ["migração", "baleação", "diáspora"] # Translate tags
language: "pt" # CHANGE to target language
---
```

**Critical Rules**:

- `language`: **MUST** match the file's target language (`pt`, `kea`, `fr`)
- `category`: **NEVER** translate (must stay `history`, `music`, `people`, `traditions`, or `places`)
- `publishDate`: Keep the same as original
- `updatedDate`: Add when you update a translation
- `tags`: Translate to target language

### Step 4: Translate Content

Translate the main content while preserving:

- Component structure
- Markdown formatting
- Component props (don't translate prop names)

**Example**:

**English Original**:

```mdx
<Section variant="card">

## The Great Migration

In 1680, a volcanic eruption on Fogo Island forced thousands to flee...

<CalloutBox title="Historical Context" variant="ocean-valley">

The eruption lasted three months and destroyed entire villages.

</CalloutBox>

</Section>
```

**Portuguese Translation**:

```mdx
<Section variant="card">

## A Grande Migração

Em 1680, uma erupção vulcânica na Ilha do Fogo forçou milhares a fugir...

<CalloutBox title="Contexto Histórico" variant="ocean-valley">

A erupção durou três meses e destruiu aldeias inteiras.

</CalloutBox>

</Section>
```

**What to Translate**:

- ✅ Heading text
- ✅ Paragraph text
- ✅ Component content (inside tags)
- ✅ `title` props in components
- ✅ Alt text for images

**What NOT to Translate**:

- ❌ Component names (`Section`, `CalloutBox`)
- ❌ Prop names (`variant`, `title`)
- ❌ Prop values for styling (`"card"`, `"ocean-valley"`)
- ❌ File paths (`/images/history/photo.jpg`)
- ❌ URLs

### Step 5: Handle Structured Data

For data-driven components (timelines, figures), translate the data in frontmatter:

**English**:

```yaml
timeline:
  - date: "1680"
    title: "The Great Migration"
    description: "Fogo eruption forces settlement of Brava"
  - date: "1843"
    title: "Whaling Era Begins"
    description: "First Bravense sailors join whaling ships"
```

**Portuguese**:

```yaml
timeline:
  - date: "1680"
    title: "A Grande Migração"
    description: "Erupção do Fogo força assentamento em Brava"
  - date: "1843"
    title: "Era da Baleação Começa"
    description: "Primeiros marinheiros bravenses juntam-se a navios baleeiros"
```

**Keep the same**:

- Field names (`date`, `title`, `description`)
- Dates and numbers
- Image paths (`imageSrc`)
- Structure and order

### Step 6: Validate Translation

```bash
# Validate frontmatter and structure
pnpm run validate:content

# Check for common issues
pnpm run check:translations
```

### Step 7: Preview Translation

```bash
# Start dev server
pnpm run dev

# Open with language parameter
open http://localhost:3000/history/brava-migration?lang=pt
```

**Test the language switcher**: Verify you can switch between EN ↔ PT ↔ KEA

### Step 8: Submit Translation

```bash
git add content/pages/history/brava-migration/pt.mdx
git commit -m "docs(i18n): add Portuguese translation for Brava migration article"
git push origin feature/translation-pt-brava-migration
```

## Using Translation Tools

### Check Translation Status

See which articles need translations:

```bash
pnpm run check:translations
```

**Output**:

```
Translation Status Report
========================

Total Articles: 42
Fully Translated (all languages): 12 (29%)
Partially Translated: 18 (43%)
English Only: 12 (29%)

Missing Translations:
- /history/brava-migration: Missing PT, KEA
- /music/morna-origins: Missing KEA, FR
- /people: Missing PT, KEA

Outdated Translations (source updated):
- /history/whaling-era: PT translation is 5 days old
```

### Validate Content

Ensure your translation follows schema rules:

```bash
pnpm run validate:content

# Or validate specific file
pnpm run validate:content content/pages/history/brava-migration/pt.mdx
```

### Build and Test

Test how translations work in production build:

```bash
# Build with all translations
pnpm run build

# Start production server
pnpm run start

# Test language detection
open http://localhost:3000/history/brava-migration
```

## Tracking Translation Status

### In Admin Dashboard

Navigate to `/admin/translations` (requires admin access) to see:

- **Translation Coverage**: Percentage of content translated per language
- **Outdated Translations**: Articles where EN version updated after translation
- **Missing Translations**: Priority articles without translations
- **Translation Activity**: Recent translation submissions

### In CI/CD Pipeline

Every pull request shows:

- Translation coverage change
- New translations added
- Outdated translations detected

## Cultural Adaptation

Translating cultural heritage content requires more than literal translation. Consider:

### 1. Cultural Context

**Don't**: Literal word-for-word translation
**Do**: Adapt idioms and cultural references

**Example**:

- EN: "Home of the blues of Cape Verde"
- PT (literal): "Lar dos blues de Cabo Verde" ❌
- PT (adapted): "Berço da morna cabo-verdiana" ✅

### 2. Local Terminology

Use terms familiar to the target audience:

**Kabuverdianu (KEA)**:

- Prefer KEA words over Portuguese loanwords when available
- Use Santiago variant for maximum comprehension
- Include Portuguese cognates in parentheses for clarity

**Portuguese (PT)**:

- Use European Portuguese for official content
- Use Brazilian Portuguese for diaspora-focused content
- Be consistent within a single article

### 3. Historical Names

Preserve historical accuracy:

**Example**:

- EN: "Fogo Island" → PT: "Ilha do Fogo" (translate)
- EN: "Nova Sintra" → PT: "Nova Sintra" (keep original)
- EN: "Eugénio Tavares" → PT: "Eugénio Tavares" (keep original)

### 4. Measurements and Units

Convert or provide both:

**Example**:

- EN: "62.5 square kilometers"
- PT: "62,5 quilómetros quadrados"
- KEA: "62,5 kilometru kuadradu"

### 5. Dates and Numbers

Follow locale conventions:

**Example**:

- EN: "January 24, 2025"
- PT: "24 de janeiro de 2025"
- FR: "24 janvier 2025"

### 6. Tone and Voice

Maintain **morabeza** (warmth and hospitality) in all languages:

**Don't**: Clinical, academic tone
**Do**: Warm, inviting, personal tone

## Quality Guidelines

### Translation Checklist

Before submitting a translation, verify:

- [ ] Frontmatter `language` field matches filename
- [ ] All headings translated
- [ ] All paragraph text translated
- [ ] Component content translated (not component names)
- [ ] Alt text on images translated
- [ ] Structured data in frontmatter translated
- [ ] Cultural references adapted appropriately
- [ ] No broken links (all internal links resolve)
- [ ] No untranslated English fragments
- [ ] Validation passes (`pnpm run validate:content`)
- [ ] Preview looks correct in browser
- [ ] Language switcher works

### Translation Best Practices

1. **Consistency**: Use the same terms throughout
   - Create a glossary for recurring terms
   - Use consistent translation for place names

2. **Readability**: Write naturally in target language
   - Don't force English sentence structure
   - Use target language idioms

3. **Accuracy**: Verify historical facts
   - Don't translate dates or numbers incorrectly
   - Preserve proper nouns correctly

4. **Completeness**: Translate everything visible
   - Don't leave English fragments
   - Translate image captions and alt text

5. **Cultural Sensitivity**: Respect local perspectives
   - Consult native speakers when unsure
   - Avoid imposing external cultural frames

## Common Issues

### Issue: Validation Error "Language mismatch"

**Error**: "Frontmatter language 'en' doesn't match filename language 'pt'"

**Solution**: Update `language` field in frontmatter:

```yaml
language: "pt" # Must match pt.mdx filename
```

### Issue: Translation Shows English Content

**Problem**: Viewing `/history/brava-migration?lang=pt` shows English

**Causes**:

1. Translation file not in correct location
2. Build didn't pick up new translation
3. Language field incorrect in frontmatter

**Solution**:

```bash
# Rebuild to process new translation
pnpm run build

# Restart dev server
pnpm run dev
```

### Issue: Language Switcher Missing Translation

**Problem**: Language switcher doesn't show PT option

**Cause**: Translation not detected by build system

**Solution**:

1. Verify file is named correctly (`pt.mdx` not `pt.md`)
2. Ensure file is in same directory as `en.mdx`
3. Rebuild: `pnpm run build`

### Issue: Broken Links in Translation

**Problem**: Internal links don't work in translated version

**Cause**: Linked article doesn't have translation

**Solutions**:

**Option 1 - Link to English fallback**:

```mdx
Read more about [whaling history](/history/whaling-era?lang=en)
```

**Option 2 - Remove language parameter (auto-detect)**:

```mdx
Read more about [whaling history](/history/whaling-era)
```

System will show English if PT translation doesn't exist.

**Option 3 - Translate linked article first**:

```bash
# Create translation for linked article
cp content/pages/history/whaling-era/en.mdx \
   content/pages/history/whaling-era/pt.mdx
```

### Issue: Outdated Translation Warning

**Problem**: Admin dashboard shows "PT translation is 5 days old"

**Cause**: English version updated after translation was created

**Solution**:

1. Compare EN and PT versions to see what changed
2. Update PT translation with new content
3. Update `updatedDate` in PT frontmatter:

```yaml
updatedDate: "2025-01-24"
```

## Translation Resources

### Glossaries

Create project-specific glossaries for consistency:

**Example: `docs/glossary-pt.md`**

```markdown
# Portuguese Glossary

| English      | Portuguese | Notes                        |
| ------------ | ---------- | ---------------------------- |
| Brava Island | Ilha Brava | Official name                |
| morna        | morna      | Music genre (no translation) |
| whaling      | baleação   | Historical context           |
| diaspora     | diáspora   | Cape Verdean diaspora        |
```

### Language Tools

**Portuguese (PT)**:

- [Priberam](https://priberam.pt/) - Portuguese dictionary
- [Infopédia](https://www.infopedia.pt/) - Portuguese encyclopedia
- [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org/) - Official orthography

**Kabuverdianu (KEA)**:

- [ALUPEC](https://www.omniglot.com/writing/capeverdean.htm) - Official orthography
- Consult native speakers for dialect verification

**French (FR)**:

- [Larousse](https://www.larousse.fr/) - French dictionary
- [Le Robert](https://dictionnaire.lerobert.com/) - French reference

### Community

- **Nos Ilha Translators**: Join our translation community on GitHub Discussions
- **Cape Verdean Linguists**: Consult with university experts for KEA translation
- **Diaspora Communities**: Engage Boston/New Bedford/Rhode Island communities for feedback

## Need Help?

- **Main Contributor Guide**: [`docs/CONTRIBUTING_CONTENT.md`](./CONTRIBUTING_CONTENT.md)
- **Component Reference**: [`docs/MDX_COMPONENTS.md`](./MDX_COMPONENTS.md)
- **Quick Reference**: [`docs/MDX_QUICK_REFERENCE.md`](./MDX_QUICK_REFERENCE.md)
- **GitHub Discussions**: Ask translation questions in our community forum

---

**Obrigado! Obrigadu! Merci!** Your translation work makes Brava Island's cultural heritage accessible to the global Cape Verdean community and beyond.
