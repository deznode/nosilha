# Redesign UX Audit — Nos Ilha, after spec 033

> **Date**: 2026-09-13
> **Scope**: every public route in `apps/web`. Admin surfaces are covered from code only (appendix).
> **Reviewed against**: `.claude-design/design_handoff_nos_ilha_redesign/README.md` (direction C, "the honest archive") and `plan/arkhe/specs/033-archive-redesign/`
> **Method**: Playwright at 1440×900 and 390×844 in light mode on every route, plus dark mode on five key screens. Source read of `apps/web` and `apps/api`. Live counts from the local API at `localhost:8080` and the local database.
> **Environment**: local dev on `main` at `417d619`, with seed data plus the local `gallery_media` rows.
> **Audience**: the UX/UI team working in Claude Design (body); engineering (appendix).
> **Predecessors**: the 2026-08-29 UX audit, and [redesign-integration-review.md](redesign-integration-review.md) (2026-08-31)

This is the brief for the next design round. Spec 033 built the foundations of the handoff: data model, palette, logo, the Contribute form and the map encoding. Most of the screens designers will recognise from the prototype are **not built yet**. The site also has a large set of working features the handoff never mentions, especially in gallery/media and on the map. This document lists them one by one, so the next round keeps what works on purpose instead of dropping it by accident.

Screenshots live in [`redesign-ux-audit-2026-09/`](redesign-ux-audit-2026-09/). Files are named `NN-route-viewport-theme.jpg`. The round **"N"** badge and the orange **"1 Insight"** pill that appear in the lower-left corner are Next.js dev tools. They are not part of the product.

---

## 1. Summary

**Three things design needs to know first**

1. **Two of the eight handoff screens are live; the other six are not built.**
   - Live: Contribute and Map.
   - Not built: Archive home, Settlements index, Settlement detail, Place record, Photographs, Stay.
   - The backend work behind them has shipped: towns are canonical, entries link to a town by foreign key, and completeness and coincident-coordinate data come back from the API. **The frontend doesn't read any of it yet**, so the screens that would show this data are the work that remains.
2. **The handoff's counts are out of date.**
   - Settlements are now **25**, not 16, because spec 033 moved 9 map-only settlements into `towns`. **22** of them are name-only, not 13.
   - Locally, two uploads now have real titles, and the YouTube sync is **enabled**.
   - Every number in the prototype must be recomputed from live data. See §7 and appendix A.
3. **Gallery and map have much more than the prototype shows.**
   - Gallery: Photo of the Day, Weekly Discoveries, a video archive with a featured hero, search, Surprise Me, a map view, a photo detail page with "Help Identify", EXIF capture, and credit-platform detection.
   - Map: clustering, a coincident-record fan, satellite view, 3D terrain, and a mobile bottom sheet.
   - Behind these are 12 public and 24 admin gallery endpoints, AI analysis, R2 storage tooling and YouTube sync.
   - §4 and §5 give a Keep / Adapt / Retire recommendation for each one.

**What changed since the 08-31 review**

| Was | Now |
|---|---|
| Invented districts/trails layer on `/map` | Retired. Pins encode how well documented a place is; legend in its own strip; Settlements / Place records modes |
| Map intro animation, 3D on by default | Intro removed; 3D defaults off |
| Dark-mode button contrast failure | Fixed. `--primary` wired to `--brand-primary-fill`; `AnimatedButton` and Catalyst button moved onto it |
| Logo followed palette tokens | Logo is fixed artwork: `#E91E63` / `#FF80AB` / `#FFD740`, halo removed |
| `/contribute/media` sign-in wall | Rebuilt to the handoff: credit and permission first, sign-in only at submit |
| `/gallery?view=timeline` rendered the grid | **Now renders**, but shows 0 / 0 / 0 / 26 across its four decades. Retirement (T-16) still stands |
| Settlement modelled three ways | `towns` is canonical (25 rows); `directory_entries.town_id` is a foreign key |

---

## 2. Handoff status by screen

| # | Handoff screen | Status | Route today | Evidence | Spec task |
|---|---|---|---|---|---|
| 1 | Archive home | **Not built** | `/` still shows the pre-audit landing | [desktop](redesign-ux-audit-2026-09/01-home-desktop-light.jpg) · [mobile](redesign-ux-audit-2026-09/01-home-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/01-home-desktop-dark.jpg) | T-28 deferred |
| 2 | Settlements index | **Not built**, no route | — | Data ready: `GET /api/v1/towns/status-summary`; `StatusDot`, `FilterChip` exist | T-18 deferred |
| 3 | Settlement detail `/[town]` | **Not built**, 404 | `/nova-sintra` → 404 | [404](redesign-ux-audit-2026-09/10-missing-town-route-desktop-light.jpg). Data ready: `GET /api/v1/towns/slug/{slug}`; `DashedEmptyState` built, no consumer | T-19 deferred |
| 4 | Place record | **Not built**; old detail page | `/directory/[category]/[slug]` | [heritage](redesign-ux-audit-2026-09/06-entry-igreja-heritage-desktop-light.jpg) · [hotel](redesign-ux-audit-2026-09/08-entry-pensao-hotel-desktop-light.jpg) | T-20 deferred (backend T-06–T-08 done) |
| 5 | Photographs | **Not built**; old gallery | `/gallery` | [desktop](redesign-ux-audit-2026-09/12-gallery-desktop-light.jpg) · [mobile](redesign-ux-audit-2026-09/12-gallery-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/12-gallery-desktop-dark.jpg) | T-23 deferred (credit at upload T-22 done) |
| 6 | Contribute | **Live** | `/contribute/media` | [desktop](redesign-ux-audit-2026-09/23-contribute-media-desktop-light.jpg) · [mobile](redesign-ux-audit-2026-09/23-contribute-media-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/23-contribute-media-desktop-dark.jpg) | T-24 done |
| 7 | Stay | **Not built**, 404 | `/stay` → 404; hotels still at `/directory/hotels` | [404](redesign-ux-audit-2026-09/11-missing-stay-route-desktop-light.jpg) · [hotels](redesign-ux-audit-2026-09/03-directory-hotels-desktop-light.jpg) | T-21 deferred |
| 8 | Map | **Live** | `/map` | [desktop](redesign-ux-audit-2026-09/16-map-desktop-light.jpg) · [mobile](redesign-ux-audit-2026-09/16-map-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/16-map-desktop-dark.jpg) | T-25–T-27 done |

Cross-cutting items are all done: Slate palette (T-11, T-12), button contrast (T-13), logo (T-14), town foreign key (T-01–T-05, T-09). Still deferred: removing the `Town` category (T-15; `/directory/towns` renders empty), retiring the timeline (T-16), and E2E coverage (T-29–T-31).

