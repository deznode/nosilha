import { IdentifySheet } from "@/components/identify/identify-sheet";
import { SiteChrome } from "@/components/navigation/site-chrome";

/**
 * Archive Fill Layout — archive screens that fill the viewport rather than scroll.
 *
 * Same chrome as `(archive)`, no footer, and a main sized to what the bar leaves
 * behind, so a child like the map owns its own scrolling without the page growing
 * past the viewport (spec 034 FR-003's last criterion).
 *
 * No bottom bar here, by decision: these screens fill the viewport and keep their
 * full bleed. It is the one place the chrome is not identical everywhere, and the
 * reason is the screen, not the route group (spec 037).
 *
 * The main takes the remaining height of a viewport-tall column rather than
 * subtracting a constant. That mattered more when the old archive bar wrapped to
 * about 158px below ~640px; the bars are now a flat 52px phone / 64px tablet, but
 * the column still measures rather than assumes. `dvh` follows the mobile
 * browser's collapsing toolbar, which `vh` does not. The photo detail sizes its
 * own panes from the same bar heights — see `archive-skeleton.tsx`.
 */
export default function ArchiveFillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <SiteChrome showBottomNav={false} />
      {/*
        No Suspense around `children`. A boundary here flushes the shell — and with it
        HTTP 200 — before the page runs, so `/photographs/[id]` answered 200 with a
        not-found page inside it for an id the archive does not hold. The pages under
        this layout opt out of instant navigation instead (`export const instant =
        false`), which keeps `notFound()` able to set a status. Spec 034 FR-010.
      */}
      <main id="main-content" className="min-h-0 flex-1">
        {children}
      </main>
      {/* One sheet for every missing-field question on these screens (FR-004) */}
      <IdentifySheet />
    </div>
  );
}
