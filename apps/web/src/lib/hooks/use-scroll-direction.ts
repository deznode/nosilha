"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | null;

/**
 * Detects scroll direction with configurable threshold and rAF throttle.
 *
 * @param threshold - Minimum scroll delta in pixels before direction changes (default: 10)
 * @returns Current scroll direction: "up", "down", or null (initial/SSR)
 *
 * @example
 * ```tsx
 * const direction = useScrollDirection(10);
 * // direction === "down" when scrolling down past threshold
 * ```
 */
export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateDirection = () => {
      const scrollY = window.scrollY;

      // Always reset when at top of page (e.g., after navigation)
      if (scrollY <= 0) {
        setDirection(null);
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      const delta = scrollY - lastScrollY.current;

      if (Math.abs(delta) >= threshold) {
        setDirection(delta > 0 ? "down" : "up");
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(updateDirection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return direction;
}
