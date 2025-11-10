'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../catalyst-ui/button';
import { useAuth } from '../providers/auth-provider';
import {
  submitReaction,
  deleteReaction,
  getReactionCounts,
} from '@/lib/api';
import type {
  ReactionType,
  ReactionCountsDto,
  ReactionCreateDto,
} from '@/types/reaction';
import {
  REACTION_EMOJIS,
  REACTION_LABELS,
  REACTION_DESCRIPTIONS,
} from '@/types/reaction';

interface ReactionButtonProps {
  /**
   * UUID of the heritage page/content
   */
  contentId: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reaction Button Component
 *
 * Allows users to express emotional responses to cultural heritage content
 * with 4 reaction types: ❤️ Love, 👍 Helpful, 🤔 Interesting, 🙏 Thank you.
 *
 * **Features**:
 * - Displays aggregated reaction counts for all reaction types
 * - Shows login prompt for unauthenticated users
 * - Highlights user's currently selected reaction
 * - Supports reaction change (click different emoji)
 * - Supports reaction removal (click same emoji again - toggle off)
 * - Optimistic UI updates with rollback on error
 * - Rate limiting enforcement (10 reactions/minute per user)
 *
 * **Accessibility**:
 * - ARIA labels for each reaction button
 * - Screen reader announcements for reaction changes
 * - Keyboard accessible (Tab, Enter/Space)
 * - Touch-friendly 44×44px minimum touch targets
 *
 * **Authentication**:
 * - Public viewing of reaction counts (no auth required)
 * - JWT authentication required to submit/change/remove reactions
 * - Login prompt displayed for unauthenticated users attempting to react
 *
 * @example
 * <ReactionButton contentId="789e0123-e45b-67c8-d901-234567890abc" />
 */
export function ReactionButton({
  contentId,
  className = '',
}: ReactionButtonProps) {
  // Authentication state
  const { user, loading: authLoading } = useAuth();

  // Component state
  const [counts, setCounts] = useState<ReactionCountsDto | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Optimistic update state (for rollback)
  const [optimisticState, setOptimisticState] = useState<{
    counts: Record<ReactionType, number>;
    userReaction: ReactionType | null;
  } | null>(null);

  /**
   * Fetch initial reaction counts on component mount
   */
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        const data = await getReactionCounts(contentId);
        setCounts(data);
        setUserReaction(data.userReaction);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch reaction counts:', err);
        setError('Failed to load reactions');
        // Initialize with zero counts on error
        setCounts({
          contentId,
          reactions: { LOVE: 0, HELPFUL: 0, INTERESTING: 0, THANKYOU: 0 },
          userReaction: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [contentId]);

  /**
   * Handle reaction button click
   * Implements optimistic UI updates with rollback on error
   */
  const handleReaction = async (reactionType: ReactionType) => {
    // T035: Check authentication state
    if (!user) {
      setShowLoginPrompt(true);
      setFeedback('Please log in to react to content');
      setTimeout(() => {
        setShowLoginPrompt(false);
        setFeedback(null);
      }, 3000);
      return;
    }

    if (!counts) return;

    // Save current state for potential rollback (T034: Optimistic UI updates)
    const previousState = {
      counts: { ...counts.reactions },
      userReaction,
    };
    setOptimisticState(previousState);

    // Determine action: toggle off, change reaction, or new reaction
    const isTogglingOff = userReaction === reactionType;
    const isChangingReaction = userReaction !== null && userReaction !== reactionType;

    // T034: Optimistic UI update
    const newCounts = { ...counts.reactions };

    if (isTogglingOff) {
      // T039: Remove reaction (toggle off)
      newCounts[reactionType] = Math.max(0, newCounts[reactionType] - 1);
      setUserReaction(null);
      setFeedback(`Removed ${REACTION_LABELS[reactionType]} reaction`);
    } else if (isChangingReaction) {
      // T038: Change reaction
      newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
      newCounts[reactionType] += 1;
      setUserReaction(reactionType);
      setFeedback(`Changed to ${REACTION_LABELS[reactionType]}`);
    } else {
      // New reaction
      newCounts[reactionType] += 1;
      setUserReaction(reactionType);
      setFeedback(`Added ${REACTION_LABELS[reactionType]} reaction`);
    }

    // Update UI optimistically
    setCounts({
      ...counts,
      reactions: newCounts,
      userReaction: isTogglingOff ? null : reactionType,
    });

    // Clear feedback after 2.5 seconds
    setTimeout(() => setFeedback(null), 2500);

    // Submit to backend
    try {
      if (isTogglingOff) {
        // T039: Delete reaction
        await deleteReaction(contentId);
      } else {
        // Submit new or changed reaction
        const createDto: ReactionCreateDto = {
          contentId,
          reactionType,
        };
        await submitReaction(createDto);
      }

      // Clear optimistic state on success
      setOptimisticState(null);
      setError(null);
    } catch (err) {
      console.error('Failed to submit reaction:', err);

      // T034: Rollback optimistic update on error
      if (optimisticState) {
        setCounts({
          ...counts,
          reactions: optimisticState.counts,
          userReaction: optimisticState.userReaction,
        });
        setUserReaction(optimisticState.userReaction);
      }

      // Handle rate limiting error
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Too many reactions')) {
        setError('Rate limit exceeded. Please wait a moment.');
        setFeedback('Too many reactions. Please wait.');
      } else {
        setError('Failed to submit reaction. Please try again.');
        setFeedback('Failed to submit reaction');
      }

      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
        setFeedback(null);
      }, 3000);
    }
  };

  // Render loading state
  if (isLoading || authLoading) {
    return (
      <div className={`flex gap-2 ${className}`.trim()}>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading reactions...
        </div>
      </div>
    );
  }

  // Render error state
  if (!counts) {
    return (
      <div className={`flex gap-2 ${className}`.trim()}>
        <div className="text-sm text-red-600 dark:text-red-400">
          Failed to load reactions
        </div>
      </div>
    );
  }

  // T036: Display reaction counts for all reaction types
  const allReactionTypes: ReactionType[] = ['LOVE', 'HELPFUL', 'INTERESTING', 'THANKYOU'];

  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()}>
      {/* Reaction buttons grid */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Reactions">
        {allReactionTypes.map((type) => {
          const count = counts.reactions[type];
          const isSelected = userReaction === type;
          const emoji = REACTION_EMOJIS[type];
          const label = REACTION_LABELS[type];
          const description = REACTION_DESCRIPTIONS[type];

          // Render selected reactions with default button style
          // Render unselected reactions with outline style
          if (!isSelected) {
            return (
              <Button
                key={type}
                type="button"
                outline
                onClick={() => handleReaction(type)}
                className={`min-w-[80px] min-h-[44px]`}
                aria-label={`${label}: ${description}. ${count} ${count === 1 ? 'person' : 'people'} reacted.`}
                aria-pressed="false"
                title={description}
              >
                <span className="text-xl" aria-hidden="true">
                  {emoji}
                </span>
                <span className="text-sm font-medium">{count}</span>
              </Button>
            );
          }

          return (
            <Button
              key={type}
              type="button"
              onClick={() => handleReaction(type)}
              className={`
                min-w-[80px] min-h-[44px]
                ring-2 ring-blue-500 dark:ring-blue-400
              `.trim()}
              aria-label={`${label}: ${description}. ${count} ${count === 1 ? 'person' : 'people'} reacted. You reacted with this.`}
              aria-pressed="true"
              title={description}
            >
              <span className="text-xl" aria-hidden="true">
                {emoji}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </Button>
          );
        })}
      </div>

      {/* T035: Login prompt for unauthenticated users */}
      {showLoginPrompt && (
        <div
          className="text-sm text-blue-600 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
          role="alert"
        >
          Please{' '}
          <a
            href="/login"
            className="underline hover:no-underline font-medium"
          >
            log in
          </a>{' '}
          to react to content
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div
          className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {feedback}
      </div>
    </div>
  );
}
