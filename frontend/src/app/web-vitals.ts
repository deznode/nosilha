/**
 * Web Vitals Reporting to Google Analytics 4
 *
 * Sends Core Web Vitals metrics (CLS, FID, LCP, INP, etc.) to GA4
 * for performance monitoring and optimization insights.
 *
 * @see plan/research/analytics-stack-implement-guide.md
 * @see https://nextjs.org/docs/app/guides/analytics
 */

/**
 * Web Vitals metric data structure
 *
 * Matches the metric object provided by Next.js reportWebVitals hook
 */
export type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  label: "web-vital";
};

/**
 * Reports a Web Vitals metric to Google Analytics 4
 *
 * Sends performance metrics like:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - LCP (Largest Contentful Paint)
 * - INP (Interaction to Next Paint)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 *
 * @param metric - The web vital metric object from Next.js
 *
 * @example
 * // Automatically called by Next.js reportWebVitals export
 * reportWebVitalsToGA({
 *   id: 'v1-1234567890',
 *   name: 'LCP',
 *   value: 1250.5,
 *   label: 'web-vital'
 * })
 */
export function reportWebVitalsToGA(metric: WebVitalMetric) {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", metric.name, {
    event_category: "Web Vitals",
    event_label: metric.id,
    value: Math.round(metric.value),
    non_interaction: true,
  });
}
