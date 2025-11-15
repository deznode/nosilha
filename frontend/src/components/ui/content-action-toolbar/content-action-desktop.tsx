'use client';

import { ContentActionDesktopProps } from '@/types/content-action-toolbar/component-props';
import { ReactionButtons } from './reaction-buttons';
import { ShareButton } from './share-button';
import { CopyLinkButton } from './copy-link-button';
import { PrintButton } from './print-button';
import { SuggestImprovementButton } from './suggest-improvement-button';

/**
 * Desktop Left-Rail Content Action Toolbar (Wireframe Update)
 *
 * Fixed left-rail container with background card styling, vertically centered in viewport.
 * Displays actions in vertical stack per wireframe: Share → Reactions (vertical) → Copy Link → Print → Suggest.
 *
 * Visual Specifications (Wireframe Alignment):
 * - Position: Fixed, left-4, vertically centered (top-1/2 -translate-y-1/2)
 * - Layout: Vertical stack with 12px spacing (gap-3)
 * - Background: Card with rounded corners and subtle shadow
 * - Action Order: Share, Reactions (❤️ 🎉 💡 👏 vertical), Copy Link, Print, Suggest Improvement
 * - All buttons: icon + label variant
 *
 * Feature: 005-action-toolbar-refactor (Wireframe Update)
 * Reference: wireframe 01-layout-content-action-toolbar.png
 *
 * @param props - Component props including content context and reactions
 * @returns Desktop toolbar component matching wireframe
 */
export function ContentActionDesktop({
  contentId,
  contentSlug,
  contentTitle,
  contentUrl,
  reactions,
  isAuthenticated,
  onReactionToggle,
}: ContentActionDesktopProps) {
  return (
    <div
      role="toolbar"
      aria-label="Content actions"
      className="fixed left-4 top-1/2 z-40 -translate-y-1/2"
    >
      {/* Background card container with rounded corners and shadow */}
      <div className="flex flex-col gap-3 rounded-lg bg-[var(--color-background-primary)] p-4 shadow-md">
        {/* 1. Share Button (icon + label) */}
        <ShareButton
          title={contentTitle}
          url={contentUrl}
          variant="icon-with-label"
        />

        {/* 2. Reactions (vertical orientation, ❤️ 🎉 💡 👏) */}
        <ReactionButtons
          reactions={reactions}
          contentId={contentId}
          contentSlug={contentSlug}
          isAuthenticated={isAuthenticated}
          orientation="vertical"
          onReactionToggle={onReactionToggle}
        />

        {/* 3. Copy Link Button (icon + label) */}
        <CopyLinkButton
          url={contentUrl}
          variant="icon-with-label"
        />

        {/* 4. Print Button (icon + label) */}
        <PrintButton
          variant="icon-with-label"
        />

        {/* 5. Suggest Improvement Button (icon + label) */}
        <SuggestImprovementButton
          contentSlug={contentSlug}
          variant="icon-with-label"
        />
      </div>
    </div>
  );
}
