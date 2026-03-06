"use client";

import { useState, useEffect } from "react";
import {
  ContentActionToolbarProps,
  Reaction,
} from "@/types/content-action-toolbar/component-props";
import { useScrollTrigger } from "@/lib/hooks/use-scroll-trigger";
import { ContentActionDesktop } from "./content-action-desktop";
import { ContentActionFAB } from "./content-action-fab";
import { getReactionCounts } from "@/lib/api";

/**
 * Content Action Toolbar - Main Container
 *
 * Root container that switches between desktop and mobile layouts based on viewport width.
 * - Desktop (≥1024px): Fixed right-rail toolbar (ContentActionDesktop)
 * - Mobile/Tablet (<1024px): Floating Action Button (ContentActionFAB)
 *
 * Responsibilities:
 * - Render both layout variants with CSS visibility (lg: breakpoint)
 * - Avoids hydration mismatch by not using JS-based viewport detection for rendering
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
  contentType,
  reactions: initialReactions,
  isAuthenticated,
  className,
  showOnScroll = false,
  scrollThreshold,
}: ContentActionToolbarProps) {
  // Manage local reaction state for optimistic updates
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  // Calculate scroll threshold (default: window.innerHeight - 81px header height)
  const [defaultThreshold] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight - 81 : 600
  );
  const isScrolled = useScrollTrigger(scrollThreshold ?? defaultThreshold);

  // Determine visibility: always show OR show after scroll
  const isVisible = !showOnScroll || isScrolled;

  // Fetch initial reaction counts from API on mount
  useEffect(() => {
    const loadReactionCounts = async () => {
      try {
        const counts = await getReactionCounts(contentId);

        // Update reactions with backend data (already using uppercase: LOVE, CELEBRATE, etc.)
        const updatedReactions = initialReactions.map((reaction) => {
          const backendCount = counts.reactions[reaction.id] || 0;
          const isSelected = counts.userReaction === reaction.id;

          return {
            ...reaction,
            count: backendCount,
            isSelected,
          };
        });

        setReactions(updatedReactions);
      } catch (error) {
        console.error("Failed to load reaction counts:", error);
        // Keep using initial props as fallback
        setReactions(initialReactions);
      }
    };

    loadReactionCounts();
  }, [contentId, initialReactions]);

  /**
   * Handle reaction toggle callback from child components
   * Updates local state optimistically for immediate UI feedback
   */
  const handleReactionToggle = (
    reactionId: string,
    newCount: number,
    shouldBeSelected: boolean
  ) => {
    setReactions((prevReactions) => {
      // Find if user had a different reaction selected
      const previouslySelected = prevReactions.find(
        (r) => r.isSelected && r.id !== reactionId
      );

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
    contentType,
    reactions,
    isAuthenticated,
    onReactionToggle: handleReactionToggle,
    isVisible, // Pass visibility state to child components
  };

  return (
    <div className={className}>
      {/* Desktop Layout: Fixed right-rail with vertical stack (≥1024px) */}
      <div className="hidden lg:block">
        <ContentActionDesktop {...commonProps} />
      </div>

      {/* Mobile Layout: Floating action button with expandable menu (<1024px) */}
      <div className="block lg:hidden">
        <ContentActionFAB {...commonProps} />
      </div>
    </div>
  );
}
