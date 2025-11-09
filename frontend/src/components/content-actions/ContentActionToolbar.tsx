'use client';

import React, { useRef, useState, KeyboardEvent } from 'react';
import { ShareButton } from './ShareButton';
import { CopyLinkButton } from './CopyLinkButton';
import { ReactionButton } from './ReactionButton';
import { SuggestImprovementForm } from './SuggestImprovementForm';
import { PrintButton } from '../ui/print-button';
import { Button } from '@/components/catalyst-ui/button';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface ContentActionToolbarProps {
  /**
   * Unique identifier for the content page (for analytics/tracking)
   */
  contentId: string;

  /**
   * Title of the content to share
   */
  title: string;

  /**
   * Type of content (e.g., 'landmark', 'restaurant', 'hotel')
   */
  contentType?: string;

  /**
   * URL of the content to share (defaults to current page)
   */
  url?: string;

  /**
   * Description for social sharing
   */
  description?: string;

  /**
   * Image URL for Open Graph preview
   */
  image?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Content Action Toolbar Component
 *
 * Implements ARIA toolbar pattern for content actions (share, reactions, copy, print).
 * Provides keyboard navigation and accessibility features for cultural heritage content sharing.
 *
 * **Actions**:
 * - Share: Social sharing with platform detection
 * - Reactions: Emotional responses (❤️ Love, 👍 Helpful, 🤔 Interesting, 🙏 Thank you)
 * - Copy Link: Clipboard integration
 * - Print: Culturally-optimized print view
 *
 * **Keyboard Navigation**:
 * - Tab: Moves focus into/out of toolbar
 * - Arrow Left/Right: Navigate between action buttons
 * - Enter/Space: Activate focused button
 * - Escape: Remove focus from toolbar
 *
 * **Responsive Behavior** (User Story 6):
 * - Mobile (< md / < 768px): Horizontal in-flow layout, stacked sections, 44×44px touch targets
 * - Tablet (md-lg / 768px-1023px): Horizontal in-flow layout with optimized spacing
 * - Desktop (lg+ / 1024px+): Fixed left rail positioning for easy access while reading
 *
 * @example
 * <ContentActionToolbar
 *   contentId="landmark-123"
 *   title="Eugénio Tavares Monument"
 *   description="Historic monument dedicated to the famous morna poet"
 *   url="https://nosilha.com/directory/entry/eugenio-tavares-monument"
 * />
 */
export function ContentActionToolbar({
  contentId,
  title,
  contentType = 'content',
  url,
  description,
  image,
  className = '',
}: ContentActionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isSuggestionFormOpen, setIsSuggestionFormOpen] = useState(false);

  // Get current page URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  /**
   * Handle keyboard navigation within the toolbar
   * Arrow Left/Right: Navigate between buttons
   * Escape: Remove focus from toolbar
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    // Get all focusable buttons within the toolbar
    const buttons = Array.from(
      toolbar.querySelectorAll('button:not([disabled])')
    ) as HTMLButtonElement[];

    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        // Move to next button (wrap to first if at end)
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        // Move to previous button (wrap to last if at beginning)
        const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;

      case 'Escape':
        event.preventDefault();
        // Remove focus from toolbar
        (document.activeElement as HTMLElement)?.blur();
        break;

      case 'Home':
        event.preventDefault();
        // Move to first button
        buttons[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        // Move to last button
        buttons[buttons.length - 1]?.focus();
        break;
    }
  };

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Content actions"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={`
        print:hidden

        /* T043, T044: Responsive hybrid placement (US6) */
        /* Mobile (< md): In-flow horizontal layout below content */
        flex flex-col gap-4
        w-full

        /* Tablet (md-lg): In-flow with optimized spacing */
        md:gap-5

        /* Desktop (lg+): Fixed left rail for easy access while reading */
        lg:fixed lg:left-4 lg:top-24
        lg:w-64 lg:max-h-[calc(100vh-8rem)]
        lg:overflow-y-auto lg:overflow-x-hidden
        lg:sticky

        /* Ensure no horizontal scroll on any viewport (T046) */
        overflow-x-hidden

        ${className}
      `.trim()}
      data-content-id={contentId}
    >
      {/* Primary actions: Share, Copy, Print */}
      {/* T045: Ensure 44×44px minimum touch targets on mobile */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <ShareButton
          title={title}
          url={shareUrl}
          description={description}
          image={image}
        />
        <CopyLinkButton url={shareUrl} />
        <PrintButton
          variant="secondary"
          label="Print"
          showIcon={true}
        />
      </div>

      {/* Reaction section (User Story 2: Emotional Connection) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How does this content make you feel?
        </h3>
        <ReactionButton contentId={contentId} />
      </div>

      {/* Suggestion section (User Story 3: Community Contributions) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Help preserve cultural heritage
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Share your knowledge or suggest improvements to this content
        </p>
        <Button
          onClick={() => setIsSuggestionFormOpen(true)}
          className="w-full md:w-auto"
          aria-label="Suggest improvement to this content"
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          Suggest Improvement
        </Button>
      </div>

      {/* Suggestion Form Modal */}
      <SuggestImprovementForm
        contentId={contentId}
        contentTitle={title}
        contentType={contentType}
        isOpen={isSuggestionFormOpen}
        onClose={() => setIsSuggestionFormOpen(false)}
      />
    </div>
  );
}
