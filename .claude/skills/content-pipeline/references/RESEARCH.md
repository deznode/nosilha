# Stage 1: Cultural Heritage Research

Research instructions specific to Cape Verdean cultural heritage content. For general web research mechanics, follow `.claude/skills/web-searching/SKILL.md`.

## Cape Verdean Research Constraints

Apply these domain rules on top of the web-searching workflow:

### Source Priority (highest to lowest)
1. **Community knowledge** — Elder testimonies, practitioner interviews, family archives
2. **Cape Verdean government/cultural institutions** — National Archives, cultural centers, UNESCO
3. **Cape Verdean academic scholarship** — Prioritize Cape Verdean scholars over external observers
4. **Diaspora community sources** — Boston CV Historical Society, New Bedford organizations, Lisbon/Rotterdam groups
5. **International academic sources** — Musicology, anthropology, history (use critically for colonial bias)
6. **General reference** — Wikipedia as baseline, never as sole source

### Query Strategy for Cultural Topics

Formulate 3-5 query variations per topic:
- Geographic + cultural: "Brava Island [topic]", "Cape Verde [cultural element]"
- Kriolu/Portuguese terms: Include original-language terms alongside English
- Diaspora perspective: "Cape Verdean diaspora [topic]", "Cape Verdean community [location]"
- Historical: "history of [practice] Cape Verde", "[figure name] Brava"

### Domain Filtering
- **Prioritize**: `.cv` (Cape Verde), `.edu`, `.gov`, UNESCO, academic databases
- **Include**: Cape Verdean diaspora organization websites, cultural center sites
- **Use critically**: Tourism sites (check for exoticism), general news (check for colonial framing)
- **Avoid**: Sites with no attribution, content farms, sites using othering language

### Cross-Referencing Requirements
- Verify key facts across 3+ independent sources
- Track contradictions explicitly — note which sources disagree and why
- Flag single-source claims with a warning for verification in Stage 4
- Document the evidence trail for every historical claim

### Cultural Sensitivity During Research
- Note any content that may involve sacred practices or private cultural knowledge
- Flag topics requiring community consultation before publication
- Identify potential colonial bias in source framing
- Record which claims need elder validation vs. archival confirmation

## Research Output Format

Save to `plan/content/{slug}/research.md` using this structure:

```markdown
# [Topic] — Cultural Heritage Research

## Research Methodology
- Queries used (list all variations)
- Sources consulted (count by type: community, academic, archival, diaspora)
- Date range searched

## Key Findings
[Narrative synthesis with inline citations using superscript numbers]

### [Section 1]
[Findings with direct quotes for important claims]

### [Section 2]
[Continue as needed]

## Timeline (if applicable)
| Year | Event | Source |
|------|-------|--------|

## Credibility Assessment
- Verified facts (3+ sources)
- Single-source claims (needs verification)
- Contradictions found

## Gaps and Follow-Up
- Areas requiring deeper investigation
- Community consultations needed
- Diaspora perspectives to gather

## Works Cited
1. [Full citation with URL]
2. [Continue numbered]
```

## Checkpoint

After completing research, present to user:
- File path where research was saved
- 3-5 key findings summary
- Source quality assessment (how many sources, types, credibility)
- Gaps identified and recommended follow-up
- Any cultural sensitivity flags

Wait for user confirmation before proceeding to Stage 2 (Plan).
