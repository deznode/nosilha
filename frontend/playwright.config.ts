import { defineConfig, devices } from "@playwright/test";

// Load environment variables from .env.local for testing
try {
  require("dotenv").config({ path: ".env.local" });
} catch (e) {
  // dotenv is optional for testing
}

/**
 * Playwright configuration for Nos Ilha - LOCAL DEVELOPMENT ONLY
 *
 * ⚠️ NOTE: E2E tests are NOT run in CI/CD to optimize costs and reduce flakiness.
 * Run these tests locally before major releases using:
 *   - npm run test:e2e           (headless, Chromium only)
 *   - npm run test:e2e:headed    (with browser UI)
 *   - npm run test:e2e:debug     (debug mode)
 *
 * This config is optimized for:
 * - Tourism platform E2E testing (directory, map, towns)
 * - Local pre-release validation
 * - Chromium browser only (simplified for solo maintainer)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e", // Updated for modular architecture - E2E tests in dedicated directory
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build if you accidentally left test.only in the source code. */
  forbidOnly: false, // Local development only
  /* No retries for local testing (faster feedback) */
  retries: 0,
  /* Use available workers for local testing */
  workers: undefined,

  /* Global test timeout for tourism platform flows */
  timeout: 45000, // Extended for map loading and API calls
  expect: {
    /* Timeout for assertions - important for API responses */
    timeout: 10000,
  },

  /* Reporter config for local development */
  reporter: [
    ["html", { outputDir: "playwright-report", open: "on-failure" }],
    ["list"],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for the tourism platform */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test for debugging */
    trace: "on-first-retry",
    /* Take screenshot on failure for tourism flow debugging */
    screenshot: "only-on-failure",
    /* Capture video for complex map interactions */
    video: "retain-on-failure",

    /* Configure for tourism platform specific needs */
    actionTimeout: 15000, // Extended for map interactions
    navigationTimeout: 30000, // Extended for island content loading

    /* Ignore HTTPS errors in development/staging */
    ignoreHTTPSErrors: true,

    /* Extra HTTP headers for API testing */
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9,pt;q=0.8", // Support Cape Verde multilingual content
    },
  },

  /* Configure projects - Chromium only for simplified testing */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /* Mobile testing removed - test manually on real devices before releases */
  ],

  /* Local dev server configuration */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true, // Local development only
    timeout: 120 * 1000, // 2 minutes for Next.js startup
  },

  /* Global setup for seeding test data */
  globalSetup: require.resolve("./tests/setup/global-setup.ts"),
  globalTeardown: require.resolve("./tests/setup/global-teardown.ts"),

  /* Test output directories */
  outputDir: "test-results/",
});
