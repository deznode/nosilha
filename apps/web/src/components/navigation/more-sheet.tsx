"use client";

import clsx from "clsx";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import {
  ContributeAction,
  LanguageChip,
  useChromeAccount,
} from "./chrome-parts";
import { DESTINATIONS, SHEET_DESTINATION_LIST } from "./nav-config";

/**
 * Everything not in the five bottom-bar items.
 *
 * The section order below *is* the focus order (FR-013). Language and theme come
 * after navigation, not before it — in the popover this replaced they preceded
 * it, which put appearance settings ahead of the site's destinations in the tab
 * order. Spec 037 FR-006.
 *
 * The contents are a child component rather than this function's body. The bottom
 * bar renders this sheet closed on every route, so a body inlined here ran
 * `useChromeAccount` — an auth read plus a theme subscription — on every page at
 * every width, including the widths where the bar is hidden and the sheet can
 * never open. `AnimatePresence` mounts children only while open, so as a child it
 * costs nothing until it is used, and the exit animation still runs (which a
 * `{isOpen && …}` guard around the sheet itself would have broken).
 */
export function MoreSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      label="More"
      // Clears the 56px bottom bar. The bar stays above the sheet so the More
      // trigger keeps its X state and remains tappable to dismiss; without this
      // it paints over the legal row instead.
      className="px-3 pt-0 pb-[calc(var(--chrome-bottom-bar-height)+env(safe-area-inset-bottom)+12px)]"
    >
      <MoreSheetBody onClose={onClose} />
    </BottomSheet>
  );
}

function MoreSheetBody({ onClose }: { onClose: () => void }) {
  const { signedIn, initials, displayName } = useChromeAccount();

  // One string, three rows: the mapped destinations, Profile and Sign in only
  // differ by their colour.
  const rowClasses = "px-1.5 py-3 text-[15px] transition-colors duration-150";

  return (
    <>
      {signedIn && (
        <div className="border-hairline flex items-center gap-3 border-b px-1.5 pt-1.5 pb-2.5">
          <Avatar initials={initials} size="sm" />
          <div className="min-w-0">
            <p className="text-body truncate text-sm font-medium">
              {displayName}
            </p>
            <p className="text-muted text-xs">Signed in</p>
          </div>
        </div>
      )}

      <nav aria-label="More destinations" className="grid grid-cols-2">
        {SHEET_DESTINATION_LIST.map((destination) => (
          <Link
            key={destination.key}
            href={destination.href}
            onClick={onClose}
            className={clsx("text-body", rowClasses)}
          >
            {destination.label}
          </Link>
        ))}
        {signedIn ? (
          <Link
            href="/profile"
            onClick={onClose}
            className={clsx("text-body", rowClasses)}
          >
            Profile
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className={clsx("text-ocean-blue", rowClasses)}
          >
            Sign in
          </Link>
        )}
      </nav>

      <div className="border-hairline mt-1.5 flex items-center gap-2 border-t pt-2.5">
        <ContributeAction className="flex-1" onClick={onClose} />
        <LanguageChip className="w-11 shrink-0" />
        <ThemeToggle showContainer={false} shape="square" />
      </div>

      <div className="border-hairline mt-2 flex gap-4 border-t pt-0.5">
        {[DESTINATIONS.privacy, DESTINATIONS.terms].map((destination) => (
          <Link
            key={destination.key}
            href={destination.href}
            onClick={onClose}
            className="text-muted px-1.5 py-2.5 text-[12.5px] transition-colors duration-150"
          >
            {destination.label}
          </Link>
        ))}
      </div>
    </>
  );
}
