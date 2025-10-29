import { useEffect, useRef } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * Custom hook that fixes window.print() viewport issue
 *
 * Problem: window.print() may only capture visible viewport on long pages
 * Solution: Scroll to top before print, restore position after print
 *
 * @example
 * function HistoryPage() {
 *   usePrintScrollFix(); // Attach event listeners
 *   return <article>{content}</article>;
 * }
 */
export function usePrintScrollFix(): void {
  const scrollPosition = useRef<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleBeforePrint = () => {
      // Save current scroll position
      scrollPosition.current = {
        x: window.scrollX,
        y: window.scrollY,
      };

      // Scroll to top to ensure full page is captured
      window.scrollTo(0, 0);
    };

    const handleAfterPrint = () => {
      // Restore user's scroll position after print dialog closes
      window.scrollTo(scrollPosition.current.x, scrollPosition.current.y);
    };

    // Attach event listeners
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
}
