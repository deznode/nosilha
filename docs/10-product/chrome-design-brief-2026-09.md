# Site Chrome Design Brief — Footer & Navigation

> **Date**: 2026-09-20
> **Scope**: the site's persistent chrome only — footer, top navigation, mobile bottom navigation. Page content is out of scope.
> **Method**: source read of `apps/web/src/components/navigation/`, `components/ui/footer.tsx` and the four route-group layouts, plus a Playwright sweep at 390 / 768 / 1440 in light and dark across `(main)`, `(archive)`, `(archive-fill)` and `(auth)` routes. Contrast ratios, element hit-boxes, nav overflow and tab order are **measured in the browser**, not estimated from classes.
> **Environment**: local dev on `main` at `34dc3b9`, seed data. Captured both signed-out and signed-in (admin account).
> **Audience**: the UX/UI team (body); engineering (appendix A).
> **Screenshots**: [`chrome-design-brief-2026-09/`](chrome-design-brief-2026-09/), named `NN-route-width-theme-position.jpg`.
> **Predecessors**: [redesign-ux-audit-2026-09.md](redesign-ux-audit-2026-09.md), [mobile-space-audit.md](mobile-space-audit.md)

The round **"N"** badge and the orange **"1 Issue"** pill in the lower-left corner of every screenshot are Next.js dev tools. They are not part of the product.

---

## 1. Summary

**Three things design needs to know first**

1. **There are two parallel chrome systems, and which one you get depends on the route group — not on anything the visitor can perceive.** `(archive)` routes (home, settlements, towns, entries, photographs, films, stay) get `ArchiveBar` + footer. `(main)` routes (about, contact, contribute, history, people, stories, profile, settings, privacy, terms) get `StickyNav` + `MobileBottomNav`, and the footer **only above 1024px**. Crossing between them changes the entire frame around the page. See §2.

2. **The footer is not part of the theme system.** It is hardcoded to `#1b2127` in both light and dark mode, while the components inside it use theme-aware tokens. The result is two opposite failures from one cause: a privacy line at **2.18:1 in light mode** and a Subscribe button at **2.27:1 in dark mode**, both below the 4.5:1 AA floor. Body copy and links are fine (12.55:1). See §4.

3. **The top bar clips itself across the whole tablet range.** Between 768px and 1023px, `StickyNav` overflows its container by **196px signed-out / 224px signed-in**, silently cutting off — with no horizontal scroll and no overflow menu — the Map link, the language selector, the theme toggle, and **Log in / Sign up** (or the profile menu and Admin link when signed in). See §5, N-2.

**What this brief is asking for**

A single chrome design that works across both route groups, at every width, in both themes. §7 carries a recommended direction; it is a starting point for the team to accept, adapt or reject, not a decision already made.

---

## 2. The chrome map

Which chrome renders where, measured (heights in CSS px, light and dark identical):

| Route group | Routes | Top chrome | 390px | 768px | 1440px | Bottom nav | Footer |
|---|---|---|---|---|---|---|---|
| `(archive)` | `/`, `/settlements`, `/[town]`, `/[town]/[entry]`, `/photographs`, `/films`, `/stay` | `ArchiveBar` | **158** | 65 | 65 | never | **always** |
| `(archive-fill)` | `/map`, `/photographs/[id]` | `ArchiveBar` | **158** | 65 | 65 | never | never |
| `(main)` | `/about`, `/contact`, `/contribute`, `/history`, `/people`, `/stories`, `/profile`, `/settings`, `/privacy`, `/terms` | `StickyNav` | 49 | 65 | 65 | **≤1023 only** (57px) | **≥1024 only** |
| `(auth)` | `/login`, `/signup` | none | – | – | – | never | never |

Footer height when rendered: **1058px at 390px wide**, 586px at 768px and above.

**What this produces for a visitor on a phone:**

- On `/` (archive), they get a 158px wrapping pill bar, no bottom nav, and a 1058px footer.
- Tapping "Settlements" in the `(main)` bottom nav takes them to an `(archive)` route — **and the bottom nav they just used disappears.**
- On `/about` (main), they get a 49px bar containing **only the logo**, a bottom nav, and **no footer at all**.

Screenshots: `01-home-390-light-top.jpg` (the wrapping bar), `04-about-768-light-bottom.jpg` (page ending with no footer while both navs render).

---

## 3. Measured baseline

Every figure below is read from the rendered page, not inferred.

### Visible interactive controls in the top bar

| Width | `StickyNav` (main) | `ArchiveBar` (archive) |
|---|---|---|
| 390 | **1** — the logo, nothing else | 8 — logo, theme pill, 6 nav pills |
| 768 | 11 | 8 |
| 1440 | 11 | 8 |

