/**
 * Google Analytics 4 (GA4) Integration Utilities
 *
 * Provides type-safe functions for tracking page views and custom events
 * in GA4 for the Nos Ilha cultural heritage platform.
 *
 * @see plan/research/analytics-stack-implement-guide.md
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

/**
 * Tracks a page view in Google Analytics 4
 *
 * Called automatically by AnalyticsListener on route changes.
 * Can also be called manually for SPA navigation.
 *
 * @param url - The page URL to track (e.g., "/about" or "/about?tab=history")
 *
 * @example
 * trackPageview('/directory/restaurants')
 */
export function trackPageview(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Custom event parameters for GA4 tracking
 *
 * Supports standard GA4 event parameters plus custom fields
 * for community engagement tracking.
 */
export type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
};

/**
 * Tracks a custom event in Google Analytics 4
 *
 * Use this for tracking user interactions like button clicks,
 * form submissions, content views, and community contributions.
 *
 * @param params - Event parameters including action and optional metadata
 *
 * @example
 * // Track a button click
 * trackEvent({
 *   action: 'join_click',
 *   category: 'engagement',
 *   label: 'join_community_hero',
 * })
 *
 * @example
 * // Track content view with custom parameters
 * trackEvent({
 *   action: 'view_content',
 *   content_type: 'article',
 *   content_id: 'history-brava-1900s',
 *   language: 'kriolu',
 * })
 */
export function trackEvent({ action, ...params }: GtagEvent) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", action, params);
}
