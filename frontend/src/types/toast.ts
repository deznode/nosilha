export type ToastVariant = "success" | "error";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
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
  dismissToast: (id: string) => void;
}
