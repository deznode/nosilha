"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { useUiStore } from "@/stores/uiStore";

/**
 * The archive's single sticky bar, replacing the site header on the eight archive
 * screens. Spec 034 FR-003.
 *
 * The prototype lists its demo-only screens (a settlement, a photo, a place) as pills
 * too; production carries only the five real destinations. A settlement or entry route
 * therefore activates no pill, which is the honest answer — those pages are reached
 * from a list, not from the bar.
 *
 * Metrics come from the prototype and are pinned here as arbitrary values rather than
 * design tokens, because the bar is one fixed piece of chrome rather than a component
 * that scales with the rest of the system.
 */

interface NavPill {
  label: string;
  href: string;
  /** Sub-routes that keep this pill lit, e.g. a photo detail under /photographs. */
  activePrefix?: string;
}

const NAV_PILLS: NavPill[] = [
  { label: "Home", href: "/" },
  { label: "Settlements", href: "/settlements", activePrefix: "/settlements/" },
  { label: "Photographs", href: "/photographs", activePrefix: "/photographs/" },
  { label: "Map", href: "/map" },
  { label: "Stay", href: "/stay" },
];

/**
 * Home matches only an exact "/" — a prefix match would light it on every route.
 */
function isPillActive(pill: NavPill, pathname: string): boolean {
  if (pathname === pill.href) return true;
  return pill.activePrefix ? pathname.startsWith(pill.activePrefix) : false;
}

export function ArchiveBar() {
  const pathname = usePathname();
  const resolvedTheme = useResolvedTheme();
  const setTheme = useUiStore((state) => state.setTheme);

  // The pill offers the theme you are not in. Resolving "system" first means one
  // click always lands on an explicit choice rather than toggling within system.
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";
  const themeLabel = nextTheme === "dark" ? "Dark" : "Light";
  const themeTitle = `Switch to the ${nextTheme} theme`;

  return (
    <div
      className="sticky top-0 z-40 flex flex-wrap items-center gap-5 border-b"
      style={{
        padding: "14px 22px",
        borderBottomColor: "var(--border-subtle)",
        background: "var(--background)",
      }}
    >
      <div className="flex items-baseline gap-2">
        <span
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "19px",
            letterSpacing: "-0.01em",
          }}
        >
          <span>Nos</span>
          <span style={{ color: "var(--brand-ocean-blue)" }}>Ilha</span>
        </span>
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--foreground-secondary)",
          }}
        >
          Archive
        </span>
      </div>

      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        title={themeTitle}
        // `uiStore`'s persist middleware rehydrates from localStorage at module init,
        // so with a stored dark choice the first client render says "Light" while the
        // prerendered HTML says "Dark". The label is client state; the server cannot
        // know it, and React patches the text immediately.
        suppressHydrationWarning
        className="ml-auto flex cursor-pointer items-center gap-[7px] rounded-full border transition-colors"
        style={{
          padding: "7px 13px",
          fontSize: "12px",
          background: "var(--background-secondary)",
          borderColor: "var(--border-subtle)",
          color: "var(--foreground-secondary)",
        }}
      >
        {themeLabel}
      </button>

      <nav aria-label="Archive" className="flex flex-wrap gap-1">
        {NAV_PILLS.map((pill) => {
          const active = isPillActive(pill, pathname);

          return (
            <Link
              key={pill.href}
              href={pill.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "cursor-pointer rounded-full border",
                "transition-all duration-[.18s] ease-[cubic-bezier(.4,.14,.3,1)]"
              )}
              style={{
                padding: "7px 15px",
                fontSize: "13px",
                background: active
                  ? "var(--background-secondary)"
                  : "transparent",
                color: active
                  ? "var(--foreground)"
                  : "var(--foreground-secondary)",
                borderColor: active ? "var(--border-strong)" : "transparent",
              }}
            >
              {pill.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
