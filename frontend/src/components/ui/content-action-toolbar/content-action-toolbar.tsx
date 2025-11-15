'use client';

import { useState, useEffect } from 'react';
import { ContentActionToolbarProps, Reaction } from '@/types/content-action-toolbar/component-props';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { ContentActionDesktop } from './content-action-desktop';
import { ContentActionFAB } from './content-action-fab';
import { getReactionCounts } from '@/lib/api';
import { reactionIdToType, type ReactionId } from '@/types/reaction';

/**
 * Content Action Toolbar - Main Container
 *
 * Root container that switches between desktop and mobile layouts based on viewport width.
 * - Desktop (≥768px): Fixed right-rail toolbar (ContentActionDesktop)
 * - Mobile (<768px): Floating Action Button (ContentActionFAB)
 *
 * Responsibilities:
 * - Detect viewport width using useMediaQuery hook (768px breakpoint)
 * - Conditionally render layout variant based on screen size
 * - Pass content context (slug, title, URL) to child components
 *
 * Feature: 005-action-toolbar-refactor
 * Phase: 3 - User Story 1 & 2 (Responsive Layout)
 * Reference: data-model.md § ContentActionToolbar
 *
 * @param props - Component props including content context and reactions
 * @returns Responsive toolbar component
 *
 * @example
 * ```tsx
 * <ContentActionToolbar
 *   contentSlug="faja-dagua-beach"
 *   contentTitle="Fajã d'Água Beach"
 *   contentUrl="https://nosilha.com/directory/beaches/faja-dagua-beach"
 *   reactions={[
 *     { id: 'heart', emoji: '❤️', count: 42, isSelected: false, ariaLabel: 'React with heart' }
 *   ]}
 *   isAuthenticated={true}
 * />
 * ```
 */
export function ContentActionToolbar({
  contentId,
  contentSlug,
  contentTitle,
  contentUrl,
  reactions: initialReactions,
  isAuthenticated,
  className,
}: ContentActionToolbarProps) {
  // Manage local reaction state for optimistic updates
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [isLoading, setIsLoading] = useState(true);

  // Detect viewport width using media query hook
  // Desktop: min-width 768px (Tailwind md: breakpoint)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Fetch initial reaction counts from API on mount
  useEffect(() => {
    const loadReactionCounts = async () => {
      try {
        const counts = await getReactionCounts(contentId);

        // Transform backend data (LOVE, CELEBRATE, etc.) to UI format (love, celebrate, etc.)
        const updatedReactions = initialReactions.map((reaction) => {
          const backendType = reactionIdToType[reaction.id as ReactionId];
          const backendCount = counts.reactions[backendType] || 0;
          const isSelected = counts.userReaction === backendType;

          return {
            ...reaction,
            count: backendCount,
            isSelected,
          };
        });

        setReactions(updatedReactions);
      } catch (error) {
        console.error('Failed to load reaction counts:', error);
        // Keep using initial props as fallback
        setReactions(initialReactions);
      } finally {
        setIsLoading(false);
      }
    };

    loadReactionCounts();
  }, [contentId, initialReactions]);

  /**
   * Handle reaction toggle callback from child components
   * Updates local state optimistically for immediate UI feedback
   */
  const handleReactionToggle = (reactionId: string, newCount: number, shouldBeSelected: boolean) => {
    setReactions((prevReactions) => {
      // Find if user had a different reaction selected
      const previouslySelected = prevReactions.find((r) => r.isSelected && r.id !== reactionId);

      return prevReactions.map((reaction) => {
        if (reaction.id === reactionId) {
          // Set selection state deterministically (no blind toggle)
          return {
            ...reaction,
            isSelected: shouldBeSelected,
            count: newCount,
          };
        }

        // Decrease count of previously selected reaction when switching
        if (previouslySelected && reaction.id === previouslySelected.id) {
          return {
            ...reaction,
            isSelected: false,
            count: Math.max(0, reaction.count - 1), // Prevent negative counts
          };
        }

        // Unselect all other reactions
        return {
          ...reaction,
          isSelected: false,
        };
      });
    });
  };

  // Common props to pass to both layout variants
  const commonProps = {
    contentId,
    contentSlug,
    contentTitle,
    contentUrl,
    reactions,
    isAuthenticated,
    onReactionToggle: handleReactionToggle,
  };

  return (
    <div className={className}>
      {/* Desktop Layout: Fixed right-rail with vertical stack */}
      {isDesktop && <ContentActionDesktop {...commonProps} />}

      {/* Mobile Layout: Floating action button with expandable menu */}
      {!isDesktop && <ContentActionFAB {...commonProps} />}
    </div>
  );
}
