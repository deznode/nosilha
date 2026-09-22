"use client";

import clsx from "clsx";
import Link from "next/link";

import { NosilhaLogo } from "@/components/ui/logo";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";

import { AccountSlot } from "./chrome-account";

/**
 * Phone top bar (0–767) — 52px of identity and account. Navigation is not in this
 * bar; the bottom bar carries it.
 *
 * Sticky and in-flow rather than fixed, which is what lets `(archive-fill)`'s
 * `flex h-dvh` column keep sizing `<main>` from what the bar leaves behind.
 *
 * Deliberately not wrapped in `NavVisibilityWrapper`: at 52px the bar is cheap to
 * keep, and the account control should not be something a visitor has to scroll
 * up to find. `useNavHidden` continues to serve the desktop bar only.
 * Spec 037 FR-002.
 */
export function MobileTopBar({ className }: { className?: string }) {
  const resolvedTheme = useResolvedTheme();

  return (
    <header
      className={clsx(
        "border-hairline bg-card sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b px-[14px] print:hidden",
        // The bar sits above the page ground in dark mode so it separates
        // without a shadow.
        "dark:border-[#333C44] dark:bg-[#242C33]",
        className
      )}
    >
      <Link
        href="/"
        className="flex min-w-0 flex-1 items-center"
        aria-label="Nos Ilha home"
      >
        <NosilhaLogo
          size="sidebar"
          variant={resolvedTheme === "dark" ? "light" : "default"}
          showSubtitle={false}
          instanceId="mobile-top-bar-logo"
        />
      </Link>
      <AccountSlot />
    </header>
  );
}
