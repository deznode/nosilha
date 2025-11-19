"use client";

import {
  createContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import type { Toast, ToastContextValue, ToastOptions } from "@/types/toast";
import { ActionToast } from "@/components/ui/action-toast";

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION: Record<Toast["variant"], number> = {
  success: 5000,
  error: 8000,
  info: 5000,
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
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

      setToasts((prev) => [...prev.slice(-2), newToast]);

      timers.current[id] = window.setTimeout(() => {
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

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { variant: "info", duration });
    },
    [showToast]
  );

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
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
