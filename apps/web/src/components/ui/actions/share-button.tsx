"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShareButtonProps,
  ShareOption,
} from "@/types/content-action-toolbar/component-props";
import { Share2, Link, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { iconButtonTap, makeFadeInUp } from "@/lib/animation";

/**
 * Share Button Component
 *
 * Triggers native share API (mobile) or fallback menu (desktop).
 * Shows ocean blue fill and white icon/text when active, scale animation on tap.
 *
 * Behavior:
 * - Mobile: Triggers navigator.share() with title, url, description
 * - Desktop: Shows fallback menu with Facebook, Twitter, Copy Link options
 * - Success: Displays toast with green checkmark for 3 seconds
 *
 * Accessibility:
 * - Min touch target: 44×44px (WCAG 2.1 AAA)
 * - ARIA labels for all options
 * - Keyboard navigation support
 *
 * Feature: 005-action-toolbar-refactor
 * Phase: 6 - User Story 4 (Enhanced Share Button)
 * Reference: data-model.md § ShareButton
 *
 * @param props - Component props including content title, url, description
 * @returns Share button component with native share or fallback menu
 */
export function ShareButton({
  title,
  url,
  description,
  variant = "icon-with-label",
  onShareSuccess,
}: ShareButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [isFallbackMenuOpen, setIsFallbackMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const toast = useToast();

  // Check if native share is available
  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

  /**
   * Handle native share API
   */
  const handleNativeShare = async () => {
    if (!navigator.share) return;

    setIsActive(true);

    try {
      await navigator.share({
        title,
        url,
        text: description,
      });

      // Show success toast
      toast.success("Shared successfully!").show();
      onShareSuccess?.();
    } catch (error) {
      // User cancelled share or error occurred
      console.log("Share cancelled or failed:", error);
    } finally {
      setIsActive(false);
    }
  };

  /**
   * Handle share button click
   */
  const handleShareClick = () => {
    if (hasNativeShare) {
      handleNativeShare();
    } else {
      setIsFallbackMenuOpen(!isFallbackMenuOpen);
    }
  };

  /**
   * Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!").show();
      setIsFallbackMenuOpen(false);
      onShareSuccess?.();
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link").show();
    }
  };

  /**
   * Share to Facebook
   */
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(
      facebookUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
    setIsFallbackMenuOpen(false);
    toast.success("Shared to Facebook!").show();
    onShareSuccess?.();
  };

  /**
   * Share to Twitter
   */
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(
      twitterUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
    setIsFallbackMenuOpen(false);
    toast.success("Shared to Twitter!").show();
    onShareSuccess?.();
  };

  /**
   * Share options for fallback menu
   */
  const shareOptions: ShareOption[] = [
    {
      id: "copy-link",
      label: "Copy Link",
      icon: Link,
      action: handleCopyLink,
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      action: handleFacebookShare,
    },
    {
      id: "twitter",
      label: "Twitter",
      icon: Twitter,
      action: handleTwitterShare,
    },
  ];

  // Click outside to close fallback menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isFallbackMenuOpen) {
          setIsFallbackMenuOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFallbackMenuOpen) {
        setIsFallbackMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFallbackMenuOpen]);

  // Animation configurations using centralized tokens
  const scaleAnimation = prefersReducedMotion
    ? {}
    : {
        whileTap: iconButtonTap,
      };

  // Menu animation using factory
  const menuAnimation = makeFadeInUp(10);

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex flex-col items-center gap-1">
        {/* Share Button */}
        <motion.button
          {...scaleAnimation}
          type="button"
          onClick={handleShareClick}
          aria-label="Share content"
          aria-expanded={isFallbackMenuOpen}
          className={`focus-ring flex h-11 w-11 items-center justify-center rounded-full transition-all ${
            isActive || isFallbackMenuOpen
              ? "bg-ocean-blue text-white"
              : "hover:bg-surface-alt bg-surface text-body"
          } `}
        >
          <Share2 className="h-5 w-5" />
        </motion.button>

        {/* Label */}
        {variant === "icon-with-label" && (
          <span className="text-muted mt-1 text-xs font-normal">Share</span>
        )}
      </div>

      {/* Fallback Menu (Desktop) */}
      {!hasNativeShare && isFallbackMenuOpen && (
        <motion.div
          variants={prefersReducedMotion ? undefined : menuAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="rounded-button bg-canvas shadow-elevated absolute right-0 bottom-14 z-50 flex flex-col gap-2 p-3"
        >
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={option.action}
                aria-label={option.label}
                className="focus-ring hover:bg-surface flex items-center gap-3 rounded-md px-4 py-2 text-left text-sm transition-colors"
              >
                <Icon className="text-ocean-blue h-5 w-5" />
                <span className="text-body">{option.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
