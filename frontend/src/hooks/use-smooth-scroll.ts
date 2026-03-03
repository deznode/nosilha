"use client";

import { useCallback } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

/**
 * Custom hook for smooth scrolling with accessibility support
 * Respects user's motion preferences and provides smooth navigation
 */
export function useSmoothScroll() {
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | { top: number; left?: number },
      options: {
        offset?: number;
        duration?: number;
        behavior?: ScrollBehavior;
      } = {}
    ) => {
      const {
        offset = 0,
        behavior = prefersReducedMotion ? "auto" : "smooth",
      } = options;

      if (typeof target === "string") {
        const element = document.querySelector(target) as HTMLElement;
        if (element) {
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - offset,
            behavior,
          });
        }
      } else if (target instanceof HTMLElement) {
        const elementPosition =
          target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior,
        });
      } else {
        window.scrollTo({
          top: target.top,
          left: target.left || 0,
          behavior,
        });
      }
    },
    [prefersReducedMotion]
  );

  const scrollToTop = useCallback(() => {
    scrollTo({ top: 0 });
  }, [scrollTo]);

  const scrollToSection = useCallback(
    (sectionId: string, offset: number = 80) => {
      scrollTo(`#${sectionId}`, { offset });
    },
    [scrollTo]
  );

  const createScrollHandler = useCallback(
    (targetId: string, offset?: number) => {
      return (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        scrollToSection(targetId, offset);

        // Update URL hash without triggering scroll
        if (window.history.pushState) {
          window.history.pushState(null, "", `#${targetId}`);
        }
      };
    },
    [scrollToSection]
  );

  return {
    scrollTo,
    scrollToTop,
    scrollToSection,
    createScrollHandler,
    prefersReducedMotion,
  };
}
