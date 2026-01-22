"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import clsx from "clsx";

type DialogVariant = "danger" | "warning" | "default";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
}

const VARIANT_CONFIG: Record<
  DialogVariant,
  {
    icon: typeof AlertTriangle;
    iconBg: string;
    iconColor: string;
    buttonClass: string;
  }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    buttonClass:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonClass:
      "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600",
  },
  default: {
    icon: AlertCircle,
    iconBg: "bg-ocean-blue/10 dark:bg-ocean-blue/20",
    iconColor: "text-ocean-blue dark:text-ocean-blue-light",
    buttonClass:
      "bg-ocean-blue hover:bg-ocean-blue-deep focus:ring-ocean-blue dark:bg-ocean-blue dark:hover:bg-ocean-blue-deep",
  },
};

/**
 * Reusable confirmation dialog component for destructive or important actions.
 *
 * Replaces window.confirm with an accessible, styled dialog that matches
 * the design system and supports different variants for context-appropriate styling.
 *
 * @example
 * <ConfirmationDialog
 *   isOpen={showDeleteConfirm}
 *   onClose={() => setShowDeleteConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Entry?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   variant="danger"
 * />
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    // Don't close here - let the parent handle closing after async operation completes
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div
                  className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    config.iconBg
                  )}
                >
                  <Icon
                    className={clsx("h-6 w-6", config.iconColor)}
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <DialogTitle className="mt-4 font-serif text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </DialogTitle>

                {/* Description */}
                {description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={clsx(
                      "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                      config.buttonClass
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      confirmLabel
                    )}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

/**
 * Archive-specific variant with appropriate icon.
 */
export function ArchiveConfirmationDialog(
  props: Omit<ConfirmationDialogProps, "variant">
) {
  return <ConfirmationDialog {...props} variant="warning" />;
}
