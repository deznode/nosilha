# Redesign Integration Review — Nos Ilha

> **Date**: 2026-08-31
> **Scope**: `/map`, `/directory`, `/gallery`, `/gallery?view=map`, `/gallery?view=timeline`
> **Reviewed against**: `.claude-design/design_handoff_nos_ilha_redesign/README.md`
> **Method**: source read across `apps/web` + Playwright at 1440×900 and 390×844; API probed at `localhost:8080`
> **Audience**: the design side (body), engineering (appendix)

A code-and-browser review of five live surfaces against the redesign handoff. Most of what the
design asserts about the archive holds up in the running app. Three things it asserts about the
**codebase** do not, and one of them will visibly break the logo on the day we apply the palette.

---

## The five surfaces, as they actually run

Every claim below was observed in the browser, not inferred from source.

| Surface | Verdict | Note |
|---------|---------|------|
| `/map` | Works, but buried | Eight real records under a hardcoded layer of invented districts and trails. At 390px the invented geography wins. |
| `/directory` | Works | Eight entries. Every card reads "0 reviews," the church included. Three of eight are icon placeholders. |
| `/gallery` | Works, invents titles | Two different wrong answers for a missing title, on the same screen. |
| `/gallery?view=map` | Silently drops data | Counts change to 11 photos, 0 videos. Fifteen records and every film vanish with no explanation. |
| `/gallery?view=timeline` | **Dead view** | Renders the grid. The toggle highlights, the timeline never appears. |

The timeline view has been shipping as a broken toggle. Its failure is swallowed by a
`.catch(() => null)` that falls through to the grid, so it looks like a working view rather than a
missing one. The redesign proposes replacing the decade axis entirely — which means this can be
retired rather than repaired, and no one loses a feature they had.

---

## What the handoff gets right

Re-verified independently in the running app and its API. The design team can build on these.

### Three of the four decade buckets are empty

The live API returns **0, 0, 0, 26** across pre-1975, 1975–1990, 1990–2010 and 2010+. The decade
axis genuinely has nothing to sort. Replacing it with a what-is-known axis is well founded.

- Evidence: `GET /api/v1/gallery/timeline` → `groups[].count = [0, 0, 0, 26]`

### Only 11 of 26 records carry coordinates

The map view states it outright — "11 photos with locations" — then quietly rewrites the tab counts
to Photos (11) and Videos (0). Turning "no place" into a filter chip instead of a silent exclusion
is the right correction, and it is the clearest argument in the handoff.

- Evidence: observed at `/gallery?view=map`, 1440×900

### The app invents titles the archive does not hold

Two mechanisms, both wrong, both visible on one screen. The grid synthesises `Landscape — March 2026`
and `Brava Island — March 2026`. The Photo of the Day shows the raw storage key instead.

**The date in those synthesised titles is the upload date, not the capture date.** "March 2026" is
when the file reached the server. The design's "Untitled" rule fixes a deeper problem than a
cosmetic one — the app is currently asserting a fact about each photograph that nobody recorded.

- Evidence: `apps/web/src/lib/gallery-mappers.ts:102` — `humanizeTitle(category, media.createdAt)`
- Evidence: rendered headline `37ab0aef-940b-439f-a67f-3d9dbcd702cc-DJI_0155.JPG`

### Ratings apply to heritage by schema

The star is guarded on a null check, but the review count is printed unconditionally — so a
19th-century pilgrimage church advertises "0 reviews." The category guard the handoff asks for is
correct, and belongs in one place.

- Evidence: `apps/web/src/components/directory/directory-card.tsx:90` (`rating != null`), `:136` (`reviewCount` unguarded)

### The sign-in wall on media contribution is real

Authentication is evaluated before the form is offered — the dead end the handoff describes. Moving
auth to submit is a change we can make without touching the backend.

- Evidence: `apps/web/src/app/(main)/contribute/media/page.tsx:90` — `requiresAuth = !authLoading && !user`

---

## Three things the handoff gets wrong about this codebase

Each changes what the design team needs to hand over. The third is urgent.

### 1. Hex values pasted into a stylesheet will be erased

