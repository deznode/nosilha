"use client";

import * as Headless from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useSheetModal } from "@/lib/hooks/use-sheet-modal";

/** `md`: the phone sheet below it, the centred dialog from it up. */
export const DESKTOP_QUERY = "(min-width: 768px)";

const SCRIM = "bg-[rgba(34,29,23,0.5)] dark:bg-[rgba(0,0,0,0.6)]";
const PANEL =
  "bg-card flex max-h-[92vh] flex-col gap-[15px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.25)] focus:outline-none";

interface ResponsiveSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  /** `picker` is the town picker (P3): wider dialog, taller sheet. */
  variant?: "default" | "picker";
  children: ReactNode;
}

/**
 * The sign-in surface and the town picker share this shell: a bottom sheet on
 * phones, a centred dialog at `md` and up (spec 039, S1–S12 and P3).
 *
 * Exactly one of the two is mounted, chosen by a media query. Mounting both and
 * hiding one with CSS doesn't work here: Headless UI portals the dialog out of
 * any wrapper, so both would trap focus and the form inside would render twice.
 * It only opens after a tap, so there is no server render to mismatch.
 */
export function ResponsiveSheet({
  open,
  onClose,
  label,
  variant = "default",
  children,
}: ResponsiveSheetProps) {
  const desktop = useMediaQuery(DESKTOP_QUERY);

  if (desktop) {
    return (
      <Headless.Dialog
        open={open}
        onClose={onClose}
        aria-label={label}
        className="relative z-50"
      >
        <Headless.DialogBackdrop
          transition
          className={clsx(
            "fixed inset-0 transition duration-150 data-closed:opacity-0",
            SCRIM
          )}
        />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Headless.DialogPanel
            transition
            className={clsx(
              PANEL,
              "rounded-[14px] px-7 py-[26px] transition duration-150 data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none",
              variant === "picker" ? "w-[460px]" : "w-[440px]"
            )}
          >
            {children}
          </Headless.DialogPanel>
        </div>
      </Headless.Dialog>
    );
  }

  return (
    <PhoneSheet open={open} onClose={onClose} label={label} variant={variant}>
      {children}
    </PhoneSheet>
  );
}

function PhoneSheet({
  open,
  onClose,
  label,
  variant,
  children,
}: Required<Omit<ResponsiveSheetProps, "children">> & {
  children: ReactNode;
}) {
  const sheetRef = useSheetModal(open, onClose);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className={clsx("absolute inset-0", SCRIM)}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.4, 0.14, 0.3, 1] as const }
            }
            className={clsx(
              PANEL,
              "relative w-full rounded-t-[16px] px-[18px] pt-2.5 pb-[26px]",
              variant === "picker" && "h-[86vh]"
            )}
          >
            <div
              className="bg-border-strong h-1 w-10 flex-none self-center rounded-[2px]"
              aria-hidden="true"
            />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
