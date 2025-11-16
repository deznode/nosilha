"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { SuggestImprovementForm } from "./suggest-improvement-form";

/**
 * Suggest Improvement Button Component
 *
 * Opens production-ready form dialog for users to submit content improvement suggestions.
 * Follows same visual and interaction patterns as ShareButton, CopyLinkButton, PrintButton.
 *
 * Visual States:
 * - Default: Light gray circular background
 * - Hover: Darker gray background
 * - Active (on tap): Brief ocean blue highlight with scale animation
 *
 * Accessibility:
 * - Min touch target: 44×44px (WCAG 2.1 AAA)
 * - ARIA label for action
 * - Keyboard navigation support
 * - Respects prefers-reduced-motion
 *
 * Feature: 005-action-toolbar-refactor (Consolidation)
 * Reference: Uses production-ready SuggestImprovementForm with full API integration
 *
 * @param props - Component props including content context and variant
 * @returns Suggest Improvement button component with production form
 */

export interface SuggestImprovementButtonProps {
  /** Content UUID for API endpoint */
  contentId: string;

  /** Content title for form context */
  contentTitle: string;

  /** Content type (directory entry type) */
  contentType: string;

  /** Page URL for form submission */
  pageUrl: string;

  /** Display variant (icon-only or icon-with-label) */
  variant?: "icon-only" | "icon-with-label";

  /** Callback when suggestion submitted successfully */
  onSuggestionSuccess?: () => void;
}

export function SuggestImprovementButton({
  contentId,
  contentTitle,
  contentType,
  pageUrl,
  variant = "icon-with-label",
  onSuggestionSuccess,
}: SuggestImprovementButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Animation configuration
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: 0.95 },
      };

  const handleClose = () => {
    setIsOpen(false);
    onSuggestionSuccess?.();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <motion.button
          {...scaleAnimation}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Suggest improvement"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Lightbulb className="h-5 w-5" />
        </motion.button>

        {variant === "icon-with-label" && (
          <span className="mt-1 text-xs font-normal text-[var(--color-text-secondary)]">
            Suggest
          </span>
        )}
      </div>

      <SuggestImprovementForm
        contentId={contentId}
        contentTitle={contentTitle}
        contentType={contentType}
        pageUrl={pageUrl}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}
