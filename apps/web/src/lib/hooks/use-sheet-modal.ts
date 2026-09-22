"use client";

import { useEffect, useRef } from "react";

/**
 * The modal behaviours a bottom sheet has to get right: focus trap, focus
 * restore, body scroll lock, and Escape to close.
 *
 * One implementation, two sheets. `BottomSheet` and `FilterBottomSheet` each
 * carried a byte-identical copy of this — same focusable selector, same
 * `document.body.style.overflow` lock, same rAF focus-in — so an a11y fix to the
 * trap (the selector still misses `[contenteditable]` and does not skip disabled
 * controls) had to be made twice, and only one copy ever got the
 * `prefers-reduced-motion` work.
 *
 * Returns the ref to put on the panel. `onClose` is read through a ref, so the
 * listener is installed once per open rather than re-installed on every render
 * of a parent that passes an inline arrow — and the long-lived `document`
 * listener captures the ref instead of the parent's whole render closure.
 */
export function useSheetModal(isOpen: boolean, onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Kept current in its own effect rather than assigned during render, so the
  // open effect below can depend on `isOpen` alone.
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    // Move focus into the sheet once it is in the document.
    const frame = requestAnimationFrame(() => {
      sheetRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  return sheetRef;
}
