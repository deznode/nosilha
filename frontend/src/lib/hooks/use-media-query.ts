'use client';

import { useEffect, useState } from 'react';

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
 * Based on Framer Motion 2025 best practices research:
 * - Uses window.matchMedia for responsive breakpoint detection
 * - Returns boolean for query match state
 * - Adds change event listener for dynamic updates
 * - Server-safe with proper SSR handling
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false to prevent hydration mismatches
  // Server-side rendering will always return false
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for dynamic updates
    // Modern browsers support addEventListener on MediaQueryList
    mediaQueryList.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
