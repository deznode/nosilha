"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import type { Toast, ToastContextValue, ToastOptions } from "@/types/toast";
import { ActionToast } from "@/components/ui/action-toast";

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = {
  success: 3000,
  error: 5000,
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const variant = options?.variant || "success";
      const duration =
        options?.duration ||
        DEFAULT_DURATION[variant] ||
        DEFAULT_DURATION.success;

      const newToast: Toast = {
        id,
        message,
        variant,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { variant: "success", duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { variant: "error", duration });
    },
    [showToast]
  );

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    showSuccess,
    showError,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container at top-right */}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex flex-col gap-3">
        <AnimatePresence mode="sync">
          {toasts.map((toast, index) => (
            <ActionToast
              key={toast.id}
              message={toast.message}
              show={true}
              variant={toast.variant}
              index={index}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
