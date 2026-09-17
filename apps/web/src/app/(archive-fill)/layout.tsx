import { Suspense } from "react";

import { IdentifySheet } from "@/components/identify/identify-sheet";
import { ArchiveBar } from "@/components/navigation/archive-bar";

/**
 * Archive Fill Layout — archive screens that fill the viewport rather than scroll.
 *
 * Same bar as `(archive)`, no footer, and a main sized to what the bar leaves behind,
 * so a child like the map owns its own scrolling without the page growing past the
 * viewport (FR-003's last criterion).
 *
 * The main takes the remaining height of a viewport-tall column rather than
 * subtracting a constant. The bar measures about 65px on a wide screen, but below
 * ~640px its nav pills wrap and it grows to about 158px, so `calc(100vh - 65px)` let
 * `/map` overflow a phone by the difference and pushed the bottom sheet below the fold
 * (FR-012). `dvh` follows the mobile browser's collapsing toolbar, which `vh` does not.
 * The photo detail still sizes its own panes from the 65px constant.
 */
export default function ArchiveFillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <Suspense>
        <ArchiveBar />
      </Suspense>
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
