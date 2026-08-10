# design-sync notes — Nos Ilha

Repo-specific gotchas for syncing this codebase to claude.ai/design.
Project: https://claude.ai/design/p/9c97c1f3-7812-4f66-8e27-14b91d0dcc9c

## Shape

- `shape: package`, but this is **not a package** — it's the Next.js app at `apps/web`.
  There is no `dist/` and no published entry.
- The bundle entry is a hand-written barrel: **`apps/web/.design-sync-entry.ts`**.
  It must live inside `apps/web` so the converter resolves `PKG_DIR` to that
  package rather than to the repo root (it walks up from `--entry` to the first
  `package.json` with a `name`).
- Without that barrel the converter falls back to synthesising an entry from
  *every* `.tsx` under `src/`, which drags in admin screens and server-only
  modules. Widen scope by editing the barrel **and** `componentSrcMap` together.

## Required prep before every build

Two generated inputs are gitignored and must be regenerated on a fresh clone:

1. **Compiled Tailwind CSS** → `apps/web/.ds-styles.css` (this is `cfg.cssEntry`)

   ```sh
   ./.ds-sync/node_modules/.bin/tailwindcss \
     -i .design-sync/tailwind-entry.css -o apps/web/.ds-styles.css --minify
   ```

   `globals.css` is only `@import "tailwindcss"` + the token tiers — it contains
   **no utility classes**. Shipping it raw gives every card the tokens and none
   of the layout. Rerun this after changing components, `globals.css`, or
   anything in `.design-sync/previews/` (the entry `@source`s all three).
   This is what `cfg.buildCmd` points at.

2. **Declaration tree** → `apps/web/ds-types/`

   ```sh
   cd apps/web && ./node_modules/.bin/tsc -p tsconfig.json \
     --emitDeclarationOnly --declaration --noEmit false \
     --outDir ds-types --declarationDir ds-types
   ```

   The converter's prop extractor reads **only `.d.ts` files** — it never looks
   at `.tsx`. With no declarations every contract emits as
   `{ [key: string]: unknown }`, which is what the design agent would code
   against. With the tree present, 37 of 50 components get real props plus
   their JSDoc.

   **The output directory must not start with a dot.** The extractor globs
   `apps/web/**/*.d.ts` through fast-glob, which skips dot-directories, so
   `.ds-types/` is silently invisible. It was renamed to `ds-types/` for
   exactly this reason.

   `velite.config.ts` emits TS4082/TS7056 errors during this run. They are
   confined to that one file and do not block emit — ignore them.

## Shims (`.design-sync/shims/`, wired through `cfg.tsconfig`)

`.design-sync/tsconfig.sync.json` is a resolution map used **only** by the
converter. Order matters — the path plugin takes the first matching rule, so
every exact-match entry precedes the `@/*` wildcard.

- `next-image` / `next-link` / `next-navigation` — the real modules need a Next
  runtime and app-router context. `usePathname()` returning null crashes any
  caller doing `pathname.startsWith(...)`.
- `supabase-client`, `env` — both read `process.env.NEXT_PUBLIC_*` at module
  scope. esbuild only defines `NODE_ENV`, so the rest reach the browser as
  literal `process.env.X` and throw `process is not defined`. That kills the
  **entire bundle** before `window.NosIlha` is assigned — every component goes
  blank, not just the importer. `@/lib/env` arrives via
  api-factory → use-bookmarks → BookmarkButton → DirectoryCard.
- **Barrel entries**: the converter's path plugin probes candidate extensions
  starting with `''` and accepts anything that merely *exists*, so a directory
  import like `@/components/ui/toast` resolves to the directory and esbuild
  fails with `Cannot read file …: is a directory`. Every `@/` import that
  resolves to a directory is pinned to its `index.ts`. Regenerate that list:

  ```sh
  node -e '
  const fs=require("fs"),path=require("path");const root="apps/web/src";const files=[];
  (function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
  if(e.isDirectory())w(p);else if(/\.(tsx?|jsx?)$/.test(e.name))files.push(p);}})(root);
  const dirs=new Set();
  for(const f of files)for(const m of fs.readFileSync(f,"utf8").matchAll(/from\s+["\x27](@\/[^"\x27]+)["\x27]/g)){
    try{if(fs.statSync(path.join(root,m[1].slice(2))).isDirectory())dirs.add(m[1]);}catch{}}
  console.log([...dirs].sort().join("\n"));'
  ```

## `MotionGlobalConfig.skipAnimations` — do not remove

