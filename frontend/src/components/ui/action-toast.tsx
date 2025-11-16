"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

type ToastVariant = "success" | "error";

interface ActionToastProps {
  message: string;
  show: boolean;
  variant?: ToastVariant;
}

/**
 * Lightweight toast notification for content actions (share, copy, etc).
 * Provides visible feedback (FR-006, FR-017) while remaining accessible.
 */
export function ActionToast({
  message,
  show,
  variant = "success",
}: ActionToastProps) {
  if (!show || !message) {
    return null;
  }

  const Icon =
    variant === "success" ? CheckCircleIcon : ExclamationTriangleIcon;

  return (
    <div
      className={clsx(
        "fixed right-4 bottom-4 z-[60] flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
        variant === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
