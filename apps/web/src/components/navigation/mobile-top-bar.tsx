"use client";

import clsx from "clsx";

import { AccountSlot, ChromeLogoLink } from "./chrome-parts";

/**
 * Phone top bar (0–767) — identity and account, at `--chrome-top-bar-height`
 * (52px here, 64px from 768 up). Navigation is not in this bar; the bottom bar
 * carries it.
 *
 * Sticky and in-flow rather than fixed, which is what lets `(archive-fill)`'s
 * `flex h-dvh` column keep sizing `<main>` from what the bar leaves behind.
 *
 * It does not hide on scroll: the bar is cheap to keep, and the account
 * control should not be something a visitor has to scroll up to find. No bar in
 * the chrome hides on scroll any more — `NavVisibilityWrapper` came off the
 * desktop bar too, where it could never fire. Spec 037 FR-002.
 */
export function MobileTopBar({ className }: { className?: string }) {
  return (
    <header
      className={clsx(
        "border-hairline bg-card sticky top-0 z-40 flex h-(--chrome-top-bar-height) items-center gap-2 border-b px-[14px] print:hidden",
        // The bar sits above the page ground in dark mode so it separates
        // without a shadow.
        "dark:border-chrome-line dark:bg-chrome-raised",
        className
      )}
    >
      <ChromeLogoLink
        instanceId="mobile-top-bar-logo"
        className="min-w-0 flex-1"
      />
      <AccountSlot />
    </header>
  );
}