---

## 3. Route-by-route audit

No route overflows horizontally at 390px (measured `scrollWidth − innerWidth = 0` on every capture).

### 3.1 Home `/`

![Home, desktop](redesign-ux-audit-2026-09/01-home-desktop-light.jpg)

[mobile](redesign-ux-audit-2026-09/01-home-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/01-home-desktop-dark.jpg)

**What's on it:**
- A full-viewport hero on `hero.jpg`: "Discover the Soul of Brava", a search box (the only place site-wide search is mounted) and a "Start Exploring Brava" CTA
- A Featured Heritage spotlight
- The "What is NosIlha?" pillars: Media, Places, Community
- An interactive-map teaser
- An Instagram feed section
- A newsletter CTA and the footer

**Against direction C:**
- **Invented or unheld claims.** The hero body says "we preserve oral histories", which the archive doesn't hold. The map teaser advertises "3D map layers stories", "QR Hiking Trails" and "story pin", none of which exist. The Featured Heritage card carries a "New Content" pill on static content.
- **Banned asset.** The map teaser uses the cartoon island illustration the handoff says not to use.
- **Restless decoration.** The hero has a Ken Burns zoom, an infinite mist loop and film grain (`components/landing/hero-section-new.tsx`).
- **Credit missing.** `hero.jpg` is shown without its credit strip ("NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded").
- **Handoff sections absent.** None of these exist yet: the photograph row, the routing strip, the empty-settlements list.
- **Wasted fetch.** `home-page-content.tsx` fetches directory entries and discards them.

**Keep for the redesign:** hero search. It is the only entry point to unified search (Pagefind content plus directory). If the hero changes, search needs a new home, most likely the nav.

### 3.2 Directory `/directory`, `/directory/[category]`

[directory](redesign-ux-audit-2026-09/02-directory-desktop-light.jpg) · [hotels](redesign-ux-audit-2026-09/03-directory-hotels-desktop-light.jpg) · [heritage](redesign-ux-audit-2026-09/04-directory-heritage-desktop-light.jpg) · [towns (empty)](redesign-ux-audit-2026-09/05-directory-towns-desktop-light.jpg)

![Towns category, empty](redesign-ux-audit-2026-09/05-directory-towns-desktop-light.jpg)

- **Features present:**
  - search
  - town filter (built from the current page only)
  - sort defaulting to **"Top Rated"**
  - grid / list toggle
  - map link
  - pagination
  - "Add Location" CTA
- **Cards:** a star badge and "N reviews" on every category, so a church reads "0 reviews".
- **Category slugs still include `towns`, `viewpoints`, `trails`, `churches` and `ports`,** but live data has only Heritage (3), Hotel (4) and Nature (1). `/directory/towns` renders "No listings found in the "Towns" category." That is the T-15 leftover.
- **Hotels sit in the heritage directory.** They have not been split out to `/stay`.
- **The empty state is a grey search circle,** with "Please try another category or check back later". This is the generic prompt direction C replaces.
- **Design decision needed:** once Settlements and Stay exist, what is `/directory` for? The recommendation in §6 is that it becomes the place-records index, grouped by settlement.

### 3.3 Place record `/directory/[category]/[slug]`

| Heritage (Igreja) | Hotel (Pensao Paulo) |
|---|---|
| ![Igreja](redesign-ux-audit-2026-09/06-entry-igreja-heritage-desktop-light.jpg) | ![Pensao Paulo](redesign-ux-audit-2026-09/08-entry-pensao-hotel-desktop-light.jpg) |

