import { SiteChrome } from "@/components/navigation/site-chrome";
import { Footer } from "@/components/ui/footer";

/**
 * Main Layout - Standard pages with site chrome and footer.
 *
 * This layout wraps all routes in the (main) route group. The chrome itself is
 * shared with `(archive)` and `(archive-fill)` via `SiteChrome`, so crossing
 * between route groups no longer changes the frame around the page (spec 037).
 *
 * Routes that need full-page takeover (like auth) should use their own route
 * group without this layout.
 *
 * The footer renders at every width. It used to be wrapped in `hidden lg:block`,
 * which made Privacy and Terms unreachable on a phone on every route in this
 * group, while `(archive)` rendered the same footer at all widths — two answers
 * to the same question (spec 037 FR-008).
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteChrome />
      {/* The phone and tablet bars are sticky and in-flow, so they need no top
          padding. `StickyNav` at lg: is fixed and does. Bottom padding clears the
          fixed bottom bar, which is phone-only. */}
      <main
        id="main-content"
        className="animate-fade-in flex-grow pb-16 md:pb-0 lg:pt-16"
      >
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
