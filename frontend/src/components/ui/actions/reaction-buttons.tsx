"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReactionButtonsProps } from "@/types/content-action-toolbar/component-props";
import { useAuth } from "@/components/providers/auth-provider";
import { submitReaction, deleteReaction } from "@/lib/api";
import { ReactionType } from "@/types/reaction";

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
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Get auth session for API calls
  const { session } = useAuth();

  /**
   * Handle reaction toggle with optimistic UI update and real API integration
   */
  const handleReactionClick = async (reactionId: string) => {
    // Prevent interaction if not authenticated
    if (!isAuthenticated || !session?.access_token) {
      setShowSignInPrompt(true);
      setTimeout(() => setShowSignInPrompt(false), 5000);
      return;
    }

    // Prevent duplicate clicks
    if (pendingReaction === reactionId) {
      return;
    }

    // Prevent clicks during rate limit cooldown
    if (isRateLimited) {
      setErrorMessage("Please wait a moment before reacting again");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Find the reaction
    const reaction = reactions.find((r) => r.id === reactionId);
    if (!reaction) return;

    // Reaction ID is already the backend type (LOVE, CELEBRATE, etc.)
    const reactionType = reactionId as ReactionType;
    const wasSelected = reaction.isSelected;

    // Check if user has a different reaction selected (for switching)
    const previouslySelectedReaction = reactions.find(
      (r) => r.isSelected && r.id !== reactionId
    );

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
    } catch (error: any) {
      // Rollback optimistic update on error (restore original state)
      onReactionToggle?.(reactionId, reaction.count, wasSelected);

      // Clear animation states
      setPendingReaction(null);
      setAnimatingReaction(null);

      // Handle specific error codes
      if (error?.response?.status === 401) {
        setErrorMessage("Please sign in again to react");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 5000);
      } else if (error?.response?.status === 429) {
        // Rate limit exceeded - enforce cooldown period
        setIsRateLimited(true);
        setErrorMessage(
          "Too many reactions. Please wait 60 seconds before trying again"
        );
        setShowErrorToast(true);

        // Clear rate limit after 60 seconds (backend allows 10 per minute)
        setTimeout(() => {
          setIsRateLimited(false);
          setShowErrorToast(false);
        }, 60000);
      } else if (error?.response?.status === 404) {
        setErrorMessage("Content not found");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 5000);
      } else {
        setErrorMessage("Failed to submit reaction. Please try again");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 5000);
      }

      console.error("Failed to submit reaction:", error);
    }
  };

  return (
    <div className="relative">
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
                        duration: 0.3,
                        ease: "easeInOut",
                      },
                    }
                  : undefined
              }
              className={`focus-ring flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 transition-all ${
                isSelected
                  ? "scale-110 bg-[var(--color-ocean-blue)] text-white"
                  : "bg-[var(--color-background-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700"
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

      {/* Sign-in Prompt Toast */}
      {showSignInPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 shadow-md dark:bg-blue-900/20 dark:text-blue-300"
          role="alert"
        >
          Please{" "}
          <a href="/login" className="font-medium underline hover:no-underline">
            sign in
          </a>{" "}
          to react to content
        </motion.div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 shadow-md dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          {errorMessage}
        </motion.div>
      )}
    </div>
  );
}
