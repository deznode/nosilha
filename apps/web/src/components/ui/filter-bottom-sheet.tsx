"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  activeCount?: number;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  onApply,
  onClear,
  activeCount = 0,
}: FilterBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);

      // Move focus into the sheet
      requestAnimationFrame(() => {
        sheetRef.current?.focus();
      });

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
              mass: 0.8,
            }}
            className="bg-surface rounded-t-container shadow-floating absolute right-0 bottom-0 left-0 flex max-h-[70vh] flex-col focus:outline-none"
            style={{ touchAction: "pan-y" }}
          >
            {/* Drag handle + title */}
            <div className="flex flex-col items-center px-4 pt-3 pb-2">
              <div className="bg-border-primary mb-3 h-1 w-10 rounded-full" />
              <h3 className="text-body text-base font-semibold">{title}</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
              {children}
            </div>

            {/* Footer */}
            <div
              className={clsx(
                "border-hairline flex items-center gap-3 border-t px-4 pt-3",
                "pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
              )}
            >
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-muted hover:text-body touch-target rounded-button flex-1 py-2.5 text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
              {onApply && (
                <button
                  type="button"
                  onClick={onApply}
                  className="bg-ocean-blue touch-target rounded-button hover:bg-ocean-blue/90 flex-1 py-2.5 text-sm font-medium text-white transition-colors"
                >
                  {activeCount > 0 ? `Show ${activeCount} results` : "Apply"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
