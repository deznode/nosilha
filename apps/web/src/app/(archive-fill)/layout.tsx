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
 * The 65px is the constant tasks.md prescribes. The bar actually measures 64.5px: its
 * tallest child is a 13px nav pill at the inherited `line-height: 1.5` (19.5px) plus
 * 14px padding and 2px border = 35.5px, inside 14px + 14px bar padding and a 1px
 * bottom border. Subtracting the larger number under-reserves by half a pixel, which
 * is the safe direction — a smaller one would put a scrollbar on every fill screen.
 * Nothing pins the two together, so a change to the pill's font size or padding, or to
 * a global line-height, would silently desync this.
 */
export default function ArchiveFillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
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
      <main id="main-content" className="h-[calc(100vh-65px)]">
        {children}
      </main>
      {/* One sheet for every missing-field question on these screens (FR-004) */}
      <IdentifySheet />
    </div>
  );
}
