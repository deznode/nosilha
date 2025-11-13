"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "../catalyst-ui/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/catalyst-ui/dialog";
import { CopyLinkButton } from "./CopyLinkButton";
import { ActionToast } from "./ActionToast";

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
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setSupportsNativeShare(true);
    }
  }, []);

  const truncatedDescription = useMemo(() => {
    if (!description) {
      return title;
    }
    if (description.length <= 160) {
      return description;
    }
    return `${description.slice(0, 157)}…`;
  }, [description, title]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  /**
   * Handle share button click
   * Tries Web Share API first, falls back to custom dialog
   */
  const handleShare = async () => {
    if (!supportsNativeShare) {
      setIsFallbackOpen(true);
      return;
    }

    try {
      const shareData: ShareData = {
        title,
        text: truncatedDescription,
        url,
      };

      await navigator.share(shareData);
      setStatus("shared");
      showSuccessToast("Content shared successfully");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setStatus("idle");
      } else {
        console.error("Share failed:", error);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    showSuccessToast("Facebook share window opened");
    setIsFallbackOpen(false);
  };

  const Icon =
    status === "shared" || status === "copied" ? CheckIcon : ShareIcon;

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

      <ActionToast message={toastMessage} show={showToast} />

      <Dialog open={isFallbackOpen} onClose={() => setIsFallbackOpen(false)}>
        <DialogTitle>Share this story</DialogTitle>
        <DialogDescription>
          Native sharing isn&apos;t available in this browser. Use the options
          below to copy or share the canonical link.
        </DialogDescription>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Copy link
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Copies the canonical URL ({url}) to your clipboard.
              </p>
              <div className="mt-2">
                <CopyLinkButton
                  url={url}
                  onCopied={() => setIsFallbackOpen(false)}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Share to Facebook
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Preferred platform for diaspora networks.
              </p>
              <Button
                className="mt-2 w-full md:w-auto"
                onClick={handleFacebookShare}
                aria-label="Share on Facebook"
              >
                Open Facebook Share
              </Button>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsFallbackOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
