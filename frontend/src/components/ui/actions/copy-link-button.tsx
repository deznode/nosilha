"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link as LinkIcon, Check } from "lucide-react";

/**
 * Copy Link Button Component
 *
 * Copies content URL to clipboard and shows success toast.
 *
 * Visual States:
 * - Default: Light gray circular background
 * - Hover: Darker gray background
 * - Active (after copy): Ocean blue background with white icon
 * - Success Toast: Green background with checkmark, auto-dismiss after 2s
 *
 * Accessibility:
 * - Min touch target: 44×44px (WCAG 2.1 AAA)
 * - ARIA label for action
 * - Keyboard navigation support
 * - Respects prefers-reduced-motion
 *
 * Feature: 005-action-toolbar-refactor (Wireframe Update)
 * Reference: wireframe 01-layout-content-action-toolbar.png
 *
 * @param props - Component props
 * @returns Copy link button component
 */

export interface CopyLinkButtonProps {
  url: string;
  variant?: "icon-only" | "icon-with-label";
  onCopySuccess?: () => void;
}

export function CopyLinkButton({
  url,
  variant = "icon-with-label",
  onCopySuccess,
}: CopyLinkButtonProps) {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  /**
   * Handle copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);

      // Show active state briefly
      setIsActive(true);
      setShowSuccessToast(true);

      // Call success callback
      onCopySuccess?.();

      // Reset active state after animation
      setTimeout(() => {
        setIsActive(false);
      }, 300);

      // Hide toast after 2 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Check if clipboard API is available
  const isClipboardAvailable =
    typeof navigator !== "undefined" && navigator.clipboard;

  // Animation configuration
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: 0.95 },
      };

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <motion.button
          {...scaleAnimation}
          type="button"
          onClick={handleCopyLink}
          disabled={!isClipboardAvailable}
          aria-label="Copy link to clipboard"
          className={`focus-ring flex h-11 w-11 items-center justify-center rounded-full transition-all ${
            isActive
              ? "bg-[var(--color-ocean-blue)] text-white"
              : "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:bg-gray-200 dark:hover:bg-gray-700"
          } ${!isClipboardAvailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
        >
          <LinkIcon className="h-5 w-5" />
        </motion.button>

        {variant === "icon-with-label" && (
          <span className="mt-1 text-xs font-normal text-[var(--color-text-secondary)]">
            Copy Link
          </span>
        )}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-[var(--color-valley-green)] px-4 py-3 text-white shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">Link copied!</span>
        </motion.div>
      )}
    </>
  );
}