`StickyNav` has **no hamburger and no mobile menu**. Below 768px its nav links are `hidden md:flex` and nothing replaces them; all mobile navigation on `(main)` routes depends entirely on the bottom nav.

### Chrome height as a share of an 844px phone viewport

| Chrome | Height | Share of viewport |
|---|---|---|
| `ArchiveBar` @390 | 158px | **18.7%** |
| `StickyNav` @390 | 49px | 5.8% |
| `MobileBottomNav` | 57px | 6.8% |
| Footer @390 | 1058px | 125% — taller than the screen |

---

## 4. Footer findings

### F-1 — The footer is outside the theme system *(root cause of F-2 and F-3)*

`footer.tsx:61` sets `bg-basalt-900 text-mist-200` with **no dark-mode variant**. Measured footer background is `#1b2127` in light mode and `#1b2127` in dark mode — byte-identical. Every other surface in the product moves between themes; the footer does not.

The components placed inside it — the newsletter form, the Subscribe button, the privacy line — *do* use theme-aware tokens, whose light-mode values assume a light background. They land on a dark one. This is the mechanism behind both contrast failures, from opposite directions.

### F-2 — Privacy line fails AA in light mode

| Element | Light | Dark | AA floor |
|---|---|---|---|
| "We respect your privacy. Unsubscribe at any time." (14px) | `#5c544a` on `#1b2127` — **2.18:1 ✗** | `#aeb9c4` — 8.15:1 ✓ | 4.5:1 |

It is visibly dim in `13-footer-resting-1440-light.jpg`. The token resolves to its light value on a permanently dark surface.

### F-3 — Subscribe button fails AA in dark mode

| Element | Light | Dark | AA floor |
|---|---|---|---|
| Subscribe button (14px/600, white text) | `#3d5a73` — 7.22:1 ✓ | `#8fb0cb` — **2.27:1 ✗** | 4.5:1 |

`bg-ocean-blue` lightens in dark mode, as it should on a dark *page*; on the footer's fixed dark surface it washes out against its own white label.

### F-4 — Everything else in the footer passes, comfortably

Worth stating plainly so the team does not redesign what is not broken. Measured on `#1b2127`:

| Element | Ratio | Verdict |
|---|---|---|
| Tagline, column links (14px) | 12.55:1 | ✓ |
| Column headings (16px/600) | 16.24:1 | ✓ |
| Copyright (12px) | 12.55:1 | ✓ |
| Social icon links | 12.55:1 | ✓ |
| Newsletter input (resting and focused) | white field, dark text | ✓ |

> A note for continuity: the 2026-08-29 audit recorded a general "footer contrast" failure. Measured now, **that is no longer true** — body text and links pass with wide margin. The failures are the two specific elements in F-2 and F-3.

### F-5 — Twelve sub-44px touch targets

At 390px the footer contains 12 controls below the 44×44 minimum:

| Control | Measured |
|---|---|
| Each of the 8 column links | 32–102 × **18px** |
| 3 social icon links | **24 × 24** |
| Subscribe button | 342 × **36** |

The links are 18px tall because they are plain text in a `space-y-3` list — the gap is margin, not hit area.

### F-6 — The footer is 1058px tall on a phone, and most phones never see it

The three-column grid stacks to one column below 768px, producing a footer longer than the viewport. It renders this way **only on `(archive)` routes**; on `(main)` routes it is hidden below 1024px, so the mobile treatment that exists is the one fewest people reach.

### F-7 — Legal links are unreachable from `(main)` routes on phone and tablet

Privacy Policy and Terms of Service exist **only** in the footer. They are not in `StickyNav`, `ArchiveBar`, or the bottom nav's "More" menu. On a phone, a visitor reading `/about` or `/privacy`'s sibling pages has no navigational path to them — they must first cross into an archive route, where the footer renders. All eight footer links resolve (no 404s).

### F-8 — Three chromes, three different site inventories

| Destination | `ArchiveBar` | `StickyNav` | Bottom nav | Footer |
|---|---|---|---|---|
| Home | ✓ | ✓ | ✓ | — |
| Settlements | ✓ | ✓ | ✓ | ✓ |
| Photographs | ✓ | ✓ | More menu | ✓ |
| Films | ✓ | ✓ | — | ✓ |
| Map | ✓ | ✓ | ✓ | — |
| Stay | ✓ | — | — | — |
| History / People | — | ✓ (Culture) | ✓ (Culture) | — |
| About / Contact | — | — | — | ✓ |
| Privacy / Terms | — | — | — | ✓ |
| Contribute a story | — | — | More menu | ✓ |
| `/stories`, `/contribute` | — | — | — | — |

