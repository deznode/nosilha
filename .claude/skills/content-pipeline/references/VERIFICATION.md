# Stage 4: Content Verification

## Table of Contents
- [Input](#input)
- [Verification Patterns](#verification-patterns)
- [Confidence Levels](#confidence-levels)
- [Community Consultation Assessment](#community-consultation-assessment)
- [Verification Report Structure](#verification-report-structure)
- [Decision Point](#decision-point)

Verify cultural heritage content for historical accuracy, cultural authenticity, and respectful representation. This stage runs as part of the full pipeline or standalone via `verify <path>`.

## Input

- **Full pipeline**: Read the authored content from Stage 3
- **Verify only**: Read the content at the user-provided file path

## Verification Patterns

Select the appropriate pattern(s) based on content type. Most content needs multiple patterns.

### Pattern 1: Historical Fact Verification
For dates, events, chronological sequences, biographical claims.

1. Research academic sources and government archives
2. Cross-reference timeline across multiple sources
3. Confirm with elder knowledge and community memory
4. Assess Cape Verdean historical context (watch for colonial framing)
5. Document evidence trail with citations
6. Flag claims needing community approval

### Pattern 2: Cultural Practice Authentication
For musical traditions, religious practices, social customs, living traditions.

1. Identify current practitioners and tradition keepers
2. Review historical documentation and ethnographic research
3. Validate with multiple community members across generations
4. Document Brava Island-specific variations
5. Confirm living tradition status (contemporary + historical)
6. Ensure respectful representation serving community interests

### Pattern 3: Bias Detection
For colonial perspectives, tourism exoticism, cultural misrepresentation.

**Colonial Perspective Indicators**:
- "Discovered by Portuguese explorers" → "Inhabited by Cape Verdean communities"
- "Peaceful transition to independence" → "Liberation struggle and resistance movement"
- "Primitive fishing methods" → "Traditional sustainable fishing practices"
- "Benefited from Portuguese education" → "Resilient despite colonial cultural suppression"

**Tourism Exoticism Indicators**:
- "Untouched paradise" → "Living community with contemporary challenges"
- "Simple island life" → "Complex cultural traditions and economic realities"
- "Timeless traditions" → "Living practices evolving within community"
- "Hidden gem" → "Community cultural heritage"

**Community Voice Check**:
- Are Cape Verdean voices directly quoted and centered?
- Are local perspectives given authority over external academic framing?
- Is community agency emphasized in historical narratives?
- Is the diaspora connection treated with emotional authenticity (sodade)?

## Confidence Levels

| Level | Range | Criteria |
|-------|-------|----------|
| HIGH | 90-100% | Multiple independent sources confirm; community validated; no contradictions |
| MEDIUM | 70-89% | Primary sources available but limited corroboration; some contradictions |
| LOW | 50-69% | Single source; community validation not yet obtained; contradictions exist |
| UNVERIFIED | <50% | Insufficient sources; community contradicts claim; do not publish |

## Community Consultation Assessment

For each piece of content, assess whether community consultation is needed:
- **Required**: Content involving sacred practices, family stories, elder knowledge
- **Recommended**: Content about living traditions, contemporary practitioners
- **Optional**: Content based entirely on published academic sources

See `references/CONSULTATION.md` for detailed elder engagement protocols and fair compensation standards.

## Verification Report Structure

Save to `plan/content/{slug}/verification-report.md`:

```markdown
# [Topic] Verification Report

**Date**: [YYYY-MM-DD]
**Content Verified**: [file path or description]
**Verification Type**: [Historical / Cultural Practice / Bias / Multi-Type]

## Executive Summary
[2-3 sentences: overall confidence and key findings]

**Confidence Level**: [HIGH/MEDIUM/LOW/UNVERIFIED] ([XX]%)

### Critical Issues
1. [Issue or "No critical issues identified"]

## Detailed Findings
[Pattern-specific analysis using selected patterns above]

## Bias Analysis
- Colonial perspective: [NONE/MINOR/MODERATE/MAJOR]
- Tourism exoticism: [NONE/MINOR/MODERATE/MAJOR]
- Community voice: [WELL REPRESENTED/ADEQUATE/UNDERREPRESENTED/ABSENT]

## Source Assessment
- Community sources: [count and quality]
- Academic sources: [count and quality]
- Archival sources: [count and quality]
- Gaps: [what's missing]

## Corrections Required
### Critical (must fix)
### Moderate (should fix)
### Minor (can address later)

## Community Consultation Needs
[Required/recommended consultations with rationale]

## Recommendation
**[APPROVED / APPROVED WITH REVISIONS / REQUIRES MAJOR REVISION]**
```

## Decision Point

After presenting the verification report, ask the user:

1. **Revise** — Return to Stage 3 (Author) with specific feedback from the verification report. The author should address all Critical and Moderate corrections.
2. **Accept** — Content is approved. Note any Minor corrections and community consultation needs for future follow-up.

This is a hard stop — do not auto-accept. Wait for the user's explicit decision.
