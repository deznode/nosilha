"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AccountSlot,
  ChromeBar,
  ChromeWordmark,
  ContributeAction,
  ThemePill,
} from "./chrome-parts";
import { DESKTOP_BAR_DESTINATIONS, isDestinationActive } from "./nav-config";

/**
 * Desktop top bar (≥1024) — the archive bar's pill style, on every public route.
 *
 * This is the bar spec 034 gave the archive screens, restored by preference and
 * then generalized: `(main)`, `(archive)` and `(archive-fill)` all render it, so
 * the frame stays identical across route groups the way FR-012 requires. What
 * changed from the original is membership, not style — it reads its pills from
 * `DESTINATIONS` instead of a private list, and it keeps the Contribute action
 * and the account control, which the archive bar had no slot for and which are
 * the only way to reach `/profile` from a desktop screen.
 *
 * `sticky`, not `fixed` — the original was too. That is what lets
 * `(archive-fill)`'s `flex h-dvh` column size `<main>` from what the bar leaves
 * behind, and it is why `<main>` needs no top padding at this width.
 *
 * Nothing wraps: `flex-wrap` is deliberately absent. The archive bar had it, and
 * between 768 and 1023 the pill row wrapped into a second line — the two-row bar
 * spec 037 FR-004 replaced. Below 1024 `TabletTopBar` carries navigation now, so
 * this bar only ever renders where its row fits.
 */
export function DesktopTopBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ChromeBar
      // Display is the caller's (`hidden lg:flex`), not this list's: an
      // unprefixed `flex` here and an unprefixed `hidden` there are two
      // `display` declarations at equal specificity, and the winner would be
      // decided by stylesheet order rather than by the prop.
      className={clsx("bg-canvas gap-5 px-[22px]", className)}
    >
      <ChromeWordmark />

      {/* `ml-auto` pushes the row right, as the original did. */}
      <nav
        aria-label="Primary"
        className="ml-auto flex min-w-0 items-center gap-1"
      >
        {DESKTOP_BAR_DESTINATIONS.map((destination) => {
          const active = isDestinationActive(destination, pathname);

          return (
            <Link
              key={destination.key}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "focus-ring cursor-pointer rounded-full border px-[15px] py-[7px] text-[13px] whitespace-nowrap",
                "transition-all duration-[.18s] ease-[cubic-bezier(.4,.14,.3,1)]",
                active
                  ? "bg-surface text-body border-edge"
                  : "text-muted hover:text-body border-transparent"
              )}
            >
              {destination.label}
            </Link>
          );
        })}
      </nav>

      <ThemePill />
      <ContributeAction />
      <AccountSlot />
    </ChromeBar>
  );
}
