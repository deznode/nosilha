"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/providers/toast-provider";

/**
 * Hook to access the global toast system.
 *
 * @example
 * const toast = useToast();
 * toast.success("Operation completed!");
 * toast.error("Something went wrong");
 *
 * @throws Error if used outside of ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
