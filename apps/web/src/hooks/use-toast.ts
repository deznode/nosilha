"use client";

import { useContext, useMemo } from "react";
import { ToastContext } from "@/components/providers/toast-provider";
import type {
  Toast,
  ToastAction,
  ToastChain,
  ToastContextValue,
  ToastVariant,
} from "@/types/toast";

/**
 * Extended ToastBuilder interface that includes utility methods.
 */
export interface ToastBuilderWithUtils {
  success: (message: string) => ToastChain;
  error: (message: string) => ToastChain;
  info: (message: string) => ToastChain;
  warning: (message: string) => ToastChain;
  /** Clear all current and queued toasts */
  clearAll: () => void;
}

/** Calm Premium durations - errors persist longer for important messages */
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  error: 10000,
  info: 4000,
  warning: 6000,
};

/**
 * Internal class implementing the fluent ToastChain interface.
 * Collects configuration via method chaining, then dispatches on show().
 */
class ToastChainImpl implements ToastChain {
  private _message: string;
  private _variant: ToastVariant;
  private _action?: ToastAction;
  private _id?: string;
  private _duration?: number;
  private _context: ToastContextValue;

  constructor(
    message: string,
    variant: ToastVariant,
    context: ToastContextValue
  ) {
    this._message = message;
    this._variant = variant;
    this._context = context;
  }

  action(label: string, onClick: () => void): ToastChain {
    this._action = { label, onClick };
    return this;
  }

  id(dedupeId: string): ToastChain {
    this._id = dedupeId;
    return this;
  }

  duration(ms: number): ToastChain {
    this._duration = ms;
    return this;
  }

  show(): void {
    const toastId =
      this._id || `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Deduplication check - skip if toast with same ID exists
    if (this._id && this._context.hasToast(this._id)) {
      return;
    }

    const toast: Toast = {
      id: toastId,
      message: this._message,
      variant: this._variant,
      duration: this._duration ?? DEFAULT_DURATION[this._variant],
      action: this._action,
    };

    this._context.addToast(toast);
  }
}

/**
 * Hook to access the global toast system with fluent builder API.
 *
 * @example
 * const toast = useToast();
 *
 * // Simple toast
 * toast.success("Profile updated").show();
 * toast.error("Failed to save").show();
 *
 * // With action button
 * toast.success("Added to favorites").action("Undo", handleUndo).show();
 *
 * // With custom duration
 * toast.info("Processing...").duration(8000).show();
 *
 * // With deduplication (prevents duplicate toasts)
 * toast.warning("Session expiring").id("session-warning").show();
 *
 * // Clear all toasts
 * toast.clearAll();
 *
 * @throws Error if used outside of ToastProvider
 */
export function useToast(): ToastBuilderWithUtils {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const builder = useMemo<ToastBuilderWithUtils>(
    () => ({
      success: (message: string) =>
        new ToastChainImpl(message, "success", context),
      error: (message: string) => new ToastChainImpl(message, "error", context),
      info: (message: string) => new ToastChainImpl(message, "info", context),
      warning: (message: string) =>
        new ToastChainImpl(message, "warning", context),
      clearAll: () => context.clearAll(),
    }),
    [context]
  );

  return builder;
}
