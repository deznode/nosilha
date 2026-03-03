/**
 * Analytics Listener Component
 *
 * Tracks page views automatically on client-side route changes in Next.js App Router.
 * This component handles SPA navigation tracking for Google Analytics 4.
 *
 * @see plan/research/analytics-stack-implement-guide.md
 */

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPageview } from "@/lib/ga";

/**
 * Invisible component that listens to Next.js route changes
 * and automatically tracks page views in Google Analytics 4.
 *
 * This component should be included once in the root layout.
 *
 * @returns null (invisible component)
 */
export function AnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    trackPageview(url);
  }, [pathname, searchParams]);

  return null;
}
