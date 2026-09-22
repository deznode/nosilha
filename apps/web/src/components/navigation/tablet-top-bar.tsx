"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/catalyst-ui/button";
import { NosilhaLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";

import { AccountSlot } from "./chrome-account";
import {
  TABLET_INLINE,
  TABLET_OVERFLOW,
  isDestinationActive,
  languages,
  resolve,
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
  const resolvedTheme = useResolvedTheme();

  const inline = resolve(TABLET_INLINE);
  const overflow = resolve(TABLET_OVERFLOW);
  const currentLanguage = languages[0];

  return (
    <header
      className={clsx(
        "border-hairline bg-card sticky top-0 z-40 h-16 items-center gap-3 border-b px-[18px] print:hidden",
        "dark:border-[#333C44] dark:bg-[#242C33]",
        className
      )}
    >
      <Link
        href="/"
        className="flex shrink-0 items-center"
        aria-label="Nos Ilha home"
      >
        <NosilhaLogo
          size="sidebar"
          variant={resolvedTheme === "dark" ? "light" : "default"}
          showSubtitle={false}
          instanceId="tablet-top-bar-logo"
        />
      </Link>

      {/* `flex-1` with `min-w-0` so the nav yields before the bar can wrap. */}
      <nav
        aria-label="Primary"
        className="ml-1.5 flex min-w-0 flex-1 items-center gap-0.5"
      >
        {inline.map((destination) => {
          const active = isDestinationActive(destination, pathname);
          return (
            <Link
              key={destination.key}
              href={destination.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "rounded-[7px] px-[11px] py-[11px] text-[13.5px] whitespace-nowrap transition-colors duration-150",
                active
                  ? "bg-surface text-body dark:bg-[#333C44] dark:text-[#F5F7F9]"
                  : "text-muted hover:text-body dark:text-[#AEB9C4]"
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
              "dark:text-[#AEB9C4]"
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
              "dark:border-[#333C44] dark:bg-[#242C33]"
            )}
          >
            {overflow.map((destination) => (
              <Link
                key={destination.key}
                href={destination.href}
                className="text-body hover:bg-surface block rounded-[7px] px-2.5 py-[11px] text-sm transition-colors duration-150 dark:text-[#F5F7F9] dark:hover:bg-[#333C44]"
              >
                {destination.label}
              </Link>
            ))}
            <div className="border-hairline mt-[5px] flex items-center gap-1.5 border-t pt-[5px] dark:border-[#333C44]">
              <LanguageChip code={currentLanguage.code} className="flex-1" />
              <ThemeToggle showContainer={false} shape="square" />
            </div>
          </PopoverPanel>
        </Popover>
      </nav>

      <Button
        href="/contribute/story"
        size="lg"
        color="blue"
        className="shrink-0"
      >
        Contribute
      </Button>
      <AccountSlot />
    </header>
  );
}

/**
 * The current locale, shown but not switchable — `PT` and `CV` are disabled in
 * `languages`, and a disabled locale must not render as though it were available.
 */
export function LanguageChip({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "border-hairline text-muted flex h-11 items-center justify-center rounded-lg border font-mono text-[13px] dark:border-[#333C44] dark:text-[#AEB9C4]",
        className
      )}
      title="English. Português and Kriolu are coming soon."
    >
      {code}
    </span>
  );
}