The handoff supplies the Slate palette as hex and says to override the design system's tokens in a
stylesheet. But this project's tokens are **OKLCH and machine-generated**: `globals.css` is rewritten
between `@brand-tokens:start` and `@brand-tokens:end` by a sync script reading a palette file.
Anything hand-edited in that range disappears on the next sync.

**What we need instead:** the Slate palette as OKLCH, delivered as a patch to `palette.json`. Same
colours, different container. If design prefers to keep working in hex we can convert on our side —
but the handoff should name `palette.json` as the target so the next designer doesn't repeat this.

- `apps/web/src/app/globals.css` — generated by `scripts/sync-brand-tokens.mjs` from `brand/assets/palette.json`

### 2. Settlements are already reachable — the route is what's missing

The handoff calls the towns data "unreachable," implying a data-access build. It isn't: `getTowns()`
and `getTownsForMap()` already exist in the API client and are already wired to the backend. What has
never existed is a page.

**This is good news for scope.** The settlements index and settlement detail screens are close to
pure front-end work on data that already flows. They are the cheapest two screens in the bundle, not
the most expensive — worth knowing when design sequences the rollout.

- `apps/web/src/lib/api.ts:177` — `getTowns()`
- `apps/web/src/lib/api.ts:197` — `getTownsForMap()`

### 3. Repointing the pink token splits the logo in half

The handoff says the logo's pink mark is the one place bougainvillea survives the palette change. It
won't. `NosilhaLogo` paints its outer petals through the token being repointed, while its inner
gradient and highlight are hardcoded magenta and yellow. Repoint the token and the petals turn ochre
while the core stays `#E91E63` — a two-tone mark, in the header, footer, sign-in screen and admin
sidebar simultaneously.

**Design owes us one artwork decision** before we ship the palette: either the mark goes fully ochre,
or its petals get pinned to a literal pink that no longer follows the token.

- `apps/web/src/components/ui/logo.tsx:19,30` — `className="text-bougainvillea-pink"`
- `apps/web/src/components/ui/logo.tsx:131,132,159,170` — `#E91E63`, `#9C27B0`, `#FF80AB`, `#FFD740`
- Used by: `navigation/header.tsx:34`, `ui/footer.tsx:6`, `navigation/sticky-nav.tsx:29`, `auth/auth-form.tsx:24`, `admin/layout/admin-sidebar.tsx:9`

---

## Counts in the prototype that the app disagrees with

The Photographs screen specifies literal chip counts — All 26 / Photographs 17 / Films 9. The running
app reports different numbers, and disagrees with itself.

| Figure | Handoff | App | Note |
|--------|--------:|----:|------|
| Total records | 26 | 26 | Agrees. Stated in the gallery header. |
| Photographs | 17 | 16 | Tab label reads Photos (16). |
| Films | 9 | 8 | Tab label reads Videos (8). |
| Tabs summed | 26 | 24 | The app's own header and tabs are two short of each other. |
| With coordinates | 11 | 11 | Agrees. |

**Ask:** do not hardcode these counts in the built screens. The design's own rule — say the true
number, including zero — is best served by computing every chip count at render. We will reconcile
the two-record discrepancy on our side; design should treat the prototype's numbers as illustrative
and let the copy read from live aggregates.

---

## Decisions taken

Resolved with the product owner during this review. Recorded so the design team is not re-asked.

### Decision 01 — the gap colour: repoint the token globally, as specified

Bougainvillea pink becomes warm ochre everywhere. The token carries the brand accent across
**103 usages in 55 files** — nav underline, section headers, filter chips, landing components, admin
queues. All shift to ochre. That is accepted: the handoff is explicit that the gap colour does more
work than any other, and a partial application would leave two accent colours competing.

This does not resolve the logo. See finding 3 above — that still needs an artwork call.

### Decision 02 — the map: retire the invented layer, keep MapLibre

The current map draws its loudest content from two checked-in files describing districts and trails
that are not archive records — Highland Reserve, Furna Harbor District, Nova Sintra to Cachaço Trail.
At 390px these polygons and their labels overlap each other and obscure the island; the eight real
records are the least visible thing on screen.

**Invented geography is precisely what direction C rejects**, so this is a consistency fix, not a
taste one. The MapLibre shell, clustering and sidebar stay; the fiction layer goes; pin colour moves
to completeness.

