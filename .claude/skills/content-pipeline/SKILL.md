---
name: content-pipeline
description: Orchestrate end-to-end cultural heritage content creation through a Research, Plan, Author, Verify pipeline for Brava Island and Cape Verdean topics. Use this skill whenever the user wants to create any content for the Nos Ilha platform — heritage pages, directory entries, diaspora stories, cultural practice articles, or historical content. Trigger on "create content", "write about", "draft an article", "content pipeline", "plan content", "author article", "new heritage page", "add directory entry", or any request to produce cultural content. Also supports standalone verification via "verify content", "check accuracy", or "validate content" with a file path argument.
---

# Cultural Heritage Content Pipeline

Coordinate end-to-end content creation for Nos Ilha, from research through publication-ready verified content.

## Mode Detection

Detect the appropriate mode from user input. This matters because users often return to in-progress content, and picking up where they left off saves significant rework.

### Full Pipeline (default)
Trigger: "create content about...", "write about...", "plan content for..."
Flow: Research → Plan → Author → Verify → User Decision

### Resume Pipeline
Trigger: User provides a topic/slug that already has artifacts in `plan/content/{slug}/`
Detection: Check for existing files in `plan/content/{slug}/`:
- `research.md` exists → Research complete, resume from Stage 2
- `content-plan.md` exists → Planning complete, resume from Stage 3
- `verification-report.md` exists → Previous verification exists, ask user intent

On resume, present what was found and ask which stage to continue from.

### Verify Only
Trigger: "verify...", "check accuracy...", argument starts with a file path
Flow: Read target content → Verify → Report → User Decision

For verify-only mode, skip to Stage 4 and read `references/VERIFICATION.md`.

---

## Full Pipeline

### Stage 1: Research
1. Read `.claude/skills/web-searching/SKILL.md` for research execution
2. Read `references/RESEARCH.md` for Cape Verdean cultural research constraints
3. Save findings to `plan/content/{slug}/research.md`
4. **Checkpoint**: Summarize key findings. Confirm with user before proceeding.

### Stage 2: Plan
1. Read `references/PLANNING.md` for content planning instructions
2. Input: `plan/content/{slug}/research.md`
3. Save plan to `plan/content/{slug}/content-plan.md`
4. **Checkpoint**: Present outline and structure. Confirm with user before proceeding.

### Stage 3: Author
1. Read `references/AUTHORING.md` for writing instructions and cultural voice
2. Input: `plan/content/{slug}/content-plan.md`
3. Write content to its destination (MDX page, directory entry, or heritage page)
4. **Checkpoint**: Present draft. Confirm with user before verification.

### Stage 4: Verify
1. Read `references/VERIFICATION.md` for verification patterns and rubric
2. Verify authored content for historical accuracy, cultural authenticity, and bias
3. Save report to `plan/content/{slug}/verification-report.md`
4. **Decision Point**: Present verification report. Ask user:
   - **Revise** → Return to Stage 3 with verification feedback
   - **Accept** → Content approved for publication

---

## Slug Convention

Derive a kebab-case slug from the topic:
- "Morna Music on Brava Island" → `morna-music-brava-island`
- "Casa da Morabeza Restaurant" → `casa-da-morabeza`

Create `plan/content/{slug}/` directory at pipeline start.

## Output Structure

```
plan/content/{slug}/
├── research.md              # Stage 1: Raw findings with sources
├── content-plan.md          # Stage 2: Outline, SEO, multilingual notes
└── verification-report.md   # Stage 4: Accuracy assessment
```

Final authored content goes to its destination path (e.g., `apps/web/content/`).

## Cross-Cutting References

Load these on-demand when relevant to the current stage:
- `references/GLOSSARY.md` — Cape Verdean cultural terms (Stages 3, 4)
- `references/SEO_KEYWORDS.md` — Diaspora discovery keywords (Stages 2, 3)
- `references/TEMPLATES.md` — Content and report templates (Stages 2, 3, 4)
- `references/CONSULTATION.md` — Community consultation protocols (Stage 4)

## Project Documentation

Always consult for cultural and technical standards:
- `docs/10-product/design-system.md` — Brand voice and cultural values
- `docs/10-product/cultural-heritage-verification.md` — Verification protocols

## Detailed Resources

- [WORKFLOW.md](WORKFLOW.md) — Detailed pipeline flow and state transitions
- [EXAMPLES.md](EXAMPLES.md) — End-to-end pipeline examples
