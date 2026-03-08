# Content Pipeline Workflow

Detailed pipeline flow and state transitions for the cultural heritage content pipeline.

## Pipeline State Machine

```
┌─────────┐    ┌──────┐    ┌────────┐    ┌────────┐
│ Research │───>│ Plan │───>│ Author │───>│ Verify │
└─────────┘    └──────┘    └────────┘    └────┬───┘
     ▲              ▲            ▲             │
     │              │            │        ┌────▼────┐
     │              │            └────────│ Decision │
     │              │            (revise) └────┬────┘
     │              │                          │
     │              │                     (accept)
     │              │                          │
     │              │                    ┌─────▼─────┐
     │              │                    │ Published  │
     │              │                    └───────────┘
     │              │
     └──────────────┘ (user can restart from any stage)
```

## Resume Detection

When the user provides a topic or slug, check `plan/content/{slug}/` for existing artifacts before starting fresh.

### Detection Logic

```
1. Derive slug from topic
2. Check if plan/content/{slug}/ exists
3. If not → Full Pipeline from Stage 1

If directory exists, scan for artifacts:
┌─────────────────────────┬──────────────────────────────┐
│ Files Found             │ Resume Point                 │
├─────────────────────────┼──────────────────────────────┤
│ (none)                  │ Stage 1: Research            │
│ research.md             │ Stage 2: Plan                │
│ research.md +           │ Stage 3: Author              │
│   content-plan.md       │                              │
│ research.md +           │ Ask user: re-verify,         │
│   content-plan.md +     │   revise, or start fresh     │
│   verification-report.md│                              │
└─────────────────────────┴──────────────────────────────┘
```

### Resume Presentation

When existing artifacts are found, present to user:

```
Found existing pipeline artifacts for "{topic}":
- research.md (Stage 1: complete)
- content-plan.md (Stage 2: complete)

Options:
1. Continue from Stage 3 (Author) — use existing research and plan
2. Restart from Stage 2 (Plan) — redo planning with existing research
3. Start fresh — discard existing artifacts and begin from Stage 1
```

Read each existing artifact briefly to confirm it's relevant and not stale. If the topic has shifted significantly, recommend starting fresh.

---

## Detailed Stage Transitions

### Start → Stage 1: Research

**Trigger**: User requests content creation with a topic (no existing artifacts found).

**Actions**:
1. Derive slug from topic (kebab-case)
2. Create `plan/content/{slug}/` directory
3. Load web-searching skill and cultural research constraints
4. Execute research and save to `plan/content/{slug}/research.md`
5. Present findings summary to user

**Checkpoint**: User confirms research is sufficient, or requests more research.

**Transitions**:
- User approves → Stage 2
- User requests more research → Repeat Stage 1 with expanded scope

### Stage 1 → Stage 2: Plan

**Actions**:
1. Read research output
2. Load planning instructions from `references/PLANNING.md`
3. Create content plan following the five-phase framework
4. Save to `plan/content/{slug}/content-plan.md`
5. Present outline and strategy to user

**Checkpoint**: User confirms plan structure and approach.

**Transitions**:
- User approves → Stage 3
- User requests changes → Revise plan, stay in Stage 2
- User wants more research → Return to Stage 1

### Stage 2 → Stage 3: Author

**Actions**:
1. Read content plan
2. Load authoring instructions from `references/AUTHORING.md`
3. Load glossary and SEO keywords as needed
4. Write content following plan outline, cultural voice, and SEO strategy
5. Write to destination path
6. Present draft to user

**Checkpoint**: User confirms draft is ready for verification.

**Transitions**:
- User approves → Stage 4
- User requests changes → Revise draft, stay in Stage 3
- User wants to revise plan → Return to Stage 2

### Stage 3 → Stage 4: Verify

**Actions**:
1. Read authored content
2. Load verification patterns from `references/VERIFICATION.md`
3. Apply relevant patterns (historical, cultural practice, bias detection)
4. Assess confidence level and identify corrections
5. Save report to `plan/content/{slug}/verification-report.md`
6. Present verification report to user

**Decision Point** (hard stop — wait for user):
- **Revise** → Return to Stage 3 with specific feedback
- **Accept** → Content approved for publication

### Verify Only Mode

**Trigger**: User provides a file path with "verify" intent.

**Actions**:
1. Read content at provided path
2. Load verification patterns from `references/VERIFICATION.md`
3. Apply all relevant patterns
4. Determine slug from file path or content title
5. Save report to `plan/content/{slug}/verification-report.md`
6. Present verification report

**Decision Point**: Same as full pipeline Stage 4.

## Error Recovery

### Research produces insufficient results
- Widen search queries and source types
- Flag topic as potentially requiring community consultation
- Proceed with available information, noting gaps in plan

### Content plan rejected by user
- Ask user for specific concerns
- Revise plan addressing feedback
- Re-present for approval

### Verification finds critical issues
- Categorize issues by severity (Critical/Moderate/Minor)
- Present clear correction requirements
- On "Revise", ensure author addresses all Critical and Moderate items
- Re-verify after revision

### Pipeline interrupted mid-flow
- All intermediate outputs are on disk at `plan/content/{slug}/`
- User can resume from any stage by providing the slug
- Check existing files to determine last completed stage
