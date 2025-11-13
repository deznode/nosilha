"use client";

import React, { useRef, useState, KeyboardEvent, useMemo } from "react";
import { ShareButton } from "./ShareButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { ReactionButton } from "./ReactionButton";
import { SuggestImprovementForm } from "./SuggestImprovementForm";
import { PrintButton } from "../ui/print-button";
import { Button } from "@/components/catalyst-ui/button";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type {
  ContentActionSettings,
  ContentActionType,
} from "@/types/directory";

const DEFAULT_ACTION_ORDER: ContentActionType[] = [
  "SHARE",
  "COPY_LINK",
  "PRINT",
  "REACTIONS",
  "SUGGEST",
];

const PRIMARY_ACTIONS: ContentActionType[] = ["SHARE", "COPY_LINK", "PRINT"];

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
   * Optional action override configuration
   */
  contentActions?: ContentActionSettings | null;

  /**
   * Canonical page URL (used by SuggestImprovementForm when provided)
   */
  pageUrl?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Layout mode.
   * - default: sticky/fixed rail on desktop (directory entry pages)
   * - inline: standard in-flow layout (static pages like History/People)
   */
  layout?: "default" | "inline";
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
  contentType = "content",
  url,
  description,
  image,
  contentActions = null,
  pageUrl,
  className = "",
  layout = "default",
}: ContentActionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isSuggestionFormOpen, setIsSuggestionFormOpen] = useState(false);

  // Get current page URL if not provided
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const suggestionPageUrl = pageUrl || shareUrl;

  const normalizedOrder = useMemo(() => {
    const configured = contentActions?.order ?? DEFAULT_ACTION_ORDER;
    const merged = [...configured, ...DEFAULT_ACTION_ORDER];
    return Array.from(new Set(merged));
  }, [contentActions]);

  const disabledSet = useMemo(
    () => new Set(contentActions?.disabled ?? []),
    [contentActions]
  );

  const finalOrder = normalizedOrder.filter(
    (action) => !disabledSet.has(action)
  );

  const primaryOrder = finalOrder.filter((action) =>
    PRIMARY_ACTIONS.includes(action)
  );

  const isReactionsEnabled = finalOrder.includes("REACTIONS");
  const isSuggestEnabled = finalOrder.includes("SUGGEST");

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
      toolbar.querySelectorAll("button:not([disabled])")
    ) as HTMLButtonElement[];

    const currentIndex = buttons.indexOf(
      document.activeElement as HTMLButtonElement
    );

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        // Move to next button (wrap to first if at end)
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;

      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        // Move to previous button (wrap to last if at beginning)
        const prevIndex =
          currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;

      case "Escape":
        event.preventDefault();
        // Remove focus from toolbar
        (document.activeElement as HTMLElement)?.blur();
        break;

      case "Home":
        event.preventDefault();
        // Move to first button
        buttons[0]?.focus();
        break;

      case "End":
        event.preventDefault();
        // Move to last button
        buttons[buttons.length - 1]?.focus();
        break;
    }
  };

  const sections: React.ReactNode[] = [];
  let primaryRendered = false;
  let reactionsRendered = false;
  let suggestRendered = false;

  finalOrder.forEach((action) => {
    if (PRIMARY_ACTIONS.includes(action) && !primaryRendered) {
      primaryRendered = true;
      if (primaryOrder.length > 0) {
        sections.push(
          <div
            key="primary-actions"
            className="flex flex-wrap gap-2 md:gap-3"
          >
            {primaryOrder.map((primaryAction) => {
              if (primaryAction === "SHARE") {
                return (
                  <ShareButton
                    key="share"
                    title={title}
                    url={shareUrl}
                    description={description}
                    image={image}
                  />
                );
              }
              if (primaryAction === "COPY_LINK") {
                return <CopyLinkButton key="copy" url={shareUrl} />;
              }
              if (primaryAction === "PRINT") {
                return (
                  <PrintButton
                    key="print"
                    variant="secondary"
                    label="Print"
                    showIcon={true}
                  />
                );
              }
              return null;
            })}
          </div>
        );
      }
    } else if (action === "REACTIONS" && !reactionsRendered && isReactionsEnabled) {
      reactionsRendered = true;
      sections.push(
        <div
          key="reactions"
          className="border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            How does this content make you feel?
          </h3>
          <ReactionButton contentId={contentId} />
        </div>
      );
    } else if (action === "SUGGEST" && !suggestRendered && isSuggestEnabled) {
      suggestRendered = true;
      sections.push(
        <div
          key="suggest"
          className="border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Help preserve cultural heritage
          </h3>
          <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            Share your knowledge or suggest improvements to this content
          </p>
          <Button
            onClick={() => setIsSuggestionFormOpen(true)}
            className="w-full md:w-auto"
            aria-label="Suggest improvement to this content"
          >
            <PencilSquareIcon className="mr-2 h-5 w-5" />
            Suggest Improvement
          </Button>
        </div>
      );
    }
  });

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Content actions"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={`/* T043, T044: Responsive hybrid placement (US6) */ /* Mobile (< md): In-flow horizontal layout below content */ /* Tablet (md-lg): In-flow with optimized spacing */ /* Desktop (lg+): Fixed left rail for easy access while reading */ /* Ensure no horizontal scroll on any viewport (T046) */ flex w-full flex-col gap-4 overflow-x-hidden md:gap-5 ${
        layout === "default"
          ? "lg:fixed lg:sticky lg:top-24 lg:left-4 lg:max-h-[calc(100vh-8rem)] lg:w-64 lg:overflow-x-hidden lg:overflow-y-auto"
          : "lg:relative lg:top-auto lg:left-auto lg:w-full lg:max-h-none lg:overflow-visible"
      } print:hidden ${className} `.trim()}
      data-content-id={contentId}
    >
      {sections}

      {isSuggestEnabled && (
        <SuggestImprovementForm
          contentId={contentId}
          contentTitle={title}
          contentType={contentType}
          pageUrl={suggestionPageUrl}
          isOpen={isSuggestionFormOpen}
          onClose={() => setIsSuggestionFormOpen(false)}
        />
      )}
    </div>
  );
}
