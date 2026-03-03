import { BrowserContext, Page } from "@playwright/test";

/**
 * Network simulation utilities for Playwright E2E tests.
 * Replaces Puppeteer APIs like emulateNetworkConditions and setOffline.
 */

export interface NetworkThrottleOptions {
  /** Download speed in bytes per second (e.g., 100 * 1024 for 100 KB/s) */
  downloadThroughput?: number;
  /** Upload speed in bytes per second (e.g., 50 * 1024 for 50 KB/s) */
  uploadThroughput?: number;
  /** Latency in milliseconds */
  latency?: number;
  /** Resource patterns to throttle (e.g., all resources or API only) */
  patterns?: string[];
}

/**
 * Throttle network speed by adding delays to requests.
 * Replacement for page.emulateNetworkConditions() from Puppeteer.
 *
 * @param context - Browser context to apply throttling to
 * @param options - Throttle configuration
 *
 * @example
 * // Simulate slow 3G connection
 * await throttleNetwork(context, {
 *   downloadThroughput: 50 * 1024,  // 50 KB/s
 *   uploadThroughput: 25 * 1024,    // 25 KB/s
 *   latency: 2000                    // 2s delay
 * });
 */
export async function throttleNetwork(
  context: BrowserContext,
  options: NetworkThrottleOptions
): Promise<void> {
  const { latency = 0, patterns = ["**/*"] } = options;

  for (const pattern of patterns) {
    await context.route(pattern, async (route) => {
      // Add latency delay before continuing request
      if (latency > 0) {
        await new Promise((resolve) => setTimeout(resolve, latency));
      }
      await route.continue();
    });
  }
}

/**
 * Simulate a slow 3G connection.
 * Adds 2-second delay to all requests.
 *
 * @param context - Browser context
 *
 * @example
 * await simulateSlowConnection(context);
 * await page.goto('/'); // Will be slow
 */
export async function simulateSlowConnection(
  context: BrowserContext
): Promise<void> {
  await throttleNetwork(context, {
    latency: 2000, // 2s delay
    patterns: ["**/*"],
  });
}

/**
 * Set offline mode for the browser context.
 * Replacement for page.setOffline() from Puppeteer.
 *
 * @param context - Browser context to set offline mode on
 * @param offline - True to go offline, false to go online
 *
 * @example
 * await setOfflineMode(context, true);  // Go offline
 * await page.goto('/'); // Will fail
 * await setOfflineMode(context, false); // Go back online
 */
export async function setOfflineMode(
  context: BrowserContext,
  offline: boolean
): Promise<void> {
  await context.setOffline(offline);
}

/**
 * Block specific resource types from loading.
 * Useful for testing offline behavior or reducing load times.
 *
 * @param page - Page to block resources on
 * @param patterns - Resource patterns to block (e.g., image and stylesheet patterns)
 *
 * @example
 * // Block images and stylesheets
 * await blockResources(page, ["**"+"/*.{png,jpg,jpeg,css}"]);
 */
export async function blockResources(
  page: Page,
  patterns: string[]
): Promise<void> {
  for (const pattern of patterns) {
    await page.route(pattern, (route) => route.abort());
  }
}

/**
 * Simulate intermittent network failures.
 * Randomly fails a percentage of requests.
 *
 * @param context - Browser context
 * @param failureRate - Probability of failure (0.0 to 1.0)
 *
 * @example
 * // Fail 20% of requests
 * await simulateIntermittentFailures(context, 0.2);
 */
export async function simulateIntermittentFailures(
  context: BrowserContext,
  failureRate: number
): Promise<void> {
  await context.route("**/*", async (route) => {
    if (Math.random() < failureRate) {
      await route.abort("failed");
    } else {
      await route.continue();
    }
  });
}

/**
 * Clear all network throttling and route handlers.
 * Resets context to normal network conditions.
 *
 * @param context - Browser context to reset
 *
 * @example
 * await clearNetworkThrottle(context);
 */
export async function clearNetworkThrottle(
  context: BrowserContext
): Promise<void> {
  await context.unroute("**/*");
}
