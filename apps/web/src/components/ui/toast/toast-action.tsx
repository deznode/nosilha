"use client";

import type { ToastAction as ToastActionType } from "@/types/toast";

interface ToastActionProps {
  action: ToastActionType;
  onActionClick: () => void;
}

/**
 * Action button slot for actionable toasts (snackbars).
 *
 * Features:
 * - Keyboard accessible (Enter/Space to activate)
 * - Visible focus ring for accessibility
 * - Dismisses toast after action fires
 */
export function ToastAction({ action, onActionClick }: ToastActionProps) {
  const handleClick = () => {
    action.onClick();
    onActionClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="ml-3 flex-shrink-0 rounded-md px-2 py-1 text-sm font-semibold transition-colors duration-150 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
      aria-label={action.label}
    >
      {action.label}
    </button>
  );
}
