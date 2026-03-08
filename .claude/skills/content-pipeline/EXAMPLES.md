# Content Pipeline Examples

## Example 1: Heritage Educational Page (Full Pipeline)

**User**: "Create content about morna music and Brava Island's musical heritage"

### Stage 1: Research
- Slug: `morna-music-brava-heritage`
- Created: `plan/content/morna-music-brava-heritage/research.md`
- Key findings: UNESCO recognition, Eugenio Tavares legacy, contemporary practitioners
- Sources: 4 academic, 2 government, 3 community, 1 diaspora
- Gaps: Need elder testimony on pre-Tavares morna traditions

### Stage 2: Plan
- Content type: Heritage Educational Page (1,800 words)
- Primary keyword: "morna music Cape Verde" (500/mo, informational)
- E-E-A-T: Local musician quotes, UNESCO citation, elder validation
- Outline:
  1. Introduction (150 words): Hook with morna's emotional power
  2. Cultural Significance (400 words): Community role, sodade expression
  3. Historical Context (500 words): Eugenio Tavares legacy, evolution
  4. Contemporary Practice (400 words): Today's musicians, festivals
  5. Diaspora Connection (250 words): Morna in diaspora communities
  6. Conclusion (100 words): Cultural invitation, morabeza closing
- Verification checkpoints: Tavares birth/death dates, "Hora di Bai" composition, UNESCO year

### Stage 3: Author
- Draft written to `apps/web/content/heritage/morna-music-brava.mdx`
- Word count: 1,780 words
- Cultural terms defined: morabeza, sodade, morna, Kriolu
- E-E-A-T signals: 3 community quotes, 2 academic citations, UNESCO reference

### Stage 4: Verify
- Confidence: HIGH (92%)
- Bias: No colonial perspective or exoticism detected
- Community voice: Well represented with practitioner quotes
- Corrections: 1 Minor (clarify Tavares composition date range)
- Recommendation: APPROVED WITH MINOR REVISION
- User decision: Accept (minor correction noted for follow-up)

---

## Example 2: Directory Entry (Full Pipeline)

**User**: "Write a directory entry for Casa da Morabeza restaurant in Nova Sintra"

### Stages 1-2: Abbreviated
- Slug: `casa-da-morabeza`
- Content type: Directory Entry (500 words)
- Research focused on restaurant history, owner family, signature dishes
- Plan: Short-form structure with cultural context

### Stage 3: Author

> **Casa da Morabeza — Traditional Cape Verdean Restaurant in Nova Sintra**
>
> *For three decades, the Santos family has preserved Brava Island's culinary heritage in Nova Sintra, where their table welcomes visitors with authentic morabeza hospitality.*
>
> At Casa da Morabeza, each bowl of cachupa tells a family story spanning generations. Dona Maria Santos, born and raised in Nova Sintra, daily prepares Cape Verde's national dish using beans from Brava's highland farms and smoked linguica made with her grandmother's traditional methods...

### Stage 4: Verify
- Confidence: MEDIUM (78%) — family details need community confirmation
- Recommendation: APPROVED WITH REVISIONS (confirm family history details)

---

## Example 3: Verify Only Mode

**User**: "Verify the content at apps/web/content/heritage/fishing-traditions.mdx"

### Stage 4 Only
- Read content at provided path
- Applied patterns: Cultural Practice Authentication + Bias Detection
- Findings:
  - Historical claims: 3 verified, 1 needs additional source
  - Cultural practice: Contemporary fishing methods accurately described
  - Bias: Minor — one instance of "primitive methods" phrasing detected
  - Community voice: Adequately represented but could include more women's perspectives
- Corrections: 1 Moderate (replace "primitive methods" with "traditional methods"), 1 Minor (add women's fish processing perspective)
- Recommendation: APPROVED WITH REVISIONS
- User decision: Revise → Author addresses both corrections → Re-verify → Accept

---

## Example 4: Diaspora Connection Content

**User**: "Plan content about family heritage discovery for diaspora visitors to Brava"

### Pipeline runs with diaspora-focused emphasis
- Slug: `diaspora-family-heritage-visit`
- Content type: Diaspora Connection (1,500 words)
- SEO focus: "Cape Verde ancestry", "Brava Island genealogy"
- Outline emphasizes:
  - Emotional preparation for homecoming (sodade)
  - Finding family connections on Brava
  - Cultural etiquette (morabeza expectations)
  - Practical guidance for heritage visits
- Verification checkpoints: genealogy resource availability, community privacy, family connection protocols
