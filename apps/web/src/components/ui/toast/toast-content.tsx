"use client";

import { CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import type { ToastVariant } from "@/types/toast";

interface ToastContentProps {
  message: string;
  variant: ToastVariant;
}

const ICON_MAP = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  warning: AlertCircle,
} as const;

/**
 * Content slot for toast notification (icon + message).
 *
 * Displays the appropriate icon based on variant:
 * - success: CheckCircle
 * - error: AlertTriangle
 * - info: Info
 * - warning: AlertCircle
 */
export function ToastContent({ message, variant }: ToastContentProps) {
  const Icon = ICON_MAP[variant];

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
