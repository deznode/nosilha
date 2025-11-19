"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ContentActionFABProps } from "@/types/content-action-toolbar/component-props";
import { Sparkles, X } from "lucide-react";
import {
  iconButtonTap,
  menuFadeIn,
  makeScaleIn,
  motionDuration,
  motionEasing,
  motionDistance,
} from "@/lib/animation";
import { ReactionButtons } from "@/components/ui/actions/reaction-buttons";
import { ShareButton } from "@/components/ui/actions/share-button";
import { CopyLinkButton } from "@/components/ui/actions/copy-link-button";
import { PrintButton } from "@/components/ui/actions/print-button";
import { SuggestImprovementButton } from "@/components/ui/actions/suggest-improvement-button";

/**
 * Content Action FAB (Floating Action Button) - Wireframe Update
 *
 * Circular floating action button at bottom-right that expands upward to show actions menu.
 * Visible only on mobile viewports (<768px).
 *
 * Action Order (Wireframe Alignment with Visual Grouping):
 * - Group 1: Share + Copy Link (Sharing Actions)
 * - Group 2: Reactions (horizontal: ❤️ 🎉 💡 👏)
 * - Group 3: Print + Suggest (Utility Actions)
 *
 * Behavior:
 * - Tap FAB: Expand menu upward with stagger animation
 * - Tap outside: Collapse menu
 * - Escape key: Collapse menu
 *
 * Accessibility:
 * - Min touch target: 56×56px (exceeds 44×44px WCAG AAA)
 * - Proper ARIA attributes for expansion state
 * - Keyboard navigation support
 *
 * Feature: 005-action-toolbar-refactor (Wireframe Update)
 * Reference: wireframe 01-layout-content-action-toolbar.png
 *
 * @param props - Component props including content context and reactions
 * @returns Mobile FAB component with expandable menu matching wireframe
 */
export function ContentActionFAB({
  contentId,
  contentSlug,
  contentTitle,
  contentUrl,
  contentType,
  reactions,
  isAuthenticated,
  onReactionToggle,
  isVisible = true,
}: ContentActionFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Toggle FAB expansion
  const handleToggle = () => {
    if (isAnimating) return; // Prevent concurrent animations
    if (!isVisible) return; // Prevent interaction when hidden
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    setTimeout(() => setIsAnimating(false), 200); // Match animation duration
  };

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        if (isExpanded) {
          setIsExpanded(false);
        }
      }
    };

    // Escape key to collapse
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  // Use centralized menu animation
  const menuAnimation = prefersReducedMotion
    ? {}
    : {
        variants: menuFadeIn,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      };

  const menuItemAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: motionDistance.small },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: motionDistance.small },
      };

  // FAB entrance animation
  const fabScaleIn = makeScaleIn();

  return (
    <div
      ref={fabRef}
      className="fixed right-4 bottom-4 z-50"
      data-testid="content-action-fab"
      aria-hidden={!isVisible}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      {/* Expanded Menu (appears above FAB) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            {...menuAnimation}
            className="mb-4 flex flex-col rounded-lg bg-[var(--color-background-primary)] p-4 shadow-lg"
          >
            {/* Group 1: Sharing Actions */}
            <div className="flex flex-col gap-2">
              {/* 1. Share Button (icon-only for mobile space efficiency) */}
              <motion.div {...menuItemAnimation} transition={{ delay: 0.05 }}>
                <ShareButton
                  title={contentTitle}
                  url={contentUrl}
                  variant="icon-only"
                />
              </motion.div>

              {/* 2. Copy Link Button (icon-only) */}
              <motion.div {...menuItemAnimation} transition={{ delay: 0.1 }}>
                <CopyLinkButton url={contentUrl} variant="icon-only" />
              </motion.div>
            </div>

            {/* Visual Separator */}
            <div className="border-border-primary my-3 border-t" />

            {/* Group 2: Reactions (horizontal orientation, ❤️ 🎉 💡 👏) */}
            <motion.div {...menuItemAnimation} transition={{ delay: 0.15 }}>
              <ReactionButtons
                reactions={reactions}
                contentId={contentId}
                contentSlug={contentSlug}
                isAuthenticated={isAuthenticated}
                orientation="horizontal"
                onReactionToggle={onReactionToggle}
              />
            </motion.div>

            {/* Visual Separator */}
            <div className="border-border-primary my-3 border-t" />

            {/* Group 3: Utility Actions */}
            <div className="flex flex-col gap-2">
              {/* 3. Print Button (icon-only) */}
              <motion.div {...menuItemAnimation} transition={{ delay: 0.2 }}>
                <PrintButton variant="icon-only" />
              </motion.div>

              {/* 4. Suggest Improvement Button (icon-only) */}
              <motion.div {...menuItemAnimation} transition={{ delay: 0.25 }}>
                <SuggestImprovementButton
                  contentId={contentId}
                  contentTitle={contentTitle}
                  contentType={contentType}
                  pageUrl={contentUrl}
                  variant="icon-only"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Trigger Button */}
      <motion.button
        whileTap={prefersReducedMotion ? undefined : iconButtonTap}
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={
          prefersReducedMotion
            ? false
            : {
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8,
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: motionDuration.normal, ease: motionEasing.out }
        }
        type="button"
        onClick={handleToggle}
        aria-label={
          isExpanded
            ? "Close content actions menu"
            : "Open content actions menu"
        }
        aria-expanded={isExpanded}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ocean-blue)] text-white shadow-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-[var(--color-ocean-blue)] focus:ring-offset-2 focus:outline-none"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
}
