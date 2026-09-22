import { Suspense } from "react";

import { DesktopTopBar } from "@/components/navigation/desktop-top-bar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { MobileTopBar } from "@/components/navigation/mobile-top-bar";
import { TabletTopBar } from "@/components/navigation/tablet-top-bar";

/**
 * The site's chrome, for every public route group.
 *
 * `(main)` and `(archive)` used to carry different bars and disagree about what
 * the site's destinations were, so crossing between them changed the whole frame
 * around the page. They import this instead, which is what makes "the same frame
 * everywhere" true by construction rather than by convention. Spec 037 FR-012.
 *
 * The three bars are swapped by Tailwind breakpoints, not a `useMediaQuery`
 * branch: a JS breakpoint reads `false` on the server and would flash the wrong
 * bar during hydration.
 *
 *   0–767     MobileTopBar (52px) + MobileBottomNav (56px)
 *   768–1023  TabletTopBar (64px), navigation inline, no bottom bar
 *   ≥1024     DesktopTopBar (65px), the archive bar's pill row
 *
 * Each height is `--chrome-top-bar-height` at that width, so the places that have
 * to subtract the bar rather than sit below it — `archive-skeleton`, the photo
 * detail — track it without repeating the numbers.
 *
 * `Footer` is deliberately not rendered here — it stays a sibling in each layout,
 * because `(archive-fill)` has none and the layouts keep authority over page
 * structure.
 *
 * One `Suspense` boundary, not one per bar: all three bars need it for the same
 * reason — `usePathname()` — and all three fallbacks are empty, so separate
 * boundaries bought four postponed segments and four streamed chunks per request
 * where one does. It lets the bars punch a dynamic hole in otherwise cached
 * pages, the same way `(main)` has always treated its nav.
 *
 * No bar hides on scroll. `StickyNav` used to arrive wrapped in
 * `NavVisibilityWrapper`, which hides via `useNavHidden` — `(max-width: 767px)`
 * only — around a bar that renders from 1024 up, so it installed a scroll
 * listener and a media query on every route to translate something that could
 * never be on screen.
 */
export function SiteChrome({
  showBottomNav = true,
}: {
  /**
   * `false` for the immersive routes in `(archive-fill)` — `/map` and the photo
   * detail — which fill the viewport and keep their full bleed.
   */
  showBottomNav?: boolean;
}) {
  return (
    <Suspense>
      <MobileTopBar className="md:hidden" />
      <TabletTopBar className="hidden md:flex lg:hidden" />
      <DesktopTopBar className="hidden lg:flex" />

      {showBottomNav && <MobileBottomNav />}
    </Suspense>
  );
}

/**
 * Clearance `<main>` needs for the bars `SiteChrome` renders.
 *
 * Lives beside the bars rather than in each layout: `SiteChrome` is the only
 * thing that knows which bars exist at which width, so restating it in `(main)`
 * and `(archive)` — with the same explanatory comment — put that knowledge in two
 * more places that could drift from it.
 *
 * All three top bars are sticky and in-flow, so none of them needs top padding;
 * the `lg:pt-16` that used to be here cleared the old fixed desktop bar and would
 * now be 64px of dead space above every desktop page. What is left clears the
 * fixed bottom bar, which is phone-only. `(archive-fill)` passes
 * `showBottomNav=false` and sizes its own column, so it uses none of this.
 *
 * The clearance itself is `.chrome-bottom-clearance`, the same utility the footer
 * and the More sheet use: it reads `--chrome-bottom-bar-height` and adds the
 * home-indicator inset, and it goes to 0 at 768 on its own. This used to be
 * `pb-16 md:pb-0` — 64px for a 56px bar, and the only one of the three clearances
 * that left out `env(safe-area-inset-bottom)`.
 */
export const CHROME_MAIN_CLEARANCE = "chrome-bottom-clearance";