The surface is substantial — roughly 2,300 lines under `apps/web/src/features/map/`, including a 3D
toggle and an intro animation, neither of which appears in the prototype. We need a decision on both.

- `apps/web/src/features/map/data/zones.json`, `trails.json`

### Decision 03 — this document: design-facing, engineering appendix

Everything above is a request to the design team. The appendix is ours.

---

## What we need back from design

In the order they block us.

1. **The logo decision.** Fully ochre mark, or petals pinned to a literal pink. Blocks the palette change, which blocks every screen.
2. **The Slate palette as OKLCH, targeted at `palette.json`.** We can convert if easier — but the handoff should name the real target file.
3. **A call on the map's 3D toggle and intro animation.** Neither exists in the prototype. Silence reads as "delete," and we would rather it be deliberate.
4. **The three items the handoff already flags as open** — the Faja d'Agua duplication, provenance for the two portraits, and the place of `hero.jpg`. Unchanged by this review; still blocking their respective screens.

**Not blocking:** typography needs nothing — the project already ships Fraunces and Outfit, and
already sets Fraunces at weight 400. Radii are close enough to adopt as-is: the system has
16 / 12 / 12 / 8px against the design's 12–14 for cards and 9–10 for thumbnails. We will add the 2px
hairline-list and 999px pill values and leave the rest.

---

## Appendix — engineering

Defects confirmed in this pass, with the line that causes each. Not design's to action.

| Defect | Location | Disposition |
|--------|----------|-------------|
| Timeline view renders the grid | `gallery/gallery-content.tsx:747`, `gallery/page.tsx:186` | The API is healthy; `timelineData` arrives null and the failure is swallowed. **Root cause not yet identified** — an identical fetch pattern in `getFeaturedPhoto` succeeds. Needs a debugging pass before we decide repair vs. retire. |
| Synthesised photograph titles | `lib/gallery-mappers.ts:102` | Delete `humanizeTitle`. Return "Untitled"; carry the record reference on the sub-line. |
| Raw storage key as a headline | `components/gallery/featured-photo-card.tsx:52` | Renders `{photo.title}` raw, bypassing the canonical mapper. Route it through `mapGalleryMediaToMediaItem` so one rule governs missing titles. |
| Review count on heritage records | `components/directory/directory-card.tsx:136` | Guard on category in the entity, not the template — per the handoff, so new surfaces don't re-inherit it. |
| Map view drops records silently | `gallery/gallery-content.tsx:193` | `hasGeo: true` filters server-side and rewrites the tab counts. Becomes a visible "no place" chip. |
| Header and tab totals disagree | `gallery/page.tsx` | 26 vs. 16 + 8. Two records are counted in one aggregate and not the other. Reconcile before any count is shown as fact. |

### Migration order

The handoff's sequence holds, with step 2 moved earlier now that the data path is known to exist.

1. **`directory_entries.town` becomes a foreign key** to `towns.id`. The keystone; place-based browsing depends on it.
2. **Build the settlement routes on existing data.** No new model, no new content, and the client functions are already written.
3. **Collapse the five media paths onto `gallery_media`.** Until this lands, "how many photographs does this place have" has five answers.
4. **Require credit and place at upload**, using columns that already exist.
5. **Derive completeness per record.** Trivial once the first three are done.
6. **Category guard on rating and review count**, in the entity.

### Carried forward, not re-verified

The handoff's database findings — the five media paths, the 38 broken settlement image paths, and
zero photographer credits across all 26 records — were verified by the design team against commit
`d56fe777a58a` and are taken on trust here. This review re-verified only what is observable from the
running app and its API. The decade-bucket, coordinate-coverage and rating findings all held; we have
no reason to doubt the rest, but they should be confirmed before the migrations are written.

---

## Related

- Design handoff: `.claude-design/design_handoff_nos_ilha_redesign/README.md` (gitignored — lives in the claude.ai/design project)
- Published review: https://claude.ai/code/artifact/9de5d45f-1c03-4d03-99a9-f633f83ad218
- [design-system.md](design-system.md) — current token architecture
- [mobile-space-audit.md](mobile-space-audit.md) — prior mobile audit, 2026-03-16
