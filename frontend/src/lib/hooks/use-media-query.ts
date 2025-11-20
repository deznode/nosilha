"use client";

import { useSyncExternalStore } from "react";

/**
 * Custom hook for responsive breakpoint detection using window.matchMedia
 *
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * ```
 *
 * Based on React 18+ best practices:
 * - Uses useSyncExternalStore for efficient subscription to browser APIs
 * - Returns boolean for query match state
 * - Adds change event listener for dynamic updates
 * - Server-safe with proper SSR handling
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    // Get snapshot (client)
    () => {
      if (typeof window === "undefined") {
        return false;
      }
      return window.matchMedia(query).matches;
    },
    // Get server snapshot (SSR)
    () => false
  );
}
