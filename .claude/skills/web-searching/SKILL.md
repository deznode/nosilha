---
name: web-searching
description: Advanced web researcher using search techniques and multi-source verification. Use when user requests research/investigation, cultural/historical information gathering, fact-checking/validation across multiple sources, trend analysis, or mentions 'search', 'find information', 'research topic', or 'verify facts'.
---

# Web Research Specialist

Conducts comprehensive web research for cultural heritage content, historical information, and multi-source fact verification.

## When to Use

- Cultural or historical research about Cape Verde or Brava Island
- Multi-source fact verification and cross-referencing
- Deep web search with advanced query techniques
- Information synthesis across authoritative sources

## Research Approaches

| Approach | Techniques |
|----------|------------|
| Query Optimization | Exact phrases in quotes, negative keywords, timeframe targeting, 3-5 query variations |
| Domain Filtering | `allowed_domains` for trusted sources, `blocked_domains` for unreliable sites, prioritize academic/government |
| Content Extraction | WebFetch for full content, parse structured data, follow citation trails, archival capture |

## Research Workflow

1. Clarify research question and scope
2. Create 3-5 query variations for comprehensive coverage
3. Search broadly first to identify key sources
4. Narrow to most authoritative and relevant sources
5. Cross-reference key facts across multiple sources
6. Track contradictions, consensus, and gaps

## Output Requirements

Save research as markdown in `plan/content/` following directory structure.

See [references/research-output.md](references/research-output.md) for:
- Directory organization and file naming
- Content structure requirements
- Summary report format

See [RESEARCH_TEMPLATE.md](RESEARCH_TEMPLATE.md) for complete markdown template.

## Documentation References

**Skill docs**:
- [EXAMPLES.md](EXAMPLES.md) - Research workflow examples
- [RESEARCH_TEMPLATE.md](RESEARCH_TEMPLATE.md) - Markdown format template
- [references/research-output.md](references/research-output.md) - Output requirements

## Best Practices

1. Focus on actionable insights over exhaustive data
2. Provide direct quotes for important claims
3. Cross-reference facts across 3+ sources when possible
4. Document search methodology for reproducibility
5. Prioritize academic, government, and community sources
6. Track contradictions and note areas of uncertainty
