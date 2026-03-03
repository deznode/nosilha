/**
 * Toast System Types
 *
 * Defines the type system for the fluent ToastBuilder API and toast components.
 */

export type ToastVariant = "success" | "error" | "info" | "warning";

/**
 * Action button configuration for actionable toasts (snackbars).
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

/**
 * Configuration options when creating a toast.
 */
export interface ToastConfig {
  /** Unique ID for deduplication - toasts with same ID won't be duplicated */
  id?: string;
  /** Override default duration in milliseconds */
  duration?: number;
  /** Optional action button for actionable toasts */
  action?: ToastAction;
}

/**
 * Internal toast representation used by the provider.
 */
export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  /** Optional action button */
  action?: ToastAction;
  /** Remaining time when paused (for timer resume) */
  remainingTime?: number;
  /** Whether the toast is currently paused */
  isPaused?: boolean;
}

/**
 * Fluent chain interface returned by ToastBuilder methods.
 * Enables method chaining: toast.success("Saved").action("Undo", fn).show()
 */
export interface ToastChain {
  /** Add an action button to the toast */
  action: (label: string, onClick: () => void) => ToastChain;
  /** Set a deduplication ID - prevents duplicate toasts with same ID */
  id: (dedupeId: string) => ToastChain;
  /** Override the default duration in milliseconds */
  duration: (ms: number) => ToastChain;
  /** Display the toast */
  show: () => void;
}

/**
 * Fluent builder interface returned by useToast().
 * Provides ergonomic API for creating toasts with optional configuration.
 *
 * @example
 * const toast = useToast();
 * toast.success("Profile updated").show();
 * toast.error("Failed to save").duration(8000).show();
 * toast.success("Added to list").action("Change", openPicker).show();
 */
export interface ToastBuilder {
  success: (message: string) => ToastChain;
  error: (message: string) => ToastChain;
  info: (message: string) => ToastChain;
  warning: (message: string) => ToastChain;
}

/**
 * Internal context value for toast provider.
 */
export interface ToastContextValue {
  /** Add a toast to the queue */
  addToast: (toast: Toast) => void;
  /** Dismiss a specific toast */
  dismissToast: (id: string) => void;
  /** Pause timer for a toast (on hover) */
  pauseToast: (id: string) => void;
  /** Resume timer for a toast */
  resumeToast: (id: string) => void;
  /** Check if a toast ID already exists (for deduplication) */
  hasToast: (id: string) => boolean;
  /** Clear current toast and queue */
  clearAll: () => void;
}
