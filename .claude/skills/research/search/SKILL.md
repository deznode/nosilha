---
name: web-searching
description: Advanced web researcher using search techniques and multi-source verification. Use when user requests research/investigation, cultural/historical information gathering, fact-checking/validation across multiple sources, trend analysis, or mentions 'search', 'find information', 'research topic', or 'verify facts'.
---

# Web Research Specialist

This skill should be used when comprehensive web research is needed, particularly for cultural heritage content, historical information, or multi-source fact verification.

## When to Use This Skill

- User requests cultural or historical research about Cape Verde or Brava Island
- Multi-source fact verification is required
- Deep web search with advanced query techniques needed
- Competitive analysis or trend research requested
- Information synthesis across authoritative sources required

## Focus Areas

This skill specializes in:

- Advanced search query formulation with operators
- Domain-specific searching and filtering for trusted sources
- Result quality evaluation and credibility ranking
- Information synthesis across multiple sources
- Fact verification and cross-referencing
- Historical and trend analysis for cultural content

## Search Strategies

### Query Optimization

To find relevant information efficiently:

1. Use specific phrases in quotes for exact matches
2. Exclude irrelevant terms with negative keywords
3. Target specific timeframes for recent or historical data
4. Formulate 3-5 query variations for comprehensive coverage

### Domain Filtering

To ensure source quality:

1. Use `allowed_domains` parameter for trusted sources (academic institutions, government sites)
2. Use `blocked_domains` to exclude unreliable sites
3. Target specific authoritative sites for cultural heritage content
4. Prioritize academic sources for research topics

### WebFetch Deep Dive

To extract comprehensive information:

1. Extract full content from promising search results
2. Parse structured data from authoritative pages
3. Follow citation trails and reference links
4. Capture data before it changes (archival purposes)

## Research Workflow

Follow this systematic approach:

1. **Understand Objective**: Clarify the research question and scope
2. **Query Formulation**: Create 3-5 query variations for comprehensive coverage
3. **Broad Search**: Search broadly first to identify key sources
4. **Refinement**: Narrow down to most authoritative and relevant sources
5. **Verification**: Cross-reference key facts across multiple sources
6. **Synthesis**: Track contradictions, consensus, and gaps in information

## Output Requirements

Research findings must be delivered in two forms:

### 1. Saved Markdown File

Save comprehensive research as a markdown file in `plan/content/` following these requirements:

**Directory Organization** (read `plan/README.md` first):

- **Historical events, timelines, settlements** → `plan/content/cultural-research/brava-history/`
- **People, biographies, notable figures** → `plan/content/cultural-research/brava-notable-figures/`
- **Source tracking, citation management** → `plan/content/references/`
- **General cultural topics** → `plan/content/cultural-research/` (create subdirectory if needed)

**File Naming**:

- Use descriptive names reflecting research topic
- Use title case with proper capitalization
- Examples: `Brava Island Historical Timeline Research_.md`, `Brava Island Notable Figures Research_.md`
- Always include `.md` extension

**Content Structure**:

See [RESEARCH_TEMPLATE.md](RESEARCH_TEMPLATE.md) for the complete markdown format template.

Include these elements:
- Research methodology and queries used
- Curated findings with source URLs
- Credibility assessment of sources
- Synthesis highlighting key insights
- Contradictions or gaps identified
- Data tables or structured summaries
- Complete "Works cited" section with all sources

### 2. Summary Report

Provide a brief summary to the user including:

- **File path** where research was saved
- **Directory placement reasoning** - Why this location was chosen
- **Key findings summary** - 2-3 bullet points of most important discoveries
- **Source quality assessment** - Brief note on credibility and coverage
- **Recommendations for further research** - Gaps or follow-up topics identified

## Best Practices

- Focus on actionable insights
- Always provide direct quotes for important claims in saved markdown
- Cross-reference facts across 3+ sources when possible
- Document search methodology for reproducibility
- Assess source credibility (academic, government, community sources prioritized)
- Track contradictions and note areas of uncertainty
