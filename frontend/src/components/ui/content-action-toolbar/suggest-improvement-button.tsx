'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { SuggestImprovementModal } from './suggest-improvement-modal';

/**
 * Suggest Improvement Button Component
 *
 * Opens modal dialog for users to submit content improvement suggestions.
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
 * Feature: 005-action-toolbar-refactor (Bug Fix)
 * Reference: Restore missing Suggest Improvement feature
 *
 * @param props - Component props including contentSlug and variant
 * @returns Suggest Improvement button component with modal
 */

export interface SuggestImprovementButtonProps {
  /** Content slug for API endpoint */
  contentSlug: string;

  /** Display variant (icon-only or icon-with-label) */
  variant?: 'icon-only' | 'icon-with-label';

  /** Callback when suggestion submitted successfully */
  onSuggestionSuccess?: () => void;
}

export function SuggestImprovementButton({
  contentSlug,
  variant = 'icon-with-label',
  onSuggestionSuccess,
}: SuggestImprovementButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  // Animation configuration
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: 0.95 },
      };

  // Button component to trigger modal
  const triggerButton = (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        {...scaleAnimation}
        type="button"
        aria-label="Suggest improvement"
        className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Lightbulb className="h-5 w-5" />
      </motion.button>

      {variant === 'icon-with-label' && (
        <span className="mt-1 text-xs font-normal text-[var(--color-text-secondary)]">
          Suggest
        </span>
      )}
    </div>
  );

  return (
    <SuggestImprovementModal
      contentSlug={contentSlug}
      trigger={triggerButton}
      onSuccess={onSuggestionSuccess}
    />
  );
}
