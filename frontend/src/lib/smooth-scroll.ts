/**
 * Smooth scroll utilities for cultural heritage navigation
 * Provides enhanced user experience for internal page navigation
 */

/**
 * Smoothly scroll to a target element or position
 * @param target - Element selector, element, or position object
 * @param options - Scroll behavior options
 */
export function smoothScrollTo(
  target: string | HTMLElement | { top: number; left?: number },
  options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number;
  } = {}
) {
  const {
    behavior = "smooth",
    block = "start",
    inline = "nearest",
    offset = 0,
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
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop() {
  smoothScrollTo({ top: 0 });
}

/**
 * Scroll to a specific section with header offset
 * @param sectionId - ID of the section to scroll to
 */
export function scrollToSection(sectionId: string) {
  const headerHeight = 80; // Approximate header height for offset
  smoothScrollTo(`#${sectionId}`, { offset: headerHeight });
}

/**
 * Create a smooth scroll click handler for navigation links
 * @param targetId - ID of the target element
 * @returns Click handler function
 */
export function createSmoothScrollHandler(targetId: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(targetId);

    // Update URL hash without triggering scroll
    if (window.history.pushState) {
      window.history.pushState(null, "", `#${targetId}`);
    }
  };
}

/**
 * Hook to detect if reduced motion is preferred
 */
export function useReducedMotion() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
