"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { iconButtonTap } from "@/lib/animation";

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
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const toast = useToast();

  /**
   * Handle copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);

      // Show active state briefly
      setIsActive(true);

      // Show success toast
      toast.showSuccess("Link copied!");

      // Call success callback
      onCopySuccess?.();

      // Reset active state after animation
      setTimeout(() => {
        setIsActive(false);
      }, 300);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.showError("Failed to copy link");
    }
  };

  // Check if clipboard API is available
  const isClipboardAvailable =
    typeof navigator !== "undefined" && navigator.clipboard;

  // Animation configuration using centralized tokens
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: iconButtonTap,
      };

  return (
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
            : "hover:bg-mist-200 dark:hover:bg-basalt-800 bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
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
  );
}
