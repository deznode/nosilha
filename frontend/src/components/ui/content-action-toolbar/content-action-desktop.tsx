"use client";

import { ContentActionDesktopProps } from "@/types/content-action-toolbar/component-props";
import { ReactionButtons } from "@/components/ui/actions/reaction-buttons";
import { ShareButton } from "@/components/ui/actions/share-button";
import { CopyLinkButton } from "@/components/ui/actions/copy-link-button";
import { PrintButton } from "@/components/ui/actions/print-button";
import { SuggestImprovementButton } from "@/components/ui/actions/suggest-improvement-button";
import { motion, useReducedMotion } from "framer-motion";
import { motionDuration, motionEasing } from "@/lib/animation";

/**
 * Desktop Left-Rail Content Action Toolbar (Wireframe Update)
 *
 * Fixed left-rail container with background card styling, vertically centered in viewport.
 * Displays actions in vertical stack per wireframe: Share → Reactions (vertical) → Copy Link → Print → Suggest.
 *
 * Visual Specifications (Wireframe Alignment):
 * - Position: Fixed, left-4, vertically centered (top-1/2 -translate-y-1/2)
 * - Layout: Vertical stack with visual grouping and dividers
 * - Background: Card with rounded corners and subtle shadow
 * - Action Groups:
 *   1. Sharing Actions (Share + Copy Link) - tight spacing (gap-2)
 *   2. Reactions (❤️ 🎉 💡 👏 vertical)
 *   3. Utility Actions (Print + Suggest) - tight spacing (gap-2)
 * - Dividers: Horizontal borders between groups using border-border-primary
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
  contentType,
  reactions,
  isAuthenticated,
  onReactionToggle,
  isVisible = true,
}: ContentActionDesktopProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      role="toolbar"
      aria-label="Content actions"
      aria-hidden={!isVisible}
      className="fixed top-1/2 left-4 z-40 -translate-y-1/2"
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={
        prefersReducedMotion
          ? false
          : { opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: motionDuration.slow, ease: motionEasing.out }
      }
    >
      {/* Background card container with rounded corners and shadow */}
      <div className="flex flex-col rounded-lg bg-[var(--color-background-primary)] p-4 shadow-md">
        {/* Group 1: Sharing Actions */}
        <div className="flex flex-col gap-2">
          {/* 1. Share Button (icon + label) */}
          <ShareButton
            title={contentTitle}
            url={contentUrl}
            variant="icon-with-label"
          />

          {/* 2. Copy Link Button (icon + label) */}
          <CopyLinkButton url={contentUrl} variant="icon-with-label" />
        </div>

        {/* Visual Separator */}
        <div className="border-border-primary my-3 border-t" />

        {/* Group 2: Reactions (vertical orientation, ❤️ 🎉 💡 👏) */}
        <ReactionButtons
          reactions={reactions}
          contentId={contentId}
          contentSlug={contentSlug}
          isAuthenticated={isAuthenticated}
          orientation="vertical"
          onReactionToggle={onReactionToggle}
        />

        {/* Visual Separator */}
        <div className="border-border-primary my-3 border-t" />

        {/* Group 3: Utility Actions */}
        <div className="flex flex-col gap-2">
          {/* 3. Print Button (icon + label) */}
          <PrintButton variant="icon-with-label" />

          {/* 4. Suggest Improvement Button (icon + label) */}
          <SuggestImprovementButton
            contentId={contentId}
            contentTitle={contentTitle}
            contentType={contentType}
            pageUrl={contentUrl}
            variant="icon-with-label"
          />
        </div>
      </div>
    </motion.div>
  );
}
