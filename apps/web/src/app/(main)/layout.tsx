import clsx from "clsx";

import {
  CHROME_MAIN_CLEARANCE,
  SiteChrome,
} from "@/components/navigation/site-chrome";
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
      <main
        id="main-content"
        className={clsx("animate-fade-in flex-grow", CHROME_MAIN_CLEARANCE)}
      >
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
