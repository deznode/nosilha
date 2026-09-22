import clsx from "clsx";

import { IdentifySheet } from "@/components/identify/identify-sheet";
import {
  CHROME_MAIN_CLEARANCE,
  SiteChrome,
} from "@/components/navigation/site-chrome";
import { Footer } from "@/components/ui/footer";

/**
 * Archive Layout — the eight redesigned screens that scroll.
 *
 * Chrome is shared with `(main)` and `(archive-fill)` via `SiteChrome` (spec 037).
 * This group used to carry `ArchiveBar` and no bottom bar, so tapping a bottom-bar
 * item on a `(main)` route landed here and the bar the visitor had just used
 * disappeared. Its sibling `(archive-fill)` carries the same chrome for screens
 * that fill the viewport instead of scrolling, and drops the footer.
 *
 * `SiteChrome` owns the Suspense boundaries the bars' `usePathname()` needs to
 * punch dynamic holes in otherwise cached pages.
 */
export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteChrome />
      <main
        id="main-content"
        className={clsx("flex-grow", CHROME_MAIN_CLEARANCE)}
      >
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
      {/* One sheet for every missing-field question on these screens (FR-004) */}
      <IdentifySheet />
    </div>
  );
}
