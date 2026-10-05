---
generated: 2026-10-04
commit: 789bf41
source: /roadmap next
---

## Recommended Next Actions

1. **Spec 040: contribution flow follow-ups and tag-based revalidation (#86)** — spec 039 shipped with six open decisions recorded in `plan/arkhe/specs/039-contribution-flow/wave-5-context.md`: the duplicate-film card shows "YouTube / YouTube" because the lookup returns no title or meta, the P4 free-text field is single-line, the `/contribute` landing cards have no archive images, plus dark-palette and copy questions. `FrontendRevalidationService` has no tag method (#86, open since 2026-03), so an approved contribution relies on path revalidation and cache expiry to appear. Both shape how a contributor experiences the flow that just went live. Effort: a few days.
2. **Curated exhibits and contributor profiles** — the last unspecced items in `plan/media/active/gallery-enhancement-roadmap.md` ("Phase 3 Deferred — Exhibits & Profiles", 0/2). Their dependency, the contribution flow, is now done. Contributor profiles give credited uploads somewhere to lead. Effort: one spec, multi-day; needs a design brief first.
3. **API tests for the auth, engagement and stories modules** — `apps/api/src/test/kotlin/com/nosilha/core/` has test packages for `ai`, `config`, `feedback`, `gallery`, `places` and `shared` only; `auth` (18 source files), `engagement` (15) and `stories` (24) have none of their own. Auth matters most, since sign-in now gates every contribution. Not verified: how much of these modules the gallery and feedback integration tests cover indirectly. Effort: one to two days for auth.

Lower priority, unchanged: Terraform `hashicorp/google` 7 → 8 (#195, open since 2026-08-08); the `EDITOR`/`MODERATOR` roles (`UserRole` still defines only `USER` and `ADMIN`); internationalization (PT/KEA/FR); the stale `pre-release` skill, which still names `/directory`, `/explore` and `npx tsc`; spec headers for 033 ("Draft") and 035 ("In Progress", 0/51 tasks ticked), both shipped.