Also: [Casa Eugenio Tavares](redesign-ux-audit-2026-09/07-entry-casa-heritage-desktop-light.jpg) · [Faja d'Agua (Nature)](redesign-ux-audit-2026-09/09-entry-faja-nature-desktop-light.jpg) · [Igreja dark](redesign-ux-audit-2026-09/06-entry-igreja-heritage-desktop-dark.jpg) · [mobile](redesign-ux-audit-2026-09/06-entry-igreja-heritage-mobile-light.jpg)

**What's on it:**
- A parallax hero, with "No image available" on 7 of 8 entries
- A floating action rail: share, copy link, four reactions, print, suggest
- Description
- "Explore Related Heritage" cards
- An entry gallery
- "User Reviews"
- An inline "Contribute Photos" block
- A sidebar with an empty map-pin box and amenities

**Against direction C:**
- **Ratings are unguarded in the UI.** The backend now returns `rating: null` for non-accommodation records, but the template still renders **"User Reviews — N/A · ☆☆☆☆☆ · Based on 0 reviews"** on the church.
- **Unknown fields are omitted, not asked.** A Heritage or Nature record renders no field grid at all. The backend already returns `completeness { documented, total, missingFields }` and `coincidentWith`, but the frontend type doesn't declare them.
- **Inline sign-in gate.** "Sign in to Contribute Photos" is the gate pattern `/contribute/media` removed. Two upload entry points now behave differently.
- **Wrong section label.** The hotel page's related section is titled "Explore Related **Heritage**" and lists hotels.
- **No map.** The sidebar map panel is an icon placeholder.
- **Coincident records unmarked.** The two records at 14.873 N, 24.732 W carry no note.
- **Broken back link.** It uses the singular category (`/directory/hotel`), which does not match the plural route.

### 3.4 Gallery `/gallery` (handoff: Photographs)

![Gallery, desktop](redesign-ux-audit-2026-09/12-gallery-desktop-light.jpg)

[mobile](redesign-ux-audit-2026-09/12-gallery-mobile-light.jpg) · [dark](redesign-ux-audit-2026-09/12-gallery-desktop-dark.jpg) · [map view](redesign-ux-audit-2026-09/13-gallery-map-view-desktop-light.jpg) · [timeline view](redesign-ux-audit-2026-09/14-gallery-timeline-view-desktop-light.jpg) · [photo detail](redesign-ux-audit-2026-09/15-photo-detail-desktop-light.jpg)

**What's on it:**
- Dark header "Brava Media Center", with Surprise Me and Add to Archive buttons
- Photos / Videos tabs, search, and a grid / timeline / map view switch
- Era and category selects
- Photo of the Day, This Week's Discoveries, the masonry grid, and "Load More"

**Observed:**
- **Counts disagree on one screen.** The header reads "Exploring **26** items from 2 contributors". The tabs read Photos **(16)** + Videos **(8)** = 24. "Load More" reads "showing 16 of 26". The timeline reads "**26 photos** across all eras", which counts films as photos.
- **Map view silently rewrites counts.** It shows "Exploring 11 items", Photos (11), Videos (0). The 15 records without coordinates, and every film, disappear with no explanation.
- **Titles are invented.** The grid synthesises "Landscape — March 2026" and "Brava Island — March 2026" from the *upload* date.
  - Weekly Discoveries prints raw storage keys (`c264a2a6-95f2-4bcc-9fa1-ac3…`).
  - Photo of the Day is a **film** labelled "Photo of the Day · March 2026".
- **The photo detail page's headline is the raw storage key.** It reads `18b5d130-091e-43f7-bf36-b8b6caf6eff7-DJI_0177.JPG`.
- **Credits fall back to two different strings.** "Community Contributor" in `gallery-mappers.ts` and "Anonymous" in `masonry-photo-grid.tsx`. That is two answers for "not recorded".
- **Two grid images are broken** (the R2 objects for `DJI_0155.JPG` and `DJI_0047.JPG`). The browser shows their alt text instead.
- **Timeline renders but has nothing to sort.** Pre-1975 0, 1975–1990 0, 1990–2010 0, 2010+ 26.

![Timeline view](redesign-ux-audit-2026-09/14-gallery-timeline-view-desktop-light.jpg)

### 3.5 Photo detail `/gallery/photo/[id]`

![Photo detail](redesign-ux-audit-2026-09/15-photo-detail-desktop-light.jpg)

[mobile](redesign-ux-audit-2026-09/15-photo-detail-mobile-light.jpg)

**What's on it:**
- Full-bleed image with a side panel: category, date taken (from EXIF), camera, share, View Full Size, and **Help Identify**
- "Help Identify" opens a form suggesting title, location and date, which is posted as a suggestion

This page is the closest existing surface to direction C's "every blank asks a question". It needs:
- an "Untitled" title instead of the storage key
- visible "photographer — not recorded" and "place — not recorded" rows

### 3.6 Map `/map`

| Settlement selected | Place records mode, coincident pair |
|---|---|
| ![Settlement selected](redesign-ux-audit-2026-09/40-map-settlement-selected-desktop-light.jpg) | ![Coincident ring](redesign-ux-audit-2026-09/42b-map-coincident-fan-open-desktop-light.jpg) |

| Mobile, initial | Mobile bottom sheet | 3D terrain | Satellite |
|---|---|---|---|
| ![](redesign-ux-audit-2026-09/45-map-initial-mobile-light.jpg) | ![](redesign-ux-audit-2026-09/46-map-bottom-sheet-mobile-light.jpg) | ![](redesign-ux-audit-2026-09/43-map-3d-terrain-desktop-light.jpg) | ![](redesign-ux-audit-2026-09/44-map-satellite-desktop-light.jpg) |

Also: [place records mode](redesign-ux-audit-2026-09/41-map-place-records-desktop-light.jpg) · [coincident ring before click](redesign-ux-audit-2026-09/42-map-coincident-ring-desktop-light.jpg) · [dark](redesign-ux-audit-2026-09/16-map-desktop-dark.jpg)

**Works as specified:**
- Settlements 25 / Place records 8 modes
- Pin colour by documentation status
- Legend strip: documented 1 · records, no photograph 2 · name only 22
- The two Faja d'Agua records appear as a dashed "2" ring ("2 records at one point") that fans out when clicked
- 3D defaults off

**Gaps against the handoff and direction C:**
- **Detail card.** The handoff wants name, meta, description, a status line and two actions. Production shows description only; settlements get **no action**, because `/[town]` does not exist.
- **Category pills.** Place-records mode lists All, Towns, Nature, Beaches, Viewpoints, Trails, Churches, Historic, Dining, Ports and Stay, which is eleven filters for three categories that hold records.
- **Placeholder icons.** Sidebar cards are grey icon boxes; every settlement uses the same building icon and reads "TOWN".
- **Mobile bottom sheet.** At peek height it shows only name and "TOWN" over empty space.
- **Legend overlap.** The dev-tools badge covers the first legend item (dev-only).
- **Controls the handoff never mentions:** fly-to-random, satellite toggle, show/hide all pins, orbit animation, reset view. See §5.

### 3.7 Contribute `/contribute/media` (live)

![Contribute, dark](redesign-ux-audit-2026-09/23-contribute-media-desktop-dark.jpg)

[light](redesign-ux-audit-2026-09/23-contribute-media-desktop-light.jpg) · [mobile](redesign-ux-audit-2026-09/23-contribute-media-mobile-light.jpg)

Matches the handoff:
- Four annotated inputs: `photographer_credit`, `archive_source`, `location_name`, `approximate_date`
- Vague-date placeholder
- Permission checkbox
- Dropzone copy and "What happens next"
- Ordered validation, starting at "Name the photographer to continue"
- "Sign-in happens at the end, not before the form"

**Residual issues:**
- **Film links lose metadata.** The "Or give a film link instead" path drops place and date.
- **Success screen is off-direction.** "Archive Updated" is set in bold, which conflicts with Fraunces-never-bold.
- **Helper rows missing.** The handoff's "Other ways to help" rows are absent.
- **Duplicate `h1`** in the DOM.

### 3.8 Contribute hub and other forms

[hub](redesign-ux-audit-2026-09/22-contribute-desktop-light.jpg) · [directory form](redesign-ux-audit-2026-09/24-contribute-directory-desktop-light.jpg) · [story form](redesign-ux-audit-2026-09/25-contribute-story-desktop-light.jpg)

**Not in the handoff; each needs design.**

The hub:
- Headline "Together, We Build Something Beautiful"
- Copy "the most comprehensive guide" and "High-resolution images preferred", which contradicts "a phone photograph of a print is fine"
- A "Share Local Stories → Explore Stories" card pointing at the descoped story form
- None of the handoff's "Other ways to help" rows

The directory form ("Documenting Brava's Landscape"):
- Keeps a **hard sign-in gate**
- Placeholders invent values ("e.g., Pensão Sodade")
- Writes free-text town instead of `town_id`

The story form is descoped but still live and gated.

### 3.9 Culture: `/history`, `/people`, `/music`, `/traditions`

[history](redesign-ux-audit-2026-09/17-history-desktop-light.jpg) · [people](redesign-ux-audit-2026-09/18-people-desktop-light.jpg) · [Eugénio Tavares](redesign-ux-audit-2026-09/19-people-eugenio-tavares-desktop-light.jpg) · [/music 404](redesign-ux-audit-2026-09/20-music-desktop-light.jpg) · [/traditions 404](redesign-ux-audit-2026-09/21-traditions-desktop-light.jpg)

**Not in the handoff at all, but it is a top-level nav item ("Culture").**
- **`/history`** is a 9,000px page built from a TypeScript module, not MDX:
  - hero is `banner1-opt.jpg`, the AI mural the handoff bans
  - rounded statistics ("~6,000", "250+")
  - the 1907 Furna postcard shown with no credit
- **`/people`** shows "Coming Soon · Research in Progress · **Expected: Q1 2026**", a date that has passed, because both people MDX files are drafts. The article still renders at its direct URL.
- **Music and traditions** have MDX content (`morna-origins`, `funana-traditions`, `batuku`) but **no routes**. The sitemap advertises `/music`.

![People](redesign-ux-audit-2026-09/18-people-desktop-light.jpg)

### 3.10 Auth, account, static pages

[login](redesign-ux-audit-2026-09/26-login-desktop-light.jpg) · [signup](redesign-ux-audit-2026-09/27-signup-desktop-light.jpg) · [profile](redesign-ux-audit-2026-09/33-profile-desktop-light.jpg) · [settings](redesign-ux-audit-2026-09/34-settings-desktop-light.jpg) · [stories](redesign-ux-audit-2026-09/28-stories-desktop-light.jpg) · [about](redesign-ux-audit-2026-09/29-about-desktop-light.jpg) · [contact](redesign-ux-audit-2026-09/30-contact-desktop-light.jpg) · [privacy](redesign-ux-audit-2026-09/31-privacy-desktop-light.jpg) · [terms](redesign-ux-audit-2026-09/32-terms-desktop-light.jpg)

- **Login and signup:**
  - split panel, "Welcome back to the soul of Brava."
  - `auth-form.tsx` still has the `animate-pulse` blur orbs the handoff says had gone
  - "Forgot password?" links to a route that doesn't exist
- **Profile:** stats hardcoded to 0; "Joined: Recently".
- **Settings:** has "When my story is published" notifications (a descoped feature) and "Coming Soon" pills.
- **Stories (descoped):** still reachable by URL. Linked from the footer ("Share a Memory"), mobile More ("Contribute a Story") and the contribute hub.
- **About:** uses `community-collaboration.jpg`, the plasticine stock image the handoff bans, and a "100% Open Source" stat tile.
- **Contact:** promises response times ("24–48 hours").
- **Privacy and Terms:** "Last Updated" is the render date, not a real date. The footer says "Terms of Service" but the page is "Community Guidelines".

### 3.11 Global chrome

- **Desktop nav:** Home · Culture (History, Historical Figures) · Directory · Media · Map. There is **no public Contribute entry**, and no Settlements or Stay.
- **Mobile:** a bottom nav with More → Media, "Contribute a Story", account, theme. The footer renders only at `lg` and up.
- **Footer contribution link is "Share a Memory", which goes to the descoped story form.** The funnel direction C depends on, `/contribute/media`, is not linked from nav, footer or mobile More.
- **Theme:** a system / light / dark toggle cycles in the nav.

---

## 4. Preserve list: gallery and media

**Keep** = carry forward as is. **Adapt** = keep the capability, reshape it for direction C. **Retire** = remove the surface; the backend may stay.

| Feature | What it does | Backend | Works today? | Recommendation |
|---|---|---|---|---|
| Masonry photo grid | Browses photos with Load More | `GET /api/v1/gallery` (paged, filterable) | Yes (2 broken R2 images) | **Adapt**. Becomes the Photographs tile grid. Keep real thumbnails; tiles read "Untitled" plus pills for missing fields |
| Synthesised titles ("Landscape — March 2026") | Replaces filenames with category plus upload month | Client only (`lib/gallery-mappers.ts` `humanizeTitle`) | Yes, and wrong | **Retire**. The handoff bans it: the date is the upload date, not the capture date |
| Photos / Videos tabs | Splits media type | Client filter | Counts disagree with header | **Adapt** into the Photographs / Films chips with live counts. Reconcile the 26 vs 24 first |
| Era filter and Timeline view | Decade buckets | `GET /api/v1/gallery/timeline` | Renders, 0 / 0 / 0 / 26 | **Retire** (T-16). A future chronology should sort on `approximate_date` |
| Map view (`?view=map`) | Clustered photo pins with popup and "show on map" | `GET /api/v1/gallery?hasGeo=true`; shares `BaseMap` and clustering with `/map` | Yes; silently drops 15 records | **Keep and adapt**. State "15 records have no place, see No place" instead of rewriting the tab counts |
| Category filter | Landscape / Culture / Nature | `GET /api/v1/gallery/categories` | Yes; 8 of 26 have no category | **Adapt** to a secondary control. Uncategorised must be countable, not hidden |
| Full-text search | Searches photos and films | Postgres `search_vector` | Yes | **Keep** |
| Surprise Me | Opens a random record | `GET /api/v1/gallery/random` | Yes | **Adapt**. Consider "show me a record that needs help" (random from No place / No credit) |
| Photo of the Day | Daily seeded featured item | `GET /api/v1/gallery/featured` | Shows a film labelled as a photo | **Adapt or retire**. A rotating spotlight pads a 26-record archive. If kept, feature a record plus its missing question |
| This Week's Discoveries | Weekly seeded strip | `GET /api/v1/gallery/weekly` | Prints raw storage keys | **Retire the strip, keep the endpoint.** Its job overlaps the home photograph row |
| Video archive and featured video hero | Film grid, category chips, hero set via `?video=` | `GET /api/v1/gallery/videos/featured`; admin `featured` flag | Yes; no film has a duration | **Keep**. Films are 9 of 26. Tiles say "length not recorded" |
| YouTube facade | Click-to-load embed (no third-party load until play) | — | Yes | **Keep**. Performance and privacy win, invisible to design |
| Photo detail page | Full view, EXIF date and camera, share, full size | `GET /api/v1/gallery/{id}` | Headline is the storage key | **Keep and adapt**. "Untitled"; show credit, place and date as known values or questions |
| Help Identify | Suggest title, place, date | `POST /api/v1/suggestions` (`PHOTO_IDENTIFICATION`) | Yes; lands in admin review, doesn't write back to `gallery_media` | **Keep**. This is direction C's "every blank asks a question" already built. Consider linking each missing-field pill to it |
| `/contribute/media` | Credited upload, sign-in at submit | `POST /upload/presign`, `/upload/confirm`, `/submit` | Yes | **Keep** (handoff screen 6) |
| Film-link submission | YouTube/Vimeo URL instead of a file | `POST /api/v1/gallery/submit` | Yes; no place or date | **Adapt**. Add place and approximate date |
| EXIF extraction and GPS privacy tiering | Reads date, GPS and camera at upload; coarsens GPS by photo type | `usePhotoUpload.ts`, `lib/gps-privacy.ts` | Yes (source of the 11 coordinates and 12 dates); failure is silent | **Keep**. The form could say what EXIF found ("the file says July 2024; is that right?") |
| Credit-platform detection | Live badge while typing "@handle" | `CreditParser` on the server | Yes | **Keep** |
| Credit display | Credit as social link or text | `photographerCredit`, `creditPlatform`, `creditHandle` | 0 of 26 credited, so every tile shows a fallback | **Adapt**. One fallback: "photographer not recorded" |
| Entry-page gallery | Photos linked to a place record | `GET /api/v1/gallery/entry/{entryId}` | Yes; 0 linked today | **Keep**. It becomes "Photographs of this place" on the place record |
| Entry-page "Contribute Photos" | Inline uploader | Same presign/confirm | Sign-in gate | **Adapt**. Route to `/contribute/media` with the place prefilled; sign in at submit |

## 5. Preserve list: map

| Feature | What it does | Works today? | Handoff mentions? | Recommendation |
|---|---|---|---|---|
| Supercluster clustering and cluster expand | Numbered clusters below zoom 14, click to zoom | Yes | Yes ("use MapLibre clustering") | **Keep** |
| Coincident-record fan | Dashed "N records at one point" ring that fans out | Yes ([ring](redesign-ux-audit-2026-09/42-map-coincident-ring-desktop-light.jpg)) | Yes (required) | **Keep** |
| Documentation-status pin colour | Green / muted yellow / ochre | Yes | Yes | **Keep**. Values must stay hex (inline alpha tints depend on it) |
| Legend strip | Status, label, live count | Yes | Yes | **Keep** |
| Settlements / Place records modes | Swaps dataset and sidebar | Yes | Yes | **Keep** |
| Category pills (Place records) | 11 filters | Yes; 8 have zero records | No | **Adapt**. Show only categories with records, or replace with status filters (documented / partial / name only) |
| Sidebar search | Filters by name, description, tags | Yes | No | **Keep** |
| Sidebar list cards | Icon or thumbnail, name, category, Fly to | Yes; grey icon placeholders | No | **Adapt**. Status dot plus settlement eyebrow; no grey placeholder box |
| Desktop detail card | Name, category, description, "View Details" | Yes; settlements have no action | Yes (side panel with status line and two actions) | **Adapt** to the handoff panel. Needs `/[town]` to exist |
| Mobile bottom sheet | Peek (150px) and expanded (60vh), drag to dismiss | Yes; peek is mostly empty | No | **Keep and adapt**. Put the status line in the peek state |
| 3D terrain toggle | Pitch plus DEM exaggeration (terrain only in satellite view) | Yes, defaults off | Yes ("keep, default off") | **Keep** |
| Satellite / street toggle | Base style switch | Yes | No | **Keep**. Terrain depends on it |
| Orbit animation (desktop) | Continuous camera rotation | Yes | No | **Retire**. Same reason the intro was cut: restless decoration |
| Fly to random | Jumps to a random location | Yes | No | **Adapt or retire**. Optionally "take me somewhere with nothing recorded" |
| Show / hide all pins | Layer visibility | Yes | No | **Retire**. The two modes cover it |
| Reset view, zoom, geolocate | Standard controls | Yes | No | **Keep** |
| Illustration overlay mode | Cartoon island image | Feature-flagged off, still wired | Bans the image | **Retire** (dead path) |
| `zone-fills` click to fit bounds | Polygon click | Orphaned, no layer exists | No | **Retire** (dead code) |
| URL / deep-link state | — | **Missing**; mode, selection and search are not in the URL | No | **Add**. The settlement detail map panel and "show on map" links need it |
| Recovery boundary and Activity lifecycle handling | Survives route restore under `cacheComponents` | Yes | No | **Keep**. Engineering constraint; see appendix C |

---

## 6. Where the handoff conflicts with what exists

Building the prototype literally would remove or break the following. Each has a proposed resolution for design to confirm.

1. **The Photographs screen replaces the whole gallery page.**
   - The prototype has chips plus tiles. Production also has search, Surprise Me, Photo of the Day, Weekly Discoveries, the video archive with its hero, the map view and category filters.
   - *Proposal:* the Photographs screen becomes `/gallery`.
     - Keep search, the map view (as a view of the same filtered set) and the film archive.
     - Retire Weekly Discoveries, the synthesised titles and the timeline.
     - Rethink Photo of the Day as "a record that needs you".
2. **The place-record grid replaces the entry detail page.**
   - The prototype has no reactions rail, related entries, entry gallery, reviews block or inline uploader.
   - *Proposal:*
     - Related entries → "Also recorded in {settlement}".
     - The entry gallery stays as "Photographs of this place".
     - Reviews render only through the accommodation guard (§3.3).
     - The inline uploader becomes a link into Contribute.
     - Reactions and share/print need a design decision. The engagement backend exists, but reactions sit at zero; a quiet footer row is suggested.
3. **Settlements and Stay versus `/directory`.**
   - The directory has filters, a Top Rated sort, grid/list, map link and "Add Location". The prototype has no directory.
   - *Proposal:*
     - `/directory` becomes the place-records index, grouped or filtered by settlement.
     - Hotels move to `/stay`.
     - Drop the rating sort outside Stay.
     - "Add Location" becomes a specific question.
     - Retire `/directory/towns` (T-15).
4. **Map side panel versus the existing sidebar and bottom sheet.**
   - The prototype shows one side panel. Production has a sidebar list with search and pills, a floating detail card on desktop, and a bottom sheet on mobile.
   - *Proposal:* keep the sidebar and bottom sheet as containers, and put the handoff panel's content (status line, two actions) inside them.
5. **Home.**
   - The prototype removes hero search, the map teaser, Instagram and the newsletter.
   - *Proposal:*
     - Search moves to the nav.
     - The map teaser is replaced by the routing strip.
     - Instagram and newsletter need a decision. Newsletter signup also lives in the footer.
6. **Screens the handoff doesn't cover.** Design direction is needed for:
   - Culture (history, people, and music/traditions with no routes)
   - The contribute hub and the directory form
   - Auth pages
   - About / contact / legal
   - Profile / settings
   - The 404 page
   - Nav and footer, which have no Contribute entry and no Settlements or Stay

---

## 7. Open questions

**Inherited from the handoff**
1. **Portrait provenance.** `eugenio-tavares.jpg` and `adelina-domingues.jpg` have no credit. This blocks publishing those images, not the screens.
2. **Where `hero.jpg` was taken.** The photographer is known; the place is not.
3. **Real `gallery_media` rows.** The header / tab disagreement is still there (26 vs 16 + 8). Reconcile before any count is shown as fact.

**Settled by spec 033:** the `Faja d'Agua` three-way record. `faja-de-agua` is the settlement; the Nature entry and Nos Raiz are place records linked to it.

**New in this audit**
4. **YouTube sync state.** Locally `youtube_sync_config.enabled = true` (updated 2026-03-09). The handoff says "disabled in configuration". The Photographs panel copy must read the live value, and production needs checking.
5. **Titles.** Two uploads carry real titles ("Lomba Tantun", "Pedrinha Brava") and the nine films carry their YouTube titles. The handoff line "not one of the 26 has a title" is no longer true. The Untitled rule still applies, but the sentence stating it must be computed.
6. **Handoff counts to recompute.**
   - Settlements 16 → **25**
   - Name only 13 → **22**
   - "Has records" 3 is unchanged
   - "No place" 15 and "No date" 14 still match live data
   - "No credit" 26 still matches
7. **What `/directory` becomes** once Settlements and Stay exist (§6.3).
8. **Culture in the information architecture.** The history, people, music and traditions content has no place in the eight-screen prototype.
9. **The contribution entry point in the nav.** Direction C calls Contribute "the conversion surface", but it isn't linked from anywhere a visitor would look.

---

## 8. Brief for Claude Design

Paste one block per screen alongside the handoff README. Every block assumes these shared rules:
- Slate palette and the role map (primary = actions; ochre = "missing"; green = documented; muted yellow = partial)
- Fraunces 400, never bold
- Outfit for UI
- Mono for filenames, coordinates and column names
- Copy rules: never invent a value; every blank asks a specific question; say the true number, including zero; never open a sentence with a numeral
- Use existing components: `PageHeader`, `AnimatedButton`, `FilterChip`, `DirectoryCard`, `ListViewCard`, `LocationCard`, `Checkbox`, `Input`, `NosilhaLogo`, `StatusDot`, `DashedEmptyState`

**Archive home.**
- Build handoff screen 1: credited hero, photograph row, routing strip, empty-settlements list.
- *Must keep:* an entry to site search (move it to the nav), a newsletter path (footer is enough), and a link into Contribute.
- *Remove:* Ken Burns and mist animation, the cartoon map teaser, the "QR Hiking Trails" and "story pin" claims, "New Content".
- *Data:* 25 settlements — 1 documented, 2 partial, 22 name only.

**Settlements index.**
- 25 cards, status from `GET /api/v1/towns/status-summary`, chips All / Has records / Nothing yet with live counts.
- Nine of the 25 have no population, elevation or founded date. Design the meta row for "not recorded".

**Settlement detail `/[town]`.**
- Handoff screen 3.
- *Must include:* a map panel that deep-links into `/map` with the settlement selected (new URL state), and "Photographs of {name}" (0 everywhere today).
- The dashed empty state is the main state: 22 of 25 settlements have nothing.

**Place record.**
- Handoff screen 4, driven by the API's `completeness { documented, total, missingFields }` and `coincidentWith`.
- *Must keep:* the entry photo gallery; related records, reframed as "also recorded in {settlement}"; share.
- *Decide:* reactions and print.
- *Remove:* "User Reviews" on anything but accommodation; the inline sign-in gate; grey "No image available" heroes.
- Two records share a coordinate, so show the note.

**Photographs.**
- Handoff screen 5 as `/gallery`.
- *Must keep:* search; map view, over the same filtered set, stating what it can't show; film archive and featured film; photo detail page with Help Identify; category as a secondary filter.
- *Remove:* synthesised titles, the storage-key headline, Weekly Discoveries, the timeline and era filter.
- *Rethink:* Photo of the Day and Surprise Me as "a record that needs help".
- *Data:* 26 records — 17 photographs, 9 films. 15 without place, 14 without date, 26 without credit. 0 films with a duration. 2 uploads and 9 films have titles.

**Contribute.**
- Live. Extend with the "Other ways to help" rows, place and date on the film-link path, and a non-bold success screen.
- *Also design:* the hub `/contribute` (replace the stories card and "High-resolution images preferred") and the place-record form (no hard gate; a settlement picker writing `town_id`).

**Stay.**
- Handoff screen 7 over the 4 Hotel records. The only surface with ratings ("Not yet rated").

**Map.**
- Live. Adapt the detail card and bottom-sheet peek to the handoff panel (status line plus two actions).
- Replace the eleven category pills with categories that have records, or with status filters.
- Settlement icon and eyebrow instead of "TOWN".
- *Keep:* clustering, fan, legend, modes, search, 3D (off by default), satellite, reset, zoom, geolocate.
- *Retire:* orbit animation, show/hide all pins, illustration mode.

**Not in the handoff; needs direction.**
- Culture section: history, people, music/traditions
- Auth pages (drop the pulsing orbs)
- About (drop the plasticine stock image)
- Legal pages (a real "last updated" date)
- Profile / settings (remove story notifications)
- 404
- Nav and footer (add Contribute, Settlements, Stay; repoint "Share a Memory")

---

## Appendix A — Live data snapshot (2026-09-13, local)

| Measure | Value | Source |
|---|---|---|
| Settlements (`towns`) | 25 — documented 1 (Nossa Senhora do Monte), partial 2 (Nova Sintra 5 records, Faja d'Agua 2), name only 22 | `GET /api/v1/towns/status-summary` |
| Place records | 8 — Hotel 4, Heritage 3, Nature 1. With `imageUrl`: 1 (Igreja). All carry `townId` | `GET /api/v1/directory/entries?size=100` |
| Gallery media | 26 ACTIVE — `USER_UPLOAD` 17, `EXTERNAL` 9 | `GET /api/v1/gallery?size=100`; `gallery_media` |
| With coordinates | 11 | API |
| With `location_name` / `entry_id` | 0 / 0 | API |
| With `photographer_credit` | 0 | API and database |
| With `date_taken` (EXIF) / `approximate_date` | 12 / 0 | API |
| With description / alt text | 11 / 0 | API |
| Titles that are raw filenames | 15 (all uploads except "Lomba Tantun", "Pedrinha Brava") | API |
| Films with `duration_seconds` | 0 of 9 | database |
| Categories | Landscape 16, Culture 1, Nature 1, none 8 | API |
| Timeline buckets | Pre-1975 0 · 1975–1990 0 · 1990–2010 0 · 2010+ 26 | `GET /api/v1/gallery/timeline` |
| YouTube sync | `enabled = true`, updated 2026-03-09 | `youtube_sync_config` |
| Gallery UI counts | Header "26 items from 2 contributors"; tabs Photos 16 / Videos 8; map view "11 items", Photos 11 / Videos 0; timeline "26 photos across all eras" | Screenshots 12, 13, 14 |

Commands used (read-only):

```bash
curl -s localhost:8080/api/v1/towns/status-summary | jq -r '.data[].status' | sort | uniq -c
curl -s 'localhost:8080/api/v1/directory/entries?size=100' | jq -r '.data[].category' | sort | uniq -c
curl -s 'localhost:8080/api/v1/gallery?size=100' | jq '.data | map(select(.latitude!=null)) | length'
curl -s localhost:8080/api/v1/gallery/timeline
docker compose exec -T db psql -U nosilha -d nosilha_db \
  -c "select enabled, updated_at from youtube_sync_config;" \
  -c "select media_source, count(*), count(photographer_credit), count(duration_seconds) from gallery_media group by 1;"
```

## Appendix B — Admin and curator capabilities (code inventory, not screenshotted)

These don't appear in any public design, but the redesign's data flow depends on them. Moderation, credit and metadata edits, and hero promotion are how records move from "missing" to "documented".

| Capability | UI | Endpoint (`/api/v1/admin/gallery`) |
|---|---|---|
| Moderation queue (uploads and external) with approve / flag / reject and audit trail | `admin/gallery-queue` | `GET /queue`, `PATCH /{id}/status` |
| Edit metadata: title, description, category, credit, duration, featured video | `gallery-edit-modal.tsx` | `PATCH /{id}` |
| Re-extract EXIF | `exif-reextract-modal.tsx` | `POST /{mediaId}/update-exif` |
| Promote photo to a place record's hero image (event to places module) | queue item | `PATCH /{mediaId}/promote-hero` |
| Pick a gallery image for an entry form | `gallery-picker.tsx` | `GET /queue?status=ACTIVE` |
| AI analysis, single and batch; review AI title / alt / tags (AI title replaces a raw filename only) | `ai-review-queue.tsx`, `ai-review-detail-modal.tsx` | `POST /{mediaId}/analyze`, `POST /analyze-batch`; AI module |
| Admin-created external media; archive (soft delete) | — | `POST /external`, `DELETE /{id}` |
| R2 browse, bulk presign/confirm (auto-ACTIVE), orphan detect/link/delete | `admin/storage` | `GET /r2/list`, `POST /r2/bulk-presign`, `POST /r2/bulk-confirm`, `GET/POST/DELETE /r2/orphans…` |
| YouTube sync: config toggle, channel/playlist sync, saved playlists CRUD | `admin/youtube-sync` | `GET/PUT /youtube/config`, `POST /youtube/sync`, `/youtube/playlists…` |
| Map style sandbox | `admin/dev-tools/map` | — |

Public gallery endpoints (`/api/v1/gallery`):
- `GET /`
- `GET /{id}`
- `GET /entry/{entryId}`
- `GET /categories`
- `GET /random`
- `GET /videos/featured`
- `GET /featured`
- `GET /weekly`
- `GET /timeline`
- `POST /upload/presign`
- `POST /upload/confirm`
- `POST /submit`

## Appendix C — Engineering notes

**Frontend ignores new API fields.** `completeness`, `coincidentWith` and `townId` are in `DirectoryEntryDto`, but `apps/web/src/types/directory.ts` `BaseDirectoryEntry` lacks them. T-20 starts here.

**Dev console error on cached routes.** "Next.js encountered runtime data during prerendering or a navigation" (`cookies()`/`headers()`/`searchParams` accessed inside a cached scope) appears on:
- `/directory`
- `/directory/[category]/[slug]`
- `/gallery`
- `/gallery/photo/[id]`
- `/history`
- `/people/[slug]`

Not investigated in this audit.

**Broken links:**
- `sitemap.ts` emits `/directory/restaurant` and `/directory/hotel` (singular), `/music`, and root-level `/${slug}` MDX URLs.
- The entry-detail back link uses the singular category.
- `auth-form.tsx` links `/forgot-password`.

**Map constraints a redesign must respect:**
- Keep `maplibre-gl` on v5 (v6 breaks the worker under Turbopack).
- Pins must stay inside react-map-gl `<Marker>` (the `.maplibregl-marker` click guard and the fan's pixel offsets depend on it).
- Status colours must stay hex.
- `syncViewport` must run on load, or Supercluster renders no pins.
- The `map-desktop` custom breakpoint (`globals.css`) drives sidebar vs bottom sheet.

**Dead or unused code:**
- Illustration mode (`ENABLE_ILLUSTRATION_MODE = false`)
- The `zone-fills` click handler
- Landing components `community-stats-section`, `featured-stories-section`, `kriolu-proverb-card`, `weather-widget`, `hero-section.tsx`

**Broken R2 objects:** two grid images fail to load, `17f50951-…-DJI_0155.JPG` and `999f07e6-…-DJI_0047.JPG`.

**Capture method:** `playwright-cli` `run-code` in four parallel sessions, full-page JPEG at quality 72 after a scroll pass to trigger lazy content. Per route it recorded status, `h1`, broken images, console errors and horizontal overflow. Raw results were not committed.

## Appendix D — Capture index

Every screenshot in the folder. Full-page unless the route is immersive (map, photo detail) or an interaction state.

| # | Capture | Desktop light | Mobile light | Desktop dark | Mobile dark |
|---|---|---|---|---|---|
| 01 | home | [view](redesign-ux-audit-2026-09/01-home-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/01-home-mobile-light.jpg) | [view](redesign-ux-audit-2026-09/01-home-desktop-dark.jpg) | [view](redesign-ux-audit-2026-09/01-home-mobile-dark.jpg) |
| 02 | directory | [view](redesign-ux-audit-2026-09/02-directory-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/02-directory-mobile-light.jpg) | — | — |
| 03 | directory hotels | [view](redesign-ux-audit-2026-09/03-directory-hotels-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/03-directory-hotels-mobile-light.jpg) | — | — |
| 04 | directory heritage | [view](redesign-ux-audit-2026-09/04-directory-heritage-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/04-directory-heritage-mobile-light.jpg) | — | — |
| 05 | directory towns | [view](redesign-ux-audit-2026-09/05-directory-towns-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/05-directory-towns-mobile-light.jpg) | — | — |
| 06 | entry igreja heritage | [view](redesign-ux-audit-2026-09/06-entry-igreja-heritage-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/06-entry-igreja-heritage-mobile-light.jpg) | [view](redesign-ux-audit-2026-09/06-entry-igreja-heritage-desktop-dark.jpg) | [view](redesign-ux-audit-2026-09/06-entry-igreja-heritage-mobile-dark.jpg) |
| 07 | entry casa heritage | [view](redesign-ux-audit-2026-09/07-entry-casa-heritage-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/07-entry-casa-heritage-mobile-light.jpg) | — | — |
| 08 | entry pensao hotel | [view](redesign-ux-audit-2026-09/08-entry-pensao-hotel-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/08-entry-pensao-hotel-mobile-light.jpg) | — | — |
| 09 | entry faja nature | [view](redesign-ux-audit-2026-09/09-entry-faja-nature-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/09-entry-faja-nature-mobile-light.jpg) | — | — |
| 10 | missing town route | [view](redesign-ux-audit-2026-09/10-missing-town-route-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/10-missing-town-route-mobile-light.jpg) | — | — |
| 11 | missing stay route | [view](redesign-ux-audit-2026-09/11-missing-stay-route-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/11-missing-stay-route-mobile-light.jpg) | — | — |
| 12 | gallery | [view](redesign-ux-audit-2026-09/12-gallery-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/12-gallery-mobile-light.jpg) | [view](redesign-ux-audit-2026-09/12-gallery-desktop-dark.jpg) | [view](redesign-ux-audit-2026-09/12-gallery-mobile-dark.jpg) |
| 13 | gallery map view | [view](redesign-ux-audit-2026-09/13-gallery-map-view-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/13-gallery-map-view-mobile-light.jpg) | — | — |
| 14 | gallery timeline view | [view](redesign-ux-audit-2026-09/14-gallery-timeline-view-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/14-gallery-timeline-view-mobile-light.jpg) | — | — |
| 15 | photo detail | [view](redesign-ux-audit-2026-09/15-photo-detail-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/15-photo-detail-mobile-light.jpg) | — | — |
| 16 | map | [view](redesign-ux-audit-2026-09/16-map-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/16-map-mobile-light.jpg) | [view](redesign-ux-audit-2026-09/16-map-desktop-dark.jpg) | [view](redesign-ux-audit-2026-09/16-map-mobile-dark.jpg) |
| 17 | history | [view](redesign-ux-audit-2026-09/17-history-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/17-history-mobile-light.jpg) | — | — |
| 18 | people | [view](redesign-ux-audit-2026-09/18-people-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/18-people-mobile-light.jpg) | — | — |
| 19 | people eugenio tavares | [view](redesign-ux-audit-2026-09/19-people-eugenio-tavares-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/19-people-eugenio-tavares-mobile-light.jpg) | — | — |
| 20 | music | [view](redesign-ux-audit-2026-09/20-music-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/20-music-mobile-light.jpg) | — | — |
| 21 | traditions | [view](redesign-ux-audit-2026-09/21-traditions-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/21-traditions-mobile-light.jpg) | — | — |
| 22 | contribute | [view](redesign-ux-audit-2026-09/22-contribute-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/22-contribute-mobile-light.jpg) | — | — |
| 23 | contribute media | [view](redesign-ux-audit-2026-09/23-contribute-media-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/23-contribute-media-mobile-light.jpg) | [view](redesign-ux-audit-2026-09/23-contribute-media-desktop-dark.jpg) | [view](redesign-ux-audit-2026-09/23-contribute-media-mobile-dark.jpg) |
| 24 | contribute directory | [view](redesign-ux-audit-2026-09/24-contribute-directory-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/24-contribute-directory-mobile-light.jpg) | — | — |
| 25 | contribute story | [view](redesign-ux-audit-2026-09/25-contribute-story-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/25-contribute-story-mobile-light.jpg) | — | — |
| 26 | login | [view](redesign-ux-audit-2026-09/26-login-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/26-login-mobile-light.jpg) | — | — |
| 27 | signup | [view](redesign-ux-audit-2026-09/27-signup-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/27-signup-mobile-light.jpg) | — | — |
| 28 | stories | [view](redesign-ux-audit-2026-09/28-stories-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/28-stories-mobile-light.jpg) | — | — |
| 29 | about | [view](redesign-ux-audit-2026-09/29-about-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/29-about-mobile-light.jpg) | — | — |
| 30 | contact | [view](redesign-ux-audit-2026-09/30-contact-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/30-contact-mobile-light.jpg) | — | — |
| 31 | privacy | [view](redesign-ux-audit-2026-09/31-privacy-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/31-privacy-mobile-light.jpg) | — | — |
| 32 | terms | [view](redesign-ux-audit-2026-09/32-terms-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/32-terms-mobile-light.jpg) | — | — |
| 33 | profile | [view](redesign-ux-audit-2026-09/33-profile-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/33-profile-mobile-light.jpg) | — | — |
| 34 | settings | [view](redesign-ux-audit-2026-09/34-settings-desktop-light.jpg) | [view](redesign-ux-audit-2026-09/34-settings-mobile-light.jpg) | — | — |
| 40 | map settlement selected | [view](redesign-ux-audit-2026-09/40-map-settlement-selected-desktop-light.jpg) | — | — | — |
| 41 | map place records | [view](redesign-ux-audit-2026-09/41-map-place-records-desktop-light.jpg) | — | — | — |
| 42 | map coincident ring | [view](redesign-ux-audit-2026-09/42-map-coincident-ring-desktop-light.jpg) | — | — | — |
| 42b | map coincident fan open | [view](redesign-ux-audit-2026-09/42b-map-coincident-fan-open-desktop-light.jpg) | — | — | — |
| 43 | map 3d terrain | [view](redesign-ux-audit-2026-09/43-map-3d-terrain-desktop-light.jpg) | — | — | — |
| 44 | map satellite | [view](redesign-ux-audit-2026-09/44-map-satellite-desktop-light.jpg) | — | — | — |
| 45 | map initial | — | [view](redesign-ux-audit-2026-09/45-map-initial-mobile-light.jpg) | — | — |
| 46 | map bottom sheet | — | [view](redesign-ux-audit-2026-09/46-map-bottom-sheet-mobile-light.jpg) | — | — |

## Related

- [redesign-integration-review.md](redesign-integration-review.md) — 2026-08-31 review of five surfaces against the handoff
- `.claude-design/design_handoff_nos_ilha_redesign/README.md` — the handoff
- `plan/arkhe/specs/033-archive-redesign/` — spec, tasks, reuse matrix, wave context
- [design-system.md](design-system.md)
