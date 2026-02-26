import { StickyNav } from "@/components/ui/sticky-nav";
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
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StickyNav className="print:hidden" />
      <main
        id="main-content"
        className="animate-fade-in flex-grow pt-16 pb-16 lg:pb-0"
      >
        {children}
      </main>
      <div className="hidden lg:block print:hidden">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
}
