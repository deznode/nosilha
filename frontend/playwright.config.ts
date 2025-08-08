import { defineConfig, devices } from '@playwright/test';

// Load environment variables from .env.local for testing
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv is optional for testing
}


/**
 * Playwright configuration for Nos Ilha integration testing.
 * 
 * This config is optimized for:
 * - Tourism platform E2E testing (directory, map, towns)
 * - Mobile-first responsive testing (Brava Island visitors primarily use mobile)
 * - Cross-browser compatibility testing
 * - API contract validation
 * - Performance monitoring integration
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Global test timeout for tourism platform flows */
  timeout: 45000, // Extended for map loading and API calls
  expect: {
    /* Timeout for assertions - important for API responses */
    timeout: 10000,
  },

  /* Reporter config optimized for CI/CD integration */
  reporter: process.env.CI 
    ? [
        ['html', { outputDir: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [
        ['html', { outputDir: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list'],
      ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for the tourism platform */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test for debugging */
    trace: 'on-first-retry',
    /* Take screenshot on failure for tourism flow debugging */
    screenshot: 'only-on-failure',
    /* Capture video for complex map interactions */
    video: 'retain-on-failure',
    
    /* Configure for tourism platform specific needs */
    actionTimeout: 15000, // Extended for map interactions
    navigationTimeout: 30000, // Extended for island content loading
    
    /* Ignore HTTPS errors in development/staging */
    ignoreHTTPSErrors: true,
    
    /* Extra HTTP headers for API testing */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8', // Support Cape Verde multilingual content
    },
  },

  /* Configure projects for major browsers and devices */
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/desktop/**/*.spec.ts',
    },
    
    /* Mobile testing - critical for Brava Island tourists */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/mobile/**/*.spec.ts', '**/shared/**/*.spec.ts'],
    },
    {
      name: 'mobile-safari', 
      use: { ...devices['iPhone 13'] },
      testMatch: ['**/mobile/**/*.spec.ts', '**/shared/**/*.spec.ts'],
    },

    /* Cross-browser testing for global diaspora access */
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/cross-browser/**/*.spec.ts',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/cross-browser/**/*.spec.ts',
    },

    /* API contract testing */
    {
      name: 'api-contracts',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        /* API tests don't need a browser */
        browserName: 'chromium',
        headless: true,
      },
    },

    /* Performance testing setup for Core Web Vitals */
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        /* Enable additional metrics collection */
        contextOptions: {
          /* Simulate varying network conditions for island connectivity */
          offline: false,
        },
      },
      testMatch: '**/performance/**/*.spec.ts',
    },

  ],

  /* Local dev server configuration */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Next.js startup
  },

  /* Global setup for seeding test data */
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  /* Test output directories */
  outputDir: 'test-results/',
});