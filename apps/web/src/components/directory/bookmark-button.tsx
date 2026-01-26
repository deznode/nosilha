"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useToggleBookmark,
  useIsBookmarked,
} from "@/hooks/queries/use-bookmarks";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  entryId: string;
  className?: string;
}

/**
 * Bookmark button with integrated API functionality.
 *
 * Features:
 * - Automatic authentication check
 * - Optimistic UI updates
 * - Loading states during API calls
 * - Error handling with toast notifications
 * - Login prompt for unauthenticated users
 *
 * @param entryId - UUID of the directory entry to bookmark
 * @param className - Additional CSS classes
 */
export function BookmarkButton({
  entryId,
  className = "",
}: BookmarkButtonProps) {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const toggleBookmark = useToggleBookmark();
  const isBookmarked = useIsBookmarked(entryId);
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null);

  // Use optimistic state if available, otherwise fall back to actual state
  const displayIsBookmarked =
    optimisticState !== null ? optimisticState : (isBookmarked ?? false);
  const isLoading = toggleBookmark.isPending;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication first
    if (!session?.access_token) {
      toast.error("Please sign in to bookmark places").duration(5000).show();
      // Optionally redirect to login
      router.push("/login");
      return;
    }

    // Prevent duplicate clicks during loading
    if (isLoading) {
      return;
    }

    // Set optimistic state immediately for instant UI feedback
    const newState = !displayIsBookmarked;
    setOptimisticState(newState);

    try {
      await toggleBookmark.mutateAsync({
        entryId,
        isBookmarked: displayIsBookmarked,
      });

      // Show success message
      toast
        .success(
          newState ? "Place saved to your bookmarks" : "Bookmark removed"
        )
        .duration(3000)
        .show();

      // Clear optimistic state after successful mutation
      setOptimisticState(null);
    } catch (error) {
      // Revert optimistic state on error
      setOptimisticState(null);

      // Show error message
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update bookmark";
      toast.error(errorMessage).duration(5000).show();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`rounded-full p-2 backdrop-blur-md transition-all ${
        displayIsBookmarked
          ? "bg-[var(--color-ocean-blue)] text-white"
          : "bg-canvas/70 text-body hover:bg-canvas"
      } ${isLoading ? "cursor-wait opacity-70" : ""} ${className}`}
      aria-label={displayIsBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Bookmark
          size={18}
          fill={displayIsBookmarked ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
