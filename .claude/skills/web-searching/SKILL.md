---
name: web-searching
description: Conduct web research with multi-source verification for Cape Verdean cultural heritage and general topics. Use this skill whenever the user needs to research anything — historical facts, cultural practices, biographical information, diaspora communities, geographic data, or current events. Trigger on "research", "search for", "find out about", "look up", "investigate", "verify", "fact-check", "what do we know about", or any request requiring web-sourced information. Also invoked by the content-pipeline skill during its Research stage.
---

# Web Research Specialist

Conduct multi-source web research with structured verification, optimized for Cape Verdean cultural heritage topics but applicable to any research need.

## Research Workflow

1. **Clarify** the research question — confirm scope, depth, and what the user needs the research for (this shapes which sources matter most)
2. **Formulate** 3-5 query variations to avoid blind spots from single-phrasing searches
3. **Search broadly** across source types to build an initial picture
4. **Narrow** to the most authoritative and relevant sources
5. **Cross-reference** key facts across 3+ independent sources — cultural heritage claims are especially prone to repetition from a single origin, so trace claims back to their original source
6. **Document** contradictions, consensus, and gaps explicitly
7. **Save** research output and present a summary to the user

## Query Optimization

| Technique | Example | Why It Helps |
|-----------|---------|--------------|
| Exact phrases | `"Nova Sintra settlement history"` | Avoids unrelated matches |
| Negative keywords | `Brava Island -resort -booking` | Filters tourism noise |
| Domain filtering | `site:.edu`, `site:.gov`, `site:.cv` | Targets authoritative sources |
| Timeframe targeting | Limit to specific period | Focuses on relevant era |
| Multiple variations | 3-5 phrasings per question | Catches different source vocabularies |

## Source Prioritization

Academic and government sources carry the most weight because they undergo editorial review. Community sources are essential for cultural authenticity — academic sources alone can miss lived experience and contemporary practice.

| Priority | Source Type | Use For |
|----------|------------|---------|
| 1 | Academic/research (.edu) | Verified facts, scholarly context |
| 2 | Government/official (.gov, .cv) | Statistics, policy, official records |
| 3 | Cultural institutions | Heritage context, community perspective |
| 4 | Community organizations | Lived experience, contemporary practice |
| 5 | News/media | Current events, trends |
| 6 | General reference (Wikipedia) | Baseline orientation only — never cite as sole source |

## Cross-Referencing

Cross-referencing matters because Cape Verdean heritage content often circulates through a small number of sources, creating an illusion of consensus when multiple sites repeat the same claim.

- Verify key facts across 3+ independent sources
- Track contradictions explicitly with source attribution
- Flag single-source claims as needing additional verification
- Note areas of scholarly debate or community disagreement
- Document the evidence trail so research is reproducible

## Output

Save research as markdown in `plan/content/` following the project directory structure. Read `plan/README.md` for directory organization.

### File Naming
- `Brava Island [Topic] Research_.md` for general topics
- `[Person Name] Biography Research_.md` for notable figures
- `[Cultural Practice] Cultural Research_.md` for traditions

See [RESEARCH_TEMPLATE.md](RESEARCH_TEMPLATE.md) for the complete markdown format.

### Summary Report

After saving, present to the user:
- File path where research was saved
- Key findings (3-5 bullet points)
- Source quality assessment (count and types)
- Contradictions or gaps identified
- Recommended follow-up research

## Documentation References

- [EXAMPLES.md](EXAMPLES.md) — Research workflow examples
- [RESEARCH_TEMPLATE.md](RESEARCH_TEMPLATE.md) — Markdown format template
