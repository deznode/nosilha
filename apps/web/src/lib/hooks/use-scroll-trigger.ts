"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to detect when user scrolls past a threshold
 *
 * @param threshold - Scroll position threshold in pixels (default: 100)
 * @returns boolean indicating if user has scrolled past threshold
 *
 * @example
 * ```tsx
 * const hasScrolled = useScrollTrigger(500); // Trigger after 500px
 * const hasScrolledPastHero = useScrollTrigger(window.innerHeight - 81);
 * ```
 */
export function useScrollTrigger(threshold: number = 100): boolean {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // Don't run on server
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setTriggered(scrolled);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll event listener with passive option for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return triggered;
}
