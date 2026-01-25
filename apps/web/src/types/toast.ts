export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  /** Remaining time when paused (for timer resume) */
  remainingTime?: number;
  /** Whether the toast is currently paused */
  isPaused?: boolean;
}

export interface ToastOptions {
  duration?: number;
  variant?: ToastVariant;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, options?: ToastOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
}
