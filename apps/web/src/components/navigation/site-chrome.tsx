import { Suspense } from "react";

import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { MobileTopBar } from "@/components/navigation/mobile-top-bar";
import { StickyNav } from "@/components/navigation/sticky-nav";
import { TabletTopBar } from "@/components/navigation/tablet-top-bar";
import { NavVisibilityWrapper } from "@/components/ui/nav-visibility-wrapper";

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
 *   ≥1024     StickyNav, unchanged
 *
 * `Footer` is deliberately not rendered here — it stays a sibling in each layout,
 * because `(archive-fill)` has none and the layouts keep authority over page
 * structure.
 *
 * The `Suspense` boundaries let the bars' `usePathname()` punch dynamic holes in
 * otherwise cached pages, the same way `(main)` has always treated its nav.
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
    <>
      <div className="hidden lg:block print:hidden">
        <Suspense>
          <NavVisibilityWrapper>
            <StickyNav />
          </NavVisibilityWrapper>
        </Suspense>
      </div>

      <Suspense>
        <MobileTopBar className="md:hidden" />
      </Suspense>

      <Suspense>
        <TabletTopBar className="hidden md:flex lg:hidden" />
      </Suspense>

      {showBottomNav && (
        <Suspense>
          <MobileBottomNav />
        </Suspense>
      )}
    </>
  );
}
