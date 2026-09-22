"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MoreSheet } from "./more-sheet";
import { BOTTOM_BAR, isDestinationActive, resolve } from "./nav-config";

/**
 * Phone bottom navigation — the thumb zone, on every route.
 *
 * The bar itself is unchanged from what shipped: 56px (`h-14`), the same five
 * items, labels, routes and icons, safe-area padding. Two things changed.
 *
 * It no longer hides itself. It used to carry a `HIDDEN_ROUTES` list holding one
 * pattern, `/people/[slug]`, so a visitor reading a historical figure lost all
 * navigation. Nothing replaces it — the bar is persistent, with no scroll-hide
 * and no route-based hiding (FR-003).
 *
 * And it is hidden from 768 up rather than from 1024: at tablet width
 * `TabletTopBar` carries navigation inline, and 56px of screen goes back to the
 * page.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // `cacheComponents` wraps routes in <Activity>, which hides rather than
  // unmounts them, so `useState` survives navigation and a sheet left open would
  // come back open. Adjusted during render rather than in an effect: an effect
  // keyed on pathname does not fire reliably in a hidden component (Next.js
  // #78844), and React bails out of the re-render when the value is unchanged.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMoreOpen(false);
  }

  const destinations = resolve(BOTTOM_BAR);

  const itemClasses = (active: boolean) =>
    clsx(
      "touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-2",
      "transition-colors duration-150",
      active
        ? "text-ocean-blue"
        : "text-muted hover:text-ocean-blue focus-visible:text-ocean-blue",
      "focus-visible:ring-ocean-blue/50 focus:outline-none focus-visible:rounded-lg focus-visible:ring-2"
    );

  return (
    <>
      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />

      <nav
        // Same surface as the top bar, in both themes: the design lifts both
        // bars off the page ground so they read as one chrome rather than two
        // (`bg-surface` put this bar on #EFE8DC in light and #141B26 in dark,
        // half a step from the top bar either way). Spec 037.
        className="bg-card border-hairline fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)] md:hidden dark:border-[#333C44] dark:bg-[#242C33] print:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-center justify-around">
          {destinations.map((destination) => {
            const Icon = destination.icon!;
            const active = isDestinationActive(destination, pathname);

            return (
              <Link
                key={destination.key}
                href={destination.href}
                className={itemClasses(active)}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={clsx("h-5 w-5", active && "fill-ocean-blue/20")}
                  aria-hidden="true"
                />
                <span className="text-[10.5px] font-medium">
                  {destination.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={itemClasses(moreOpen)}
            aria-label={moreOpen ? "Close menu" : "Open menu"}
            aria-expanded={moreOpen}
          >
            {moreOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-[10.5px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
