import { Suspense } from "react";

import { IdentifySheet } from "@/components/identify/identify-sheet";
import { ArchiveBar } from "@/components/navigation/archive-bar";
import { Footer } from "@/components/ui/footer";

/**
 * Archive Layout — the eight redesigned screens that scroll.
 *
 * The prototype's single sticky bar replaces the site header here (spec 034 FR-003).
 * Its sibling `(archive-fill)` carries the same bar for screens that fill the
 * viewport instead of scrolling, and drops the footer.
 *
 * The Suspense boundary lets `ArchiveBar`'s `usePathname()` punch a dynamic hole in
 * otherwise cached pages, the same way `(main)` treats its nav.
 */
export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <ArchiveBar />
      </Suspense>
      <main id="main-content" className="flex-grow">
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
