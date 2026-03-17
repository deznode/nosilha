"use client";

import { useScrollDirection } from "@/lib/hooks/use-scroll-direction";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

/**
 * Returns true when the top nav bar is hidden on mobile (scrolling down).
 * Mirrors the hide condition in NavVisibilityWrapper.
 *
 * Used by sticky toolbars to adjust their `top` offset when the nav
 * slides out of view, and by CollapsibleHero for its sticky bar.
 */
export function useNavHidden(): boolean {
  const direction = useScrollDirection(10);
  const isMobile = useMediaQuery("(max-width: 767px)");
  return isMobile && direction === "down";
}
