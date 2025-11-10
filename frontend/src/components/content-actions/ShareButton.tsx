"use client";

import React, { useState } from "react";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "../catalyst-ui/button";

interface ShareButtonProps {
  /**
   * Title of the content to share
   */
  title: string;

  /**
   * URL of the content to share
   */
  url: string;

  /**
   * Description for social sharing (optional)
   */
  description?: string;

  /**
   * Image URL for Open Graph preview (optional)
   */
  image?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Share Button Component
 *
 * Enables users to share cultural heritage content using the native device share dialog
 * (Web Share API) with automatic fallback to clipboard for desktop browsers.
 *
 * **Behavior**:
 * - Mobile devices: Opens native share sheet with app options
 * - Desktop with Web Share API: Opens system share dialog
 * - Desktop without Web Share API: Falls back to copying link to clipboard
 *
 * **Accessibility**:
 * - ARIA live region announces share success/failure
 * - Clear visual feedback with icon swap
 * - Keyboard accessible (Enter/Space)
 *
 * @example
 * <ShareButton
 *   title="Eugénio Tavares Monument"
 *   url="https://nosilha.com/directory/entry/eugenio-tavares-monument"
 *   description="Historic monument dedicated to the famous morna poet"
 * />
 */
export function ShareButton({
  title,
  url,
  description,
  image: _image,
  className = "",
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "error">(
    "idle"
  );

  /**
   * Handle share button click
   * Tries Web Share API first, falls back to clipboard
   */
  const handleShare = async () => {
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        // Prepare share data
        const shareData: ShareData = {
          title,
          text: description || title,
          url,
        };

        // Try to share using native share dialog
        await navigator.share(shareData);

        // Success - update status
        setStatus("shared");

        // Reset status after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);

        // Success - update status
        setStatus("copied");

        // Reset status after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      // Handle errors (user cancelled share or clipboard failed)
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled the share dialog - this is expected behavior, not an error
        setStatus("idle");
      } else {
        // Actual error occurred
        console.error("Share failed:", error);
        setStatus("error");

        // Reset error status after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      }
    }
  };

  // Determine button icon based on status
  const Icon =
    status === "shared" || status === "copied" ? CheckIcon : ShareIcon;

  // Determine button label based on status
  const getButtonLabel = () => {
    switch (status) {
      case "shared":
        return "Shared!";
      case "copied":
        return "Link Copied!";
      case "error":
        return "Failed";
      default:
        return "Share";
    }
  };

  return (
    <>
      <Button
        type="button"
        outline
        onClick={handleShare}
        className={className}
        aria-label={`Share ${title}`}
        disabled={status === "shared" || status === "copied"}
      >
        <Icon data-slot="icon" />
        {getButtonLabel()}
      </Button>

      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === "shared" && "Content shared successfully"}
        {status === "copied" && "Link copied to clipboard"}
        {status === "error" && "Failed to share content"}
      </div>
    </>
  );
}
