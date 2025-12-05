"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReactionButtonsProps } from "@/types/content-action-toolbar/component-props";
import { useAuth } from "@/components/providers/auth-provider";
import { submitReaction, deleteReaction } from "@/lib/api";
import { ReactionType } from "@/types/reaction";
import { useToast } from "@/hooks/use-toast";
import { motionDuration, motionEasing } from "@/lib/animation";

/**
 * Reaction Buttons Component
 *
 * Displays reaction emojis with counts in horizontal or vertical layout.
 * Supports orientation switching for desktop (vertical) and mobile (horizontal).
 *
 * Visual States:
 * - Selected (Authenticated): Circular ocean blue background, scaled emoji, bounce animation
 * - Unselected (Authenticated): Light gray hover background
 * - Unauthenticated: Dimmed opacity (50%), disabled interaction
 *
 * Accessibility:
 * - ARIA pressed state for selected reactions
 * - Keyboard navigation support
 * - Respects prefers-reduced-motion
 *
 * Feature: 005-action-toolbar-refactor (Wireframe Update)
 * Reference: wireframe 01-layout-content-action-toolbar.png
 *
 * @param props - Component props including reactions array, orientation, and authentication state
 * @returns Reaction buttons component with enhanced visual feedback
 */
type ReactionApiError = {
  response?: {
    status?: number;
  };
  message?: string;
};

export function ReactionButtons({
  reactions,
  contentId,
  contentSlug,
  isAuthenticated,
  orientation = "horizontal",
  onReactionToggle,
}: ReactionButtonsProps) {
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(
    null
  );
  const [isRateLimited, setIsRateLimited] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const toast = useToast();

  // Get auth session for API calls
  const { session } = useAuth();

  /**
   * Handle reaction toggle with optimistic UI update and real API integration
   */
  const handleReactionClick = async (reactionId: string) => {
    // Prevent interaction if not authenticated
    if (!isAuthenticated || !session?.access_token) {
      toast.showError("Please sign in to react to content", 5000);
      return;
    }

    // Prevent duplicate clicks
    if (pendingReaction === reactionId) {
      return;
    }

    // Prevent clicks during rate limit cooldown
    if (isRateLimited) {
      toast.showError("Please wait a moment before reacting again");
      return;
    }

    // Find the reaction
    const reaction = reactions.find((r) => r.id === reactionId);
    if (!reaction) return;

    // Reaction ID is already the backend type (LOVE, CELEBRATE, etc.)
    const reactionType = reactionId as ReactionType;
    const wasSelected = reaction.isSelected;

    // Optimistic update - trigger animation
    setAnimatingReaction(reactionId);
    setPendingReaction(reactionId);

    // Calculate new count and selection state for optimistic update
    const optimisticCount = wasSelected
      ? reaction.count - 1
      : reaction.count + 1;
    const shouldBeSelected = !wasSelected;

    // Call parent callback for optimistic update
    onReactionToggle?.(reactionId, optimisticCount, shouldBeSelected);

    try {
      if (wasSelected) {
        // Remove reaction (clicking same reaction to remove it)
        await deleteReaction(contentId);
        // State already updated optimistically, no need to call again
      } else {
        // Add new reaction (or switch from previous reaction)
        // Backend will automatically remove the previous reaction when adding a new one
        const response = await submitReaction({
          contentId,
          reactionType,
        });
        // Update with server count (more accurate than optimistic), keep selection state
        onReactionToggle?.(reactionId, response.count, true);
      }

      // Clear pending state after successful API call
      setPendingReaction(null);
      setAnimatingReaction(null);
    } catch (error: unknown) {
      const apiError = error as ReactionApiError;
      const status = apiError.response?.status;
      // Rollback optimistic update on error (restore original state)
      onReactionToggle?.(reactionId, reaction.count, wasSelected);

      // Clear animation states
      setPendingReaction(null);
      setAnimatingReaction(null);

      // Handle specific error codes
      if (status === 401) {
        toast.showError("Please sign in again to react", 5000);
      } else if (status === 429) {
        // Rate limit exceeded - enforce cooldown period
        setIsRateLimited(true);
        toast.showError(
          "Too many reactions. Please wait 60 seconds before trying again",
          60000
        );

        // Clear rate limit after 60 seconds (backend allows 10 per minute)
        setTimeout(() => {
          setIsRateLimited(false);
        }, 60000);
      } else if (status === 404) {
        toast.showError("Content not found", 5000);
      } else {
        toast.showError("Failed to submit reaction. Please try again", 5000);
      }

      console.error("Failed to submit reaction:", {
        error,
        contentId,
        contentSlug,
        reactionId,
      });
    }
  };

  return (
    <div
      role="group"
      aria-label="Content reactions"
      className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} gap-2`}
    >
      {reactions.map((reaction) => {
        const isSelected = reaction.isSelected;
        const isAnimating = animatingReaction === reaction.id;

        return (
          <motion.button
            key={reaction.id}
            type="button"
            onClick={() => handleReactionClick(reaction.id)}
            disabled={!isAuthenticated}
            aria-label={reaction.ariaLabel}
            aria-pressed={isSelected}
            animate={
              isAnimating && !prefersReducedMotion
                ? {
                    scale: [1, 1.2, 1],
                    transition: {
                      duration: motionDuration.normal,
                      ease: motionEasing.inOut,
                    },
                  }
                : undefined
            }
            className={`focus-ring flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 transition-all ${
              isSelected
                ? "scale-110 bg-[var(--color-ocean-blue)] text-white"
                : "hover:bg-mist-200 dark:hover:bg-basalt-800 bg-[var(--color-background-secondary)]"
            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isAnimating ? "animate-bounce-reaction" : ""} `}
          >
            {/* Emoji */}
            <span className={`text-lg ${isSelected ? "scale-110" : ""}`}>
              {reaction.emoji}
            </span>

            {/* Count */}
            {reaction.count > 0 && (
              <span
                className={`text-sm font-medium ${isSelected ? "text-white" : "text-[var(--color-text-secondary)]"}`}
              >
                {reaction.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
