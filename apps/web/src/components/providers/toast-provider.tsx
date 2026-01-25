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
import type { Toast as ToastType, ToastContextValue } from "@/types/toast";
import { Toast } from "@/components/ui/toast";

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider with Calm Premium enhancements:
 * - Single toast at a time (queued)
 * - Deduplication by ID
 * - Timer pauses on hover
 * - Keyboard accessibility (Esc to dismiss)
 * - Bottom-left (desktop) / bottom-center (mobile) positioning
 */
export function ToastProvider({ children }: ToastProviderProps) {
  // Current visible toast
  const [currentToast, setCurrentToast] = useState<ToastType | null>(null);
  // Queue of pending toasts
  const queueRef = useRef<ToastType[]>([]);
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

  /**
   * Check if a toast with the given ID already exists (for deduplication).
   */
  const hasToast = useCallback(
    (id: string): boolean => {
      // Check current toast
      if (currentToast?.id === id) {
        return true;
      }
      // Check queue
      return queueRef.current.some((t) => t.id === id);
    },
    [currentToast]
  );

  /**
   * Add a toast to display. If a toast is currently showing, queues it.
   * Used by the ToastBuilder.show() method.
   */
  const addToast = useCallback(
    (toast: ToastType) => {
      if (currentToast) {
        // Add to queue if a toast is already showing
        queueRef.current.push(toast);
      } else {
        // Show immediately if no toast is visible
        setCurrentToast(toast);
        remainingTimeRef.current = toast.duration;
        startTimeRef.current = Date.now();
      }
    },
    [currentToast]
  );

  /**
   * Clear current toast and entire queue.
   */
  const clearAll = useCallback(() => {
    clearTimer();
    setCurrentToast(null);
    queueRef.current = [];
  }, [clearTimer]);

  const contextValue: ToastContextValue = {
    addToast,
    dismissToast,
    pauseToast,
    resumeToast,
    hasToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container - bottom-left (desktop), bottom-center above nav (mobile) */}
      <div className="pointer-events-none fixed right-4 bottom-20 left-4 z-60 flex flex-col items-center md:right-auto md:bottom-6 md:left-6 md:items-start">
        <AnimatePresence mode="wait">
          {currentToast && (
            <Toast
              key={currentToast.id}
              toast={currentToast}
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