`/stories` is live (HTTP 200) and linked from **no chrome at all**. `/contribute` (the hub) is likewise unlinked — only its child `/contribute/story` is reachable, from the footer and the "More" menu. `Stay` appears in exactly one chrome.

---

## 5. Navigation findings

### N-1 — `(main)` has no mobile navigation of its own

Below 768px, `StickyNav` renders the logo and nothing else — one interactive element. There is no hamburger, no disclosure panel, no overflow menu. The bottom nav carries 100% of the navigation load, and it is `lg:hidden`, so the handoff between the two systems happens at a width where neither is designed to be sole navigation.

### N-2 — The top bar clips itself from 768px to 1023px

Measured overflow of the nav's inner flex container, `/about`:

| Viewport | Signed-out | Signed-in (admin) | What falls off the right edge |
|---|---|---|---|
| 700 | 0 | 0 | *(nav links hidden below `md`)* |
| **768** | **196px** | **224px** | Map, language, theme toggle, **Log in + Sign up** / profile menu + Admin |
| **820** | — | **172px** | Admin, language, theme, profile menu |
| **900** | **64px** | **92px** | **Log in + Sign up** / theme toggle + profile menu |
| 1024 | 0 | 0 | nothing |

`document.scrollWidth` never exceeds the viewport, so **there is no horizontal scroll to recover the clipped controls** — they are simply gone. `14-nav-clipping-signedout-768-light.jpg` shows "Map" cut mid-word and the language globe bleeding off the edge.

The bottom nav's "More" menu currently covers for this below 1024px (it carries Log in / Sign up / Profile), so this is a visual and discoverability failure rather than a hard dead end — but the bar is visibly broken across the entire tablet range.

### N-3 — The archive surface has no account affordance at all

Signed in, the full text content of `ArchiveBar` is:

```
NosIlha | ARCHIVE | Dark | Home | Settlements | Photographs | Films | Map | Stay
```

No avatar, no name, no profile link, no sign out, no sign-in prompt. `(archive)` and `(archive-fill)` cover home, settlements, town and entry pages, photographs, films, map and stay — **most of the browsing surface**. A signed-in visitor there has no indication they are signed in and no way to reach their account without leaving for a `(main)` route. Screenshots `08-signedin-settlements-*.jpg`.

### N-4 — `ArchiveBar` wraps to 158px on a phone

Six pills plus logo and theme toggle wrap onto two rows below ~640px, consuming 18.7% of an 844px viewport before any content. The component's own source comment documents this (`archive-bar.tsx`), and `(archive-fill)/layout.tsx` had to switch to `h-dvh` flex sizing specifically to stop the taller bar pushing `/map`'s bottom sheet below the fold. **This is a known-cost workaround, not an accident** — but it is the clearest candidate for a hamburger or scrollable pill row.

### N-5 — Touch targets in both top bars

| Control | Measured | Status |
|---|---|---|
| Archive pills (Home … Stay) | 58–106 × **36** | below 44 |
| Archive theme pill ("Dark") | 55 × **34** | below 44 |
| Bottom nav items | 44–77 × **53** | ✓ |

The bottom nav is the only chrome that meets the minimum throughout.

### N-6 — Keyboard behaviour is sound, with one ordering quirk

Walked 14 tab stops from page load at 390px on both route groups:

- A "Skip to main content" link is the first stop on both. ✓
- Focus is visible everywhere — `outline: auto 2.5–3px` on archive pills, a focus ring on bottom nav items. ✓
- No focus traps in either chrome. ✓ (One caveat: on `(main)` at 390px the logo stop measured as off-screen at the moment focus landed. This is most likely scroll-into-view timing in the measurement rather than a real defect, and was not confirmed either way.)
- **Quirk**: on archive routes the theme toggle takes focus *before* any navigation link. A keyboard visitor tabs through an appearance control before reaching the site's navigation.
- The bottom nav is last in tab order, which is correct for a bottom-anchored bar.

*(The TanStack Query devtools button that appears in the tab order is dev-only and not a product issue.)*

---

## 6. Recommended direction

**This is a recommendation, not a decision.** It is the option that resolves the most findings at once; the team should feel free to take a different route.

### R-1 — One chrome for both route groups

The `(main)` / `(archive)` split is an implementation artefact that visitors can feel as an inconsistent frame. Recommend converging on **one top bar and one footer** used by every public route, with per-route-group variation limited to density, not structure. This alone resolves N-1, N-3, F-6, F-7 and most of F-8.

