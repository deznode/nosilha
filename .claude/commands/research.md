---
description: Research cultural and historical topics with comprehensive web search, saving markdown reports to plan/content/
argument-hint: <research-topic>
---

# Research Command

A powerful slash command that conducts comprehensive cultural and historical research using the search-specialist agent, automatically saving findings as structured markdown in the `plan/content/` directory.

## Usage

```bash
/research <research-topic>
```

### Examples

```bash
/research Brava Island volcanic geology and formation history

/research Cape Verdean emigration patterns to New England 1900-1920

/research Eugénio Tavares poetry and the evolution of morna music

/research Traditional Cape Verdean fishing practices on Brava Island

/research Portuguese colonial administration in Cape Verde 1800s
```

## What It Does

The `/research` command integrates with the **search-specialist** agent to:

1. **Conduct multi-source web research** using available search tools and capabilities
2. **Synthesize findings** from academic sources, historical records, and authoritative websites
3. **Verify facts** across multiple sources to ensure accuracy
4. **Structure content** with proper citations, chronological tables, and detailed narratives
5. **Save automatically** to the appropriate `plan/content/` subdirectory
6. **Report results** with file path, key findings, and recommendations for further research

## Output Location

Research findings are saved to `plan/content/` based on topic classification:

| Topic Type | Directory | Example |
|------------|-----------|---------|
| Historical events, timelines, settlements | `content/cultural-research/brava-history/` | Brava Island Settlement 1680 Migration Research.md |
| People, biographies, cultural figures | `content/cultural-research/brava-notable-figures/` | Eugénio Tavares Biography and Morna Legacy.md |
| General cultural topics | `content/cultural-research/` | Traditional Cape Verdean Fishing Practices.md |
| Source tracking and citations | `content/references/` | Cape Verde Historical Sources Tracker.md |

The search-specialist agent automatically determines the most appropriate location based on research content.

## Workflow

When you run `/research`, the following happens:

1. **Launch search-specialist agent** with your research topic
2. **Agent conducts research**:
   - Formulates 3-5 optimized search queries
   - Uses available web search tools to find authoritative sources (academic, historical, cultural)
   - Extracts and verifies information across multiple sources
   - Identifies contradictions and consensus
3. **Agent structures findings**:
   - Creates comprehensive markdown document
   - Includes chronological tables for timeline-based research
   - Adds proper citations with "Works cited" section
   - Uses clear H1/H2/H3 heading hierarchy
4. **Agent saves output**:
   - Determines appropriate `plan/content/` subdirectory
   - Uses descriptive filename following existing patterns
   - Writes complete markdown file
5. **Agent reports back**:
   - File path where research was saved
   - Directory placement reasoning
   - 2-3 key findings summary
   - Source quality assessment
   - Recommendations for further research

## Research Quality

The search-specialist agent ensures:

- **Multi-source verification** - Facts confirmed across multiple authoritative sources
- **Credibility assessment** - Sources evaluated for reliability and academic rigor
- **Citation tracking** - All claims linked to specific sources with inline citations
- **Gap identification** - Notes areas requiring further research or contradictory information
- **Historical accuracy** - Dates, names, and events cross-referenced for accuracy

## Output Format

Saved markdown files follow this structure:

```markdown
# Research Topic Title

## Introduction/Overview
Brief context and scope of research

## Chronological Timeline (for historical topics)
| Date/Period | Event | Significance |
|-------------|-------|--------------|
| ... | ... | ... |

## Main Content Sections
Detailed narrative with proper headings

## Key Findings
Summary of most important discoveries

## Works Cited
1. Source name - URL
2. Source name - URL
...
```

## Implementation

Use the Task tool to launch the search-specialist agent for comprehensive cultural and historical research on this topic:

**$ARGUMENTS**

The search-specialist agent will:

1. **Formulate search queries** - Create 3-5 optimized queries using advanced search operators
2. **Conduct web research** - Use available search tools to find authoritative sources:
   - Academic journals and historical records
   - Cultural heritage organizations and museums
   - Government archives and official documents
   - Reputable news and media sources
3. **Verify information** - Cross-reference facts across multiple sources to ensure accuracy
4. **Structure findings** - Create comprehensive markdown following the format specified in `.claude/agents/search-specialist.md`:
   - Clear H1 title
   - Chronological tables for timeline-based research
   - Structured H2/H3 sections for logical organization
   - Inline citations with superscript numbers
   - Complete "Works cited" section with all source URLs
5. **Determine output location** - Classify research to place in the appropriate `plan/content/` subdirectory:
   - Historical events/timelines → `content/cultural-research/brava-history/`
   - People/biographies → `content/cultural-research/brava-notable-figures/`
   - Source tracking → `content/references/`
   - General cultural topics → `content/cultural-research/`
6. **Save markdown file** - Write research to the determined location with descriptive filename
7. **Provide summary report** - Return brief summary including:
   - File path where research was saved
   - Directory placement reasoning
   - 2-3 key findings
   - Source quality assessment
   - Recommendations for further research

**Focus**: Cultural and historical topics relevant to Nos Ilha cultural heritage platform, particularly Brava Island, Cape Verde, emigration history, cultural figures, and traditional practices.

**Task Parameters**:
- subagent_type: `general-purpose`
- description: "Research cultural/historical topic: $ARGUMENTS"

## Guidelines for Effective Research Topics

**Good topics** (specific, focused):
- "Brava Island volcanic formation and geological history"
- "Cape Verdean whaling industry connections to New England 1800s"
- "Eugénio Tavares' influence on morna music evolution"

**Too broad** (refine these):
- "Cape Verde history" → Add specific time period or aspect
- "Brava Island" → Focus on geography, culture, history, etc.
- "Migration" → Specify origin, destination, time period

**Tips**:
- Include time periods for historical research
- Specify geographic locations when relevant
- Name specific people, events, or cultural practices
- Combine related topics for comprehensive coverage

## Notes

- Research files are saved with descriptive names following existing patterns
- All sources are tracked in "Works cited" section with full URLs
- The agent determines optimal subdirectory based on content classification
- Files use standard markdown format compatible with documentation systems
- Citations use inline superscript numbers linking to Works cited section

## Examples of Saved Research

Existing research files in `plan/content/cultural-research/`:

```
brava-history/
├── Brava Island Historical Timeline Research_.md
├── Brava Island Settlement Research_.md

brava-notable-figures/
├── Brava Island Notable Figures Research_.md
├── Brava Island Cultural Heritage Research_.md
```

Your new research will follow these same high-quality standards.
