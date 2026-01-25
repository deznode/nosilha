"use client";

import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { makeSlideInFrom } from "@/lib/animation";
import type { ToastVariant } from "@/types/toast";

interface ActionToastProps {
  message: string;
  show: boolean;
  variant?: ToastVariant;
  onDismiss?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Lightweight toast notification with Calm Premium styling.
 * Features:
 * - 4 variants: success, error, info, warning
 * - Slide-from-bottom animation
 * - Hover to pause timer (handled by parent)
 * - Positioned at bottom-left (desktop) / bottom-center (mobile)
 */
export function ActionToast({
  message,
  show,
  variant = "success",
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: ActionToastProps) {
  if (!show || !message) {
    return null;
  }

  const Icon =
    variant === "success"
      ? CheckCircle
      : variant === "error"
        ? AlertTriangle
        : variant === "warning"
          ? AlertCircle
          : Info;

  // Slide from bottom for bottom positioning
  const slideFromBottom = makeSlideInFrom("bottom", 50);

  return (
    <motion.div
      variants={slideFromBottom}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={clsx(
        "rounded-badge shadow-elevated pointer-events-auto flex items-center gap-3 px-4 py-3",
        variant === "success" && "bg-valley-green text-white",
        variant === "error" && "bg-status-error text-white",
        variant === "info" && "bg-ocean-blue text-white",
        variant === "warning" && "bg-sobrado-ochre text-white"
      )}
      role="status"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 flex-shrink-0 rounded-md p-1 transition-colors duration-150 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
