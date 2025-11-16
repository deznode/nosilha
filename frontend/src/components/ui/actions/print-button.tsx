"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Printer } from "lucide-react";

/**
 * Print Button Component
 *
 * Triggers browser print dialog to print current page.
 *
 * Visual States:
 * - Default: Light gray circular background
 * - Hover: Darker gray background
 * - Active (on tap): Brief ocean blue highlight with scale animation
 *
 * Accessibility:
 * - Min touch target: 44×44px (WCAG 2.1 AAA)
 * - ARIA label for action
 * - Keyboard navigation support
 * - Respects prefers-reduced-motion
 *
 * Feature: 005-action-toolbar-refactor (Wireframe Update)
 * Reference: wireframe 01-layout-content-action-toolbar.png
 *
 * @param props - Component props
 * @returns Print button component
 */

export interface PrintButtonProps {
  variant?: "icon-only" | "icon-with-label";
  onPrintTriggered?: () => void;
}

export function PrintButton({
  variant = "icon-with-label",
  onPrintTriggered,
}: PrintButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  /**
   * Handle print action
   */
  const handlePrint = () => {
    // Trigger browser print dialog
    window.print();

    // Call callback if provided
    onPrintTriggered?.();
  };

  // Animation configuration
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: 0.95 },
      };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        {...scaleAnimation}
        type="button"
        onClick={handlePrint}
        aria-label="Print page"
        className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Printer className="h-5 w-5" />
      </motion.button>

      {variant === "icon-with-label" && (
        <span className="mt-1 text-xs font-normal text-[var(--color-text-secondary)]">
          Print
        </span>
      )}
    </div>
  );
}