`.design-sync/shims/preview-provider.tsx` sets this at module scope. It is the
single least obvious thing in this setup.

`package-capture.mjs` pins the page clock (`page.clock.setFixedTime(...)`) for
deterministic screenshots. Time never advances, so a framer-motion animation
never progresses past its first frame. Any component mounting with
`initial={{ opacity: 0 }}` and animating in — PageHeader, FeatureCard, the
gallery grids, **21 files import framer-motion** — screenshots at opacity 0 and
produces a silently blank card. No error, no console warning, and the component
renders perfectly if you open the same URL by hand.

`MotionConfig transition={{ duration: 0 }}` does **not** fix it: a zero-duration
transition still needs one frame to land, and under a frozen clock that frame
never comes. Only `skipAnimations` jumps straight to the target values.

## Provider

`cfg.provider` → `DsPreviewProvider`, which supplies:

- `QueryClientProvider` (retry off, infinite staleTime) — BookmarkButton calls
  `useIsBookmarked`/`useToggleBookmark`, so DirectoryCard and ListViewCard fail
  with "No QueryClient set" without it.
- `ToastProvider`.
- Deliberately **no** AuthProvider: the repo's own `useAuth()` falls back to the
  zustand `authStore` when the context is missing, which yields the signed-out
  state — the right default for a preview card.

## Fixtures

`.design-sync/fixtures/data.ts` — ported from `apps/web/src/lib/mock-api.ts` so
cards show real Brava content. Deliberately biased toward the empty-archive
cases per `docs/10-product/theme-palette-brief.md` §4.4.

It lives **outside** `.design-sync/previews/` on purpose: that directory is
scanned per component name, so a non-component file there reads as an orphan.

Photographs are downscaled from `apps/web/public/images` into
`.design-sync/fixtures/images.json` as data URIs. Regenerate:

```sh
node -e '
const sharp=require("./apps/web/node_modules/sharp"),fs=require("fs");
const jobs=[["apps/web/public/images/hero.jpg","LANDSCAPE",640,420],
["apps/web/public/images/directory/heritage/igreja-nossa-senhora-do-monte.jpg","HERITAGE",640,420],
["apps/web/public/images/people/eugenio-tavares.jpg","PORTRAIT",320,320]];
(async()=>{const o={};for(const[p,n,w,h]of jobs){
const b=await sharp(p).resize(w,h,{fit:"cover"}).jpeg({quality:62,mozjpeg:true}).toBuffer();
o[n]="data:image/jpeg;base64,"+b.toString("base64");}
fs.writeFileSync(".design-sync/fixtures/images.json",JSON.stringify(o));})();'
```

## Fonts

Outfit and Fraunces load through `next/font/google`, so nothing in the repo
ships an `@font-face`. `.design-sync/fonts/fonts.css` self-hosts both (SIL OFL,
unmodified Google builds, subset ranges intact) and is wired via
`cfg.extraFonts`.

It also carries a **cycle break**. `globals.css` declares the tokens
self-referentially:

```css
--font-sans: var(--font-sans), "Outfit", system-ui, sans-serif;
```

which only resolves because next/font defines `--font-sans` on `<html>` first.
Outside Next that is a cycle, both custom properties become guaranteed-invalid,
and every `font-sans`/`font-serif` utility falls back to the browser default —
the entire type system vanishes. The `:root:root` block (specificity 0,2,0)
outranks the `:root` that `@theme` emits, so it wins regardless of order.

## Scope

Scoped to the palette test cases in `docs/10-product/theme-palette-brief.md` §6.
Deliberately excluded:

- `admin/` (36 files) and `stories/` — out of scope per brief §8.
- `features/map/components/map-canvas.tsx` and `brava-map.tsx` — maplibre needs
  WebGL and live tiles, so a static card can only ever show an empty canvas.
  Map colour decisions belong in `palette.json`'s `map` group (brief §4.5).
- Catalyst compound sub-parts (`DialogTitle`, `DropdownItem`, …) ship in the
  bundle and are importable, but are not registered as their own cards — they
  are composed inside their parent's preview instead.

`AnimatedButton`, not Catalyst's `Button`, is the app's real primary action —
found by reading `app/(main)/design-system/_components/specimens/`, which is the
authority on what this design system actually is. Those specimen files are the
best composition source in the repo; port from them before inventing.

## Known render warns

_(none yet — populate as the authoring loop settles)_

## Re-sync risks

- **Both generated inputs above are gitignored.** A fresh clone with neither
  produces a bundle that is unstyled *and* has empty prop contracts, and the
  build still exits 0. Regenerate both first.
