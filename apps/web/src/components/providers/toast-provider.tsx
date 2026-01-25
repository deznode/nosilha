"use client";

import {
  createContext,
  useCallback,
  useEffect,
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

/** Calm Premium durations - errors persist longer for important messages */
const DEFAULT_DURATION: Record<Toast["variant"], number> = {
  success: 4000,
  error: 10000,
  info: 4000,
  warning: 6000,
};

/**
 * Toast Provider with Calm Premium enhancements:
 * - Single toast at a time (queued)
 * - Timer pauses on hover
 * - Bottom-left (desktop) / bottom-center (mobile) positioning
 */
export function ToastProvider({ children }: ToastProviderProps) {
  // Current visible toast
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);
  // Queue of pending toasts
  const queueRef = useRef<Toast[]>([]);
  // Timer management
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Process the next toast in the queue
  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const nextToast = queueRef.current.shift()!;
      setCurrentToast(nextToast);
      remainingTimeRef.current = nextToast.duration;
      startTimeRef.current = Date.now();
    }
  }, []);

  // Auto-dismiss timer effect
  useEffect(() => {
    if (currentToast && !currentToast.isPaused) {
      timerRef.current = window.setTimeout(() => {
        setCurrentToast(null);
        // Show next toast after a brief delay
        setTimeout(processQueue, 150);
      }, remainingTimeRef.current);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [currentToast, processQueue]);

  const dismissToast = useCallback(
    (id: string) => {
      if (currentToast?.id === id) {
        clearTimer();
        setCurrentToast(null);
        // Show next queued toast
        setTimeout(processQueue, 150);
      } else {
        // Remove from queue if not currently showing
        queueRef.current = queueRef.current.filter((t) => t.id !== id);
      }
    },
    [currentToast, clearTimer, processQueue]
  );

  const pauseToast = useCallback(
    (id: string) => {
      if (currentToast?.id === id && timerRef.current) {
        clearTimer();
        remainingTimeRef.current -= Date.now() - startTimeRef.current;
        setCurrentToast((prev) =>
          prev
            ? {
                ...prev,
                isPaused: true,
                remainingTime: remainingTimeRef.current,
              }
            : null
        );
      }
    },
    [currentToast, clearTimer]
  );

  const resumeToast = useCallback(
    (id: string) => {
      if (currentToast?.id === id && currentToast.isPaused) {
        startTimeRef.current = Date.now();
        setCurrentToast((prev) => (prev ? { ...prev, isPaused: false } : null));
      }
    },
    [currentToast]
  );

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const variant = options?.variant || "success";
      const duration = options?.duration || DEFAULT_DURATION[variant];

      const newToast: Toast = {
        id,
        message,
        variant,
        duration,
      };

      if (currentToast) {
        // Add to queue if a toast is already showing
        queueRef.current.push(newToast);
      } else {
        // Show immediately if no toast is visible
        setCurrentToast(newToast);
        remainingTimeRef.current = duration;
        startTimeRef.current = Date.now();
      }
    },
    [currentToast]
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

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { variant: "warning", duration });
    },
    [showToast]
  );

  const contextValue: ToastContextValue = {
    toasts: currentToast ? [currentToast] : [],
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
    pauseToast,
    resumeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container - bottom-left (desktop), bottom-center above nav (mobile) */}
      <div className="pointer-events-none fixed right-4 bottom-20 left-4 z-60 flex flex-col items-center md:right-auto md:bottom-6 md:left-6 md:items-start">
        <AnimatePresence mode="wait">
          {currentToast && (
            <ActionToast
              key={currentToast.id}
              message={currentToast.message}
              show={true}
              variant={currentToast.variant}
              onDismiss={() => dismissToast(currentToast.id)}
              onMouseEnter={() => pauseToast(currentToast.id)}
              onMouseLeave={() => resumeToast(currentToast.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
