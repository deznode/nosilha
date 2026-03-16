import { Suspense } from "react";
import { StickyNav } from "@/components/ui/sticky-nav";
import { NavVisibilityWrapper } from "@/components/ui/nav-visibility-wrapper";
import { Footer } from "@/components/ui/footer";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

/**
 * Main Layout - Standard pages with Header and Footer
 *
 * This layout wraps all routes in the (main) route group,
 * providing the standard site chrome (header, footer, navigation).
 *
 * Routes that need full-page takeover (like auth) should use
 * their own route group without this layout.
 *
 * Mobile: Includes MobileBottomNav for thumb-zone accessibility,
 * with padding to prevent content overlap.
 *
 * Suspense boundaries around nav components allow usePathname()
 * to create dynamic holes in cached pages (PPR).
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <NavVisibilityWrapper>
          <StickyNav className="print:hidden" />
        </NavVisibilityWrapper>
      </Suspense>
      <main
        id="main-content"
        className="animate-fade-in flex-grow pt-16 pb-16 lg:pb-0"
      >
        {children}
      </main>
      <div className="hidden lg:block print:hidden">
        <Footer />
      </div>
      <Suspense>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
