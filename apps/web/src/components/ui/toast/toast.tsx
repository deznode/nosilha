"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import type { Toast as ToastType } from "@/types/toast";
import { useToastAnimation } from "@/hooks/use-toast-animation";
import { ToastContent } from "./toast-content";
import { ToastAction } from "./toast-action";

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Dynamic ARIA configuration based on toast variant.
 * - Error toasts use assertive (interrupts screen reader)
 * - Other toasts use polite (waits for screen reader to finish)
 */
const getAriaConfig = (variant: ToastType["variant"]) => {
  if (variant === "error") {
    return { role: "alert" as const, "aria-live": "assertive" as const };
  }
  return { role: "status" as const, "aria-live": "polite" as const };
};

/**
 * Variant-specific background colors using design system tokens.
 */
const VARIANT_STYLES = {
  success: "bg-valley-green text-white",
  error: "bg-status-error text-white",
  info: "bg-ocean-blue text-white",
  warning: "bg-sobrado-ochre text-white",
} as const;

/**
 * Toast notification component with Calm Premium styling.
 *
 * Features:
 * - Animated entrance/exit (respects prefers-reduced-motion)
 * - Dynamic ARIA roles for accessibility
 * - Optional action button support
 * - Keyboard accessible (Esc to dismiss)
 * - Hover pauses auto-dismiss timer
 */
export function Toast({
  toast,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: ToastProps) {
  const { variants } = useToastAnimation();
  const toastRef = useRef<HTMLDivElement>(null);
  const ariaConfig = getAriaConfig(toast.variant);

  // Handle keyboard events (Esc to dismiss)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss]
  );

  // Attach keyboard listener when toast is visible
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus the toast for keyboard accessibility when it has an action
  useEffect(() => {
    if (toast.action && toastRef.current) {
      // Focus the action button when toast appears
      const actionButton = toastRef.current.querySelector(
        "button:not([aria-label='Dismiss notification'])"
      );
      if (actionButton instanceof HTMLElement) {
        actionButton.focus();
      }
    }
  }, [toast.action]);

  return (
    <motion.div
      ref={toastRef}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={clsx(
        "rounded-badge shadow-elevated pointer-events-auto flex items-center px-4 py-3",
        VARIANT_STYLES[toast.variant]
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...ariaConfig}
    >
      <ToastContent message={toast.message} variant={toast.variant} />

      {toast.action && (
        <ToastAction action={toast.action} onActionClick={onDismiss} />
      )}

      <button
        onClick={onDismiss}
        className="ml-2 flex-shrink-0 rounded-md p-1 transition-colors duration-150 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
