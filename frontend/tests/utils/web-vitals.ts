import { Page } from "@playwright/test";

/**
 * Web Vitals metrics interface matching Core Web Vitals standards.
 */
export interface WebVitals {
  /** First Contentful Paint - Time when first content appears */
  fcp: number | null;
  /** Largest Contentful Paint - Time when largest content element appears */
  lcp: number | null;
  /** First Input Delay - Time from first user interaction to browser response */
  fid: number | null;
  /** Cumulative Layout Shift - Visual stability score */
  cls: number | null;
  /** Time to First Byte - Server response time */
  ttfb: number | null;
  /** Time to Interactive - Time when page becomes fully interactive */
  tti: number | null;
  /** Total Blocking Time - Time page is blocked from user input */
  tbt: number | null;
}

/**
 * Collect Core Web Vitals metrics from a page.
 * Uses Performance API and PerformanceObserver to gather metrics.
 *
 * @param page - Playwright page to collect metrics from
 * @returns Web Vitals metrics object
 *
 * @example
 * await page.goto('/');
 * const vitals = await collectWebVitals(page);
 * expect(vitals.fcp).toBeLessThan(1800); // FCP < 1.8s
 * expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
 */
export async function collectWebVitals(page: Page): Promise<WebVitals> {
  return await page.evaluate(() => {
    return new Promise<WebVitals>((resolve) => {
      const metrics: WebVitals = {
        fcp: null,
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null,
        tti: null,
        tbt: null,
      };

      // Get TTFB from Navigation Timing API
      const navTiming = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navTiming) {
        metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
      }

      // Get Paint Timing (FCP)
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // Observe LCP
      if ("PerformanceObserver" in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({
            type: "largest-contentful-paint",
            buffered: true,
          });
        } catch (_e) {
          // LCP observer not supported
        }

        // Observe FID
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              // FID is the delay between first input and processing
              const eventEntry = entry as PerformanceEventTiming;
              if (eventEntry.processingStart && eventEntry.startTime) {
                metrics.fid = eventEntry.processingStart - eventEntry.startTime;
              }
            });
          });
          fidObserver.observe({ type: "first-input", buffered: true });
        } catch (_e) {
          // FID observer not supported
        }

        // Observe CLS
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(
              (
                entry: PerformanceEntry & {
                  hadRecentInput?: boolean;
                  value?: number;
                }
              ) => {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value || 0;
                }
              }
            );
            metrics.cls = clsValue;
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch (_e) {
          // CLS observer not supported
        }
      }

      // Estimate TTI using heuristic (simplified)
      // TTI is when there are no long tasks after FCP
      const estimateTTI = () => {
        const longTasks = performance.getEntriesByType("longtask");
        if (longTasks.length === 0 && metrics.fcp) {
          // If no long tasks, TTI is roughly FCP + small buffer
          metrics.tti = metrics.fcp + 100;
        } else {
          // Otherwise, use the last long task end time
          const lastLongTask = longTasks[longTasks.length - 1];
          if (lastLongTask) {
            metrics.tti = lastLongTask.startTime + lastLongTask.duration;
          }
        }
      };

      // Estimate TBT (Total Blocking Time)
      const estimateTBT = () => {
        const longTasks = performance.getEntriesByType("longtask");
        let tbt = 0;
        longTasks.forEach((task) => {
          if (task.duration > 50) {
            tbt += task.duration - 50;
          }
        });
        metrics.tbt = tbt;
      };

      // Wait a bit for metrics to be collected
      setTimeout(() => {
        estimateTTI();
        estimateTBT();
        resolve(metrics);
      }, 2000); // 2s should be enough for most metrics
    });
  });
}

/**
 * Wait for page to be fully loaded and interactive.
 * Useful before collecting Web Vitals.
 *
 * @param page - Playwright page
 *
 * @example
 * await page.goto('/');
 * await waitForPageLoad(page);
 * const vitals = await collectWebVitals(page);
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Assert Web Vitals meet performance thresholds.
 * Uses Google's recommended thresholds for good user experience.
 *
 * @param vitals - Web Vitals metrics to check
 * @returns Object with pass/fail for each metric
 *
 * @example
 * const vitals = await collectWebVitals(page);
 * const results = assertWebVitalsThresholds(vitals);
 * expect(results.fcp.pass).toBe(true);
 */
export function assertWebVitalsThresholds(vitals: WebVitals): {
  fcp: { pass: boolean; value: number | null; threshold: number };
  lcp: { pass: boolean; value: number | null; threshold: number };
  fid: { pass: boolean; value: number | null; threshold: number };
  cls: { pass: boolean; value: number | null; threshold: number };
  ttfb: { pass: boolean; value: number | null; threshold: number };
  tti: { pass: boolean; value: number | null; threshold: number };
} {
  return {
    fcp: {
      pass: vitals.fcp !== null && vitals.fcp < 1800,
      value: vitals.fcp,
      threshold: 1800, // 1.8s
    },
    lcp: {
      pass: vitals.lcp !== null && vitals.lcp < 2500,
      value: vitals.lcp,
      threshold: 2500, // 2.5s
    },
    fid: {
      pass: vitals.fid !== null && vitals.fid < 100,
      value: vitals.fid,
      threshold: 100, // 100ms
    },
    cls: {
      pass: vitals.cls !== null && vitals.cls < 0.1,
      value: vitals.cls,
      threshold: 0.1, // 0.1
    },
    ttfb: {
      pass: vitals.ttfb !== null && vitals.ttfb < 800,
      value: vitals.ttfb,
      threshold: 800, // 800ms
    },
    tti: {
      pass: vitals.tti !== null && vitals.tti < 3800,
      value: vitals.tti,
      threshold: 3800, // 3.8s
    },
  };
}
