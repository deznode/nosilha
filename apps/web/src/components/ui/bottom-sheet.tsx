"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { useSheetModal } from "@/lib/hooks/use-sheet-modal";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Accessible name. Not rendered — a sheet whose contents are self-describing
   * (a menu, a grid of destinations) should not be forced to carry a title row.
   */
  label: string;
  children: ReactNode;
  /** Padding and any per-consumer overrides for the panel itself. */
  className?: string;
}

/**
 * Bottom sheet primitive — scrim, slide-up panel, grab handle, and the modal
 * behaviours a sheet has to get right: focus trap, focus restore, body scroll
 * lock, Escape, scrim click.
 *
 * The modal behaviours come from `useSheetModal`, shared with
 * `filter-bottom-sheet.tsx` — which is where this sheet's shape came from, but
 * which bakes in a title row and a Clear/Apply footer and so stays its own
 * component. The one behaviour added here is `prefers-reduced-motion`: the source
 * pattern animates unconditionally.
 *
 * Deliberately not built on Catalyst's `Dialog`, which becomes a centred modal at
 * `sm:` (640px) — inside the phone range this sheet has to cover — and does not
 * expose its backdrop for styling. Spec 037 FR-006.
 */
export function BottomSheet({
  isOpen,
  onClose,
  label,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useSheetModal(isOpen, onClose);
  const prefersReducedMotion = useReducedMotion();

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0.14, 0.3, 1] as const };

  return (
    <AnimatePresence>
      {isOpen && (
        // Phone only: at 768 up the tablet bar carries navigation inline.
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-[rgba(27,33,39,0.35)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={panelTransition}
            className={clsx(
              "bg-card absolute right-0 bottom-0 left-0 flex max-h-[85vh] flex-col rounded-t-[14px] focus:outline-none",
              "shadow-[0_-6px_24px_rgba(27,33,39,0.16)]",
              // Bottom padding is the consumer's: a sheet opened from a fixed
              // bar has to clear it, and two padding utilities here would
              // resolve by stylesheet order rather than by the caller's intent.
              className
            )}
            style={{ touchAction: "pan-y" }}
          >
            <div
              className="bg-hairline mx-auto mt-2.5 mb-2.5 h-1 w-[38px] shrink-0 rounded-full"
              aria-hidden="true"
            />
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
