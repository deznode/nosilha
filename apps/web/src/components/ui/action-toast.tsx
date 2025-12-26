"use client";

import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { makeSlideInFrom } from "@/lib/animation";

type ToastVariant = "success" | "error" | "info";

interface ActionToastProps {
  message: string;
  show: boolean;
  variant?: ToastVariant;
  index?: number; // Reserved for future stacking feature
  onDismiss?: () => void;
}

/**
 * Lightweight toast notification for content actions (share, copy, etc).
 * Provides visible feedback (FR-006, FR-017) while remaining accessible.
 * Positioned at top-right with Framer Motion animations and support for stacking.
 */
export function ActionToast({
  message,
  show,
  variant = "success",
  index: _index = 0, // Prefixed with _ to indicate intentionally unused
  onDismiss,
}: ActionToastProps) {
  if (!show || !message) {
    return null;
  }

  const Icon =
    variant === "success"
      ? CheckCircle
      : variant === "error"
        ? AlertTriangle
        : Info;

  // Use centralized slide animation
  const slideFromRight = makeSlideInFrom("right", 100);

  return (
    <motion.div
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={clsx(
        "pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
        variant === "success" && "bg-emerald-600 text-white",
        variant === "error" && "bg-red-600 text-white",
        variant === "info" && "bg-ocean-blue text-white"
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 flex-shrink-0 rounded-md p-1 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
