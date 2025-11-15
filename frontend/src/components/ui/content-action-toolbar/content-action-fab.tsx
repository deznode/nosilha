'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ContentActionFABProps } from '@/types/content-action-toolbar/component-props';
import { Sparkles, X } from 'lucide-react';
import { ReactionButtons } from './reaction-buttons';
import { ShareButton } from './share-button';
import { CopyLinkButton } from './copy-link-button';
import { PrintButton } from './print-button';

/**
 * Content Action FAB (Floating Action Button) - Wireframe Update
 *
 * Circular floating action button at bottom-right that expands upward to show actions menu.
 * Visible only on mobile viewports (<768px).
 *
 * Action Order (Wireframe Alignment):
 * - Share → Reactions (horizontal) → Copy Link → Print
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
  reactions,
  isAuthenticated,
  onReactionToggle,
}: ContentActionFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Toggle FAB expansion
  const handleToggle = () => {
    if (isAnimating) return; // Prevent concurrent animations
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
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  // Animation configurations
  const fabAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: 0.95 },
      };

  const menuAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { duration: 0.2 },
      };

  const menuItemAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
      };

  return (
    <div
      ref={fabRef}
      className="fixed bottom-4 right-4 z-50"
      data-testid="content-action-fab"
    >
      {/* Expanded Menu (appears above FAB) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            {...menuAnimation}
            className="mb-4 flex flex-col gap-3 rounded-lg bg-[var(--color-background-primary)] p-4 shadow-lg"
          >
            {/* 1. Share Button (icon-only for mobile space efficiency) */}
            <motion.div
              {...menuItemAnimation}
              transition={{ delay: 0.05 }}
            >
              <ShareButton
                title={contentTitle}
                url={contentUrl}
                variant="icon-only"
              />
            </motion.div>

            {/* 2. Reactions (horizontal orientation, ❤️ 🎉 💡 👏) */}
            <motion.div
              {...menuItemAnimation}
              transition={{ delay: 0.1 }}
            >
              <ReactionButtons
                reactions={reactions}
                contentId={contentId}
                contentSlug={contentSlug}
                isAuthenticated={isAuthenticated}
                orientation="horizontal"
                onReactionToggle={onReactionToggle}
              />
            </motion.div>

            {/* 3. Copy Link Button (icon-only) */}
            <motion.div
              {...menuItemAnimation}
              transition={{ delay: 0.15 }}
            >
              <CopyLinkButton
                url={contentUrl}
                variant="icon-only"
              />
            </motion.div>

            {/* 4. Print Button (icon-only) */}
            <motion.div
              {...menuItemAnimation}
              transition={{ delay: 0.2 }}
            >
              <PrintButton
                variant="icon-only"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Trigger Button */}
      <motion.button
        {...fabAnimation}
        type="button"
        onClick={handleToggle}
        aria-label={isExpanded ? 'Close content actions menu' : 'Open content actions menu'}
        aria-expanded={isExpanded}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ocean-blue)] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)] focus:ring-offset-2"
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
