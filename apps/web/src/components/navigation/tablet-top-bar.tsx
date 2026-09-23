"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ui/theme-toggle";

import {
  AccountSlot,
  ChromeBar,
  ChromeWordmark,
  ContributeAction,
  LanguageChip,
} from "./chrome-parts";
import {
  TABLET_INLINE_DESTINATIONS,
  TABLET_OVERFLOW_DESTINATIONS,
  isDestinationActive,
} from "./nav-config";

/**
 * Tablet top bar (768–1023) — 64px, with navigation inline.
 *
 * A bottom bar on a tablet is a long reach and costs vertical space a tablet has
 * better uses for, so at this width the bottom bar is hidden and this bar carries
 * the destinations. It replaces `ArchiveBar`, whose `flex-wrap` pill row produced
 * a two-row bar here, and `StickyNav`, which silently clipped itself by up to
 * 224px across this whole range. Nothing wraps and nothing clips.
 * Spec 037 FR-004 / FR-005.
 */
export function TabletTopBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ChromeBar
      className={clsx(
        "bg-card dark:border-chrome-line dark:bg-chrome-raised gap-3 px-[18px]",
        className
      )}
    >
      <ChromeWordmark />

      {/* `flex-1` with `min-w-0` so the nav yields before the bar can wrap. */}
      <nav
        aria-label="Primary"
        className="ml-1.5 flex min-w-0 flex-1 items-center gap-0.5"
      >
        {TABLET_INLINE_DESTINATIONS.map((destination) => {
          const active = isDestinationActive(destination, pathname);
          return (
            <Link
              key={destination.key}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "rounded-[7px] px-[11px] py-[11px] text-[13.5px] whitespace-nowrap transition-colors duration-150",
                active
                  ? "bg-surface text-body dark:bg-chrome-line dark:text-chrome-ink"
                  : "text-muted hover:text-body dark:text-chrome-ink-muted"
              )}
            >
              {destination.label}
            </Link>
          );
        })}

        {/* Keyed on pathname so a route change remounts it closed — Headless UI
            gives Escape, outside-click and aria-expanded for free. */}
        <Popover key={pathname} className="relative flex">
          <PopoverButton
            className={clsx(
              "text-muted hover:text-body flex items-center gap-[5px] rounded-[7px] px-[11px] py-[11px] text-[13.5px] whitespace-nowrap transition-colors duration-150",
              "data-focus:outline-ocean-blue focus:outline-none data-focus:outline-2 data-focus:outline-offset-2",
              "dark:text-chrome-ink-muted"
            )}
          >
            More
            <ChevronDown className="size-[13px]" aria-hidden="true" />
          </PopoverButton>
          <PopoverPanel
            // Anchored to the trigger, not offset from the bar.
            className={clsx(
              "bg-card border-hairline absolute top-[calc(100%+8px)] left-0 z-[2] w-[210px] rounded-[10px] border p-1.5",
              "shadow-[0_8px_22px_rgba(27,33,39,0.15)]",
              "dark:border-chrome-line dark:bg-chrome-raised"
            )}
          >
            {TABLET_OVERFLOW_DESTINATIONS.map((destination) => (
              <Link
                key={destination.key}
                href={destination.href}
                className="text-body hover:bg-surface dark:text-chrome-ink dark:hover:bg-chrome-line block rounded-[7px] px-2.5 py-[11px] text-sm transition-colors duration-150"
              >
                {destination.label}
              </Link>
            ))}
            <div className="border-hairline dark:border-chrome-line mt-[5px] flex items-center gap-1.5 border-t pt-[5px]">
              <LanguageChip className="flex-1" />
              <ThemeToggle showContainer={false} shape="square" />
            </div>
          </PopoverPanel>
        </Popover>
      </nav>

      <ContributeAction />
      <AccountSlot />
    </ChromeBar>
  );
}
