import clsx from "clsx";

import { AccountSlot, ChromeBar, ChromeWordmark } from "./chrome-parts";

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
 * desktop bar too, where it could never fire, and has since been deleted.
 * Spec 037 FR-002.
 *
 * No `"use client"`: this bar has no hooks, no state and no handlers — it is a
 * `<header>` and children that carry their own client boundary, so the directive
 * only put this function body in the client bundle. (`ChromeBar` still comes from
 * a client module, so the element itself is hydrated either way; dropping the
 * directive is a correctness point about where the boundary belongs, not a
 * measurable saving on its own.)
 */
export function MobileTopBar({ className }: { className?: string }) {
  return (
    <ChromeBar
      // The bar sits above the page ground in dark mode so it separates without
      // a shadow.
      className={clsx(
        "bg-card dark:border-chrome-line dark:bg-chrome-raised flex gap-2 px-[14px]",
        className
      )}
    >
      {/* `mr-auto`, not `flex-1`: the home link should be as wide as the
          wordmark, not the whole bar. */}
      <ChromeWordmark className="mr-auto min-w-0" />
      <AccountSlot />
    </ChromeBar>
  );
}