### R-2 — Top bar: a hamburger below `md`, a real overflow rule above it

- **< 768px**: logo + one menu trigger + (optionally) the theme toggle. Everything else moves into a panel. This gives `(archive)` a fixed ~56–64px bar instead of 158px, and gives `(main)` actual navigation instead of a bare logo.
- **768–1023px**: the current failure mode. Either keep the hamburger up to 1024px, or define an explicit priority order for what collapses first. What must never happen again is silent clipping (N-2).
- **≥ 1024px**: the current inline bar, which measures clean.

The existing `header.tsx` already implements a full Headless UI `Disclosure` hamburger with a mobile panel — see appendix A.

### R-3 — Account affordance in the bar at every width

One consistent element — avatar when signed in, "Log in" when not — that never collapses and is never clipped (N-2, N-3).

### R-4 — Bring the footer into the theme system

Replace `bg-basalt-900 text-mist-200` with the semantic surface tokens so the footer moves with the theme, **or** keep it deliberately dark and give its contents an explicit on-dark treatment. Either resolves F-1/F-2/F-3; the second needs a designed "always dark" token set so the problem cannot recur when a new component is dropped in.

### R-5 — A mobile footer worth showing

Design a short mobile footer (recommend under ~400px) and show it on **all** routes, rather than a 1058px one that only archive routes render. Legal links must appear in it at every width (F-7).

### R-6 — Touch targets

Raise footer links, social icons, archive pills and the theme pill to a 44×44 minimum hit area — achievable with padding, without changing type size or visual rhythm (F-5, N-5).

### R-7 — Settle the site inventory

F-8 shows three chromes disagreeing about what the site contains, with two live routes in none of them. Recommend design produce one canonical destination list, with an explicit decision on `/stories` and `/contribute`, before the chrome is drawn.

---

## 7. Open questions for design

1. **Is the `(main)` / `(archive)` distinction meaningful to visitors?** If not, R-1 is straightforward. If it is deliberate, what should signal it — and why does that signal change the navigation itself?
2. **Hamburger, bottom bar, or both?** The bottom nav measures well (53px targets, correct tab order) but exists on only one route group. It could become the universal mobile pattern, or be retired in favour of a hamburger.
3. **What collapses first between 768 and 1023px?** Design needs to state the priority order; engineering will enforce it.
4. **Is the dark footer intentional brand, or a leftover?** This decides between the two halves of R-4.
5. **Does `Stay` belong in the primary nav?** It currently appears in exactly one chrome.
6. **What happens to `/stories` and `/contribute`?** Linked from nothing today.

---

## Appendix A — Engineering notes

- **`header.tsx` is dead code with a live implementation.** 517 lines implementing the full hamburger pattern R-2 describes — `Disclosure` + `DisclosurePanel`, a mobile nav list, mobile language selector, mobile auth block. Its only importer is `/admin/dev-tools/components`. If design chooses a hamburger, this is the base, not a rewrite. If design chooses otherwise, it should be deleted. *(Out of scope for the design brief itself.)*
- `nav-config.ts` is shared by `StickyNav` and `header.tsx`. `ArchiveBar`, `MobileBottomNav` and `Footer` each hardcode their own separate lists — the mechanical cause of F-8. Converging them is a prerequisite for R-7.
- `ArchiveBar` pins its metrics as arbitrary px values rather than tokens, by deliberate choice documented in its source. Any resizing in R-2 touches those constants and the `h-dvh` assumption in `(archive-fill)/layout.tsx`.
- The footer's contrast failures are inherited from child components, not set in `footer.tsx`. Changing the footer background alone will not fix them; the children's token resolution has to be addressed with it.
- Overflow measurements are of `nav.fixed.top-0`'s inner flex container. `document.scrollWidth` stays at viewport width, confirming the content is clipped rather than scrollable.

## Appendix B — Screenshot index

77 files in [`chrome-design-brief-2026-09/`](chrome-design-brief-2026-09/).

| Prefix | Contents |
|---|---|
| `01` – `06` | Signed-out sweep: home, settlements, map, about, history, login — 390 / 768 / 1440 × light / dark, `-top` and (where a footer renders) `-bottom` |
| `07` – `08` | Signed-in `(main)` and `(archive)` bars, 390 / 1440 × light / dark |
| `09` | Signed-in profile menu, 1440 light |
| `10` – `11` | Signed-in bottom nav and its "More" menu, 390 light |
| `12` – `13` | Footer newsletter, typed and resting, 1440 light / dark |
| `14` | Top-bar clipping, signed out, 768 and 900 light |