- `.design-sync/fixtures/images.json` inlines photographs that were copied, not
  referenced. If the source images in `apps/web/public/images` are replaced, the
  fixtures keep the old ones until regenerated.
- The barrel and `componentSrcMap` are two lists that must agree. A component
  added to only one silently does the wrong thing: barrel-only means it ships in
  the bundle with no card or contract; map-only means the card exists but the
  export is missing from `window.NosIlha`.
- `dtsPropsFor.AnimatedButton` is hand-written because framer-motion's
  `HTMLMotionProps<"button">` leaked ~400 inherited props into the contract.
  If AnimatedButton's real API changes, that entry must be updated by hand.
- Tailwind is pinned to 4.3.3 in `.ds-sync` to match `apps/web`. If the app
  upgrades Tailwind, bump it there too or the compiled CSS may diverge from
  what the app actually renders.

## Progress (first sync, 2026-08-10)

Verified, graded `good`, and uploaded — 16 of 50:

- **directory**: DirectoryCard, ListViewCard, FilterToolbar, ViewToggle
- **general**: AnimatedButton, PageHeader, Card, Banner, FilterChip, FilterBottomSheet
- **gallery**: MasonryPhotoGrid, TimelineView, FeaturedPhotoCard, CompactVideoCard,
  VideoGrid, MetadataBadges

Still on the floor card (importable and fully functional, preview not yet
authored) — 34: BookmarkButton, DirectoryCardSkeleton, DirectoryGridSkeleton,
LoadingSpinner, Toast, CitationSection, ExpandableText, CreditDisplay,
FeatureCard, StarRating, Pagination, TabGroup, Tooltip, NosilhaLogo, Select,
Textarea, MasonryPhotoGridSkeleton, Avatar, ConfirmationDialog, MobileBottomNav,
LocationCard, LocationDetailCard, LocationBottomSheet, CategoryPill, MapControls,
MapHeader, Button, Badge, Input, Checkbox, Dialog, Dropdown, Popover, Field.

Authoring one is self-contained: write `.design-sync/previews/<Name>.tsx`,
rebuild, `package-capture.mjs --components <Name>`, read the sheet, write
`.design-sync/.cache/review/<Name>.grade.json`, push. Grades already recorded
carry forward at zero cost.

### Per-component gotchas found so far

- **Overlays need their own containing block.** The preview card root is already
  a containing block for `position: fixed` *and* has zero height, so a
  `fixed inset-0` overlay resolves against a 0px box and lands off-card. Wrap
  the story in `<div className="relative overflow-hidden" style={{height: N,
  transform: "translateZ(0)"}}>` — the transform makes the wrapper the
  containing block. Needed for FilterBottomSheet; will also be needed for
  Dialog, Dropdown, Popover, ConfirmationDialog and LocationBottomSheet.
- **Wide/tall compositions need a `viewport` override**, not a smaller story.
  Default capture viewport is 900x700. TimelineView needed 1400 wide for four
  eras; DirectoryCard's mixed grid needed 1180 tall.
- **Check the real prop type before writing a fixture.** MetadataBadges' emitted
  contract said `metadata: any`; the truth is `PhotoMetadata`
  (`dateTimeOriginal` is a real `Date`, camera fields are `make`/`model`, and
  `gpsPrivacyLevel` is required). A wrong shape renders blank because the
  component returns `null`. Its real shape is now pinned in `dtsPropsFor`.

## Findings for the product team (not preview defects)

Real behaviours of the shipped components, surfaced by building the previews.
Worth raising independently of this sync.

1. **`ListViewCard` renders an empty rating pill for unrated entries.**
   `directory-card.tsx:90` guards with `entry.rating != null`;
   `list-view-card.tsx:64` renders `{entry.rating}` unguarded, so an unrated
   entry shows a star with no number. With 6 of 8 entries unrated this is the
   common case, not an edge case.
2. **Two different "no photograph" treatments.** The grid card shows a category
   icon plus label on a neutral surface; the list card shows literal "No image"
   text on `bg-surface-alt`. Brief §4.4 asks for one deliberate placeholder
   treatment.
3. **Two different empty-state treatments in the gallery.** MasonryPhotoGrid has
   a designed zero state (icon, explanatory copy, contribute CTA); VideoGrid
   emits a bare "No videos found" line.
4. **`globals.css` is unusable outside Next.** The font tokens are
   self-referential and only resolve because `next/font` injects the variable —
   any other consumer silently loses all typography. See the Fonts section.
