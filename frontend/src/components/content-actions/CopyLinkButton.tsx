"use client";

import React, { useState, useEffect, useRef } from "react";
import { LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "../catalyst-ui/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/catalyst-ui/dialog";
import { ActionToast } from "./ActionToast";

interface CopyLinkButtonProps {
  /**
   * URL to copy to clipboard
   */
  url: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional callback fired when copy succeeds
   */
  onCopied?: () => void;
}

/**
 * Copy Link Button Component
 *
 * Provides a simple way to copy the page URL to the clipboard.
 * Serves as a fallback for devices without Web Share API support.
 *
 * **Behavior**:
 * - Copies URL to clipboard using Clipboard API
 * - Shows visual confirmation with CheckIcon for 2-3 seconds
 * - Announces success to screen readers via ARIA live region
 *
 * **Accessibility**:
 * - ARIA live region announces "Link copied to clipboard"
 * - Clear visual feedback with icon swap
 * - Keyboard accessible (Enter/Space)
 * - Button disabled during confirmation period
 *
 * @example
 * <CopyLinkButton url="https://nosilha.com/directory/entry/eugenio-tavares-monument" />
 */
export function CopyLinkButton({
  url,
  className = "",
  onCopied,
}: CopyLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success"
  );
  const [isManualCopyModalOpen, setIsManualCopyModalOpen] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerToast = (
    message: string,
    variant: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const openManualCopyModal = () => {
    setIsManualCopyModalOpen(true);
    setStatus("error");
    triggerToast("Clipboard unavailable. Use manual copy.", "error");
  };

  /**
   * Handle copy button click
   * Copies URL to clipboard and shows confirmation
   */
  const handleCopy = async () => {
    try {
      // Check if Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Copy URL to clipboard
        await navigator.clipboard.writeText(url);

        // Success - update status
        setStatus("copied");
        triggerToast("Link copied to clipboard");
        onCopied?.();

        // Reset status after 2.5 seconds
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        // Clipboard API unavailable - show manual copy modal
        openManualCopyModal();
      }
    } catch (error) {
      // Handle errors
      console.error("Copy failed:", error);
      setStatus("error");
      openManualCopyModal();

      // Reset error status after 2.5 seconds
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  // Determine button icon based on status (T021: Visual confirmation with CheckIcon swap)
  const Icon = status === "copied" ? CheckIcon : LinkIcon;

  // Determine button label based on status
  const getButtonLabel = () => {
    switch (status) {
      case "copied":
        return "Copied!";
      case "error":
        return "Failed";
      default:
        return "Copy Link";
    }
  };

  return (
    <>
      <Button
        type="button"
        outline
        onClick={handleCopy}
        className={className}
        aria-label="Copy link to clipboard"
        disabled={status === "copied"}
      >
        <Icon data-slot="icon" />
        {getButtonLabel()}
      </Button>

      {/* T022: ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === "copied" && "Link copied to clipboard"}
        {status === "error" && "Failed to copy link"}
      </div>

      <ActionToast
        message={toastMessage}
        show={showToast}
        variant={toastVariant}
      />

      <Dialog open={isManualCopyModalOpen} onClose={() => setIsManualCopyModalOpen(false)}>
        <DialogTitle>Manual copy required</DialogTitle>
        <DialogDescription>
          Your browser does not allow automatic copying. Select the URL below
          and press <strong>Cmd+C</strong> (Mac) or <strong>Ctrl+C</strong>{" "}
          (Windows) to copy it manually.
        </DialogDescription>
        <DialogBody>
          <textarea
            readOnly
            value={url}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            rows={3}
            onFocus={(event) => event.currentTarget.select()}
          />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsManualCopyModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
