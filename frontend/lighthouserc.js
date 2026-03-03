/**
 * Lighthouse CI configuration for Nos Ilha Tourism Platform
 *
 * ⚠️ NOTE: This configuration is for LOCAL USE ONLY (not run in CI/CD)
 * Run manually before major releases: `npx @lhci/cli@latest autorun`
 *
 * Optimized for:
 * - Tourism platform performance (mobile-first for visiting tourists)
 * - Cape Verde connectivity conditions (slower networks)
 * - Core Web Vitals monitoring for user experience
 * - Cultural content loading optimization
 * - Cross-browser performance validation
 */

module.exports = {
  ci: {
    // Collect settings for performance auditing
    collect: {
      // URLs to audit - critical tourism user journeys
      url: [
        "http://localhost:3000", // Homepage (first impression)
        "http://localhost:3000/directory/all", // Directory browsing
        "http://localhost:3000/directory/Restaurant", // Category filtering
        "http://localhost:3000/map", // Interactive map
        "http://localhost:3000/towns", // Cultural exploration
      ],

      // Simulate realistic tourism conditions
      settings: {
        // Mobile-first approach for traveling tourists
        preset: "desktop", // Will also run mobile in separate collection

        // Simulate Cape Verde network conditions (slower connectivity)
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 150,
          throughputKbps: 1600, // Slightly better than 3G for realistic island conditions
          cpuSlowdownMultiplier: 2,
        },

        // Disable features that might not be available in remote locations
        disableStorageReset: false,
        disableDeviceEmulation: false,

        // Chrome flags for consistent testing
        chromeFlags: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-default-apps",
          "--disable-extensions",
        ],
      },

      // Number of runs for statistical significance
      numberOfRuns: 3,

      // Browser configuration
      startServerCommand: process.env.CI ? undefined : "npm run dev",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 120000,
    },

    // Mobile device testing (critical for tourism)
    "mobile-collect": {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/directory/all",
        "http://localhost:3000/map",
        "http://localhost:3000/towns",
      ],
      settings: {
        preset: "mobile",

        // Simulate even more constrained mobile conditions
        throttling: {
          rttMs: 300,
          throughputKbps: 1200, // 3G conditions common in Cape Verde
          cpuSlowdownMultiplier: 4,
        },

        // Mobile-specific configuration
        disableDeviceEmulation: false,
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 2,
          disabled: false,
        },

        // Mobile Chrome flags
        chromeFlags: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--no-first-run",
        ],
      },
      numberOfRuns: 3,
    },

    // Upload and storage configuration
    upload: {
      target: "temporary-public-storage",

      // GitHub integration for PR comments
      ...(process.env.CI && {
        githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
        githubStatusContextTemplate: "lighthouse-ci/tourism-performance",
      }),
    },

    // Assert performance budgets for tourism platform
    assert: {
      // Core Web Vitals thresholds optimized for tourism UX
      assertions: {
        // Performance metrics
        "categories:performance": ["error", { minScore: 0.75 }], // 75+ for good tourism UX
        "categories:accessibility": ["error", { minScore: 0.9 }], // High accessibility for diverse users
        "categories:best-practices": ["error", { minScore: 0.85 }],
        "categories:seo": ["error", { minScore: 0.9 }], // Critical for tourism discoverability

        // Core Web Vitals - critical for mobile tourists
        "metrics:largest-contentful-paint": [
          "error",
          { maxNumericValue: 2500 },
        ], // 2.5s
        "metrics:first-input-delay": ["error", { maxNumericValue: 100 }], // 100ms
        "metrics:cumulative-layout-shift": ["error", { maxNumericValue: 0.25 }], // 0.25

        // Additional performance metrics for tourism
        "metrics:first-contentful-paint": ["warn", { maxNumericValue: 1800 }], // 1.8s
        "metrics:speed-index": ["warn", { maxNumericValue: 3000 }], // 3s
        "metrics:total-blocking-time": ["warn", { maxNumericValue: 300 }], // 300ms

        // Resource optimization
        "resource-summary:script:size": ["warn", { maxNumericValue: 250000 }], // 250KB JS
        "resource-summary:image:size": ["warn", { maxNumericValue: 500000 }], // 500KB images
        "resource-summary:total:size": ["error", { maxNumericValue: 2000000 }], // 2MB total

        // Tourism-specific optimizations
        "unused-javascript": ["warn", { maxNumericValue: 50000 }], // 50KB unused JS
        "unused-css-rules": ["warn", { maxNumericValue: 10000 }], // 10KB unused CSS
        "modern-image-formats": "error", // Use WebP for faster loading
        "efficient-animated-content": "warn", // Optimize animations for mobile
        "offscreen-images": "error", // Lazy load for better performance

        // Accessibility for diverse tourism audience
        "color-contrast": "error",
        "image-alt": "error",
        "link-name": "error",
        "button-name": "error",

        // SEO for tourism discoverability
        "meta-description": "error",
        "document-title": "error",
        hreflang: "warn", // Important for international tourism
        canonical: "warn",
      },
    },

    // Server configuration for CI environments
    server: {
      port: 9001,
      storage: ".lighthouseci",
    },
  },

  // Custom performance budgets for tourism pages
  budgets: [
    {
      // Homepage budget (first impression)
      path: "/",
      resourceSizes: [
        { resourceType: "script", budget: 200 }, // 200KB JS
        { resourceType: "image", budget: 400 }, // 400KB images
        { resourceType: "stylesheet", budget: 50 }, // 50KB CSS
        { resourceType: "font", budget: 100 }, // 100KB fonts
        { resourceType: "total", budget: 1500 }, // 1.5MB total
      ],
      resourceCounts: [
        { resourceType: "script", budget: 10 },
        { resourceType: "image", budget: 20 },
        { resourceType: "third-party", budget: 5 },
      ],
      timings: [
        { metric: "first-contentful-paint", budget: 2000 },
        { metric: "largest-contentful-paint", budget: 2500 },
        { metric: "speed-index", budget: 3000 },
        { metric: "cumulative-layout-shift", budget: 0.25 },
      ],
    },
    {
      // Directory pages budget (core functionality)
      path: "/directory/*",
      resourceSizes: [
        { resourceType: "script", budget: 250 },
        { resourceType: "image", budget: 600 }, // More images for directory cards
        { resourceType: "total", budget: 1800 },
      ],
      timings: [
        { metric: "first-contentful-paint", budget: 2200 },
        { metric: "largest-contentful-paint", budget: 2800 },
        { metric: "interactive", budget: 4000 },
      ],
    },
    {
      // Map page budget (complex interactive content)
      path: "/map",
      resourceSizes: [
        { resourceType: "script", budget: 400 }, // Mapbox requires more JS
        { resourceType: "image", budget: 300 }, // Map tiles
        { resourceType: "total", budget: 2000 },
      ],
      timings: [
        { metric: "first-contentful-paint", budget: 2500 },
        { metric: "largest-contentful-paint", budget: 3000 },
        { metric: "interactive", budget: 5000 }, // Map initialization takes time
      ],
    },
  ],
};
