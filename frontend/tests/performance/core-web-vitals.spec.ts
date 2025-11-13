import { test, expect } from "@playwright/test";
import { throttleNetwork } from "../utils/network";
import { collectWebVitals } from "../utils/web-vitals";

/**
 * Core Web Vitals Performance Tests for Nos Ilha Tourism Platform
 *
 * Measures and validates the three Core Web Vitals metrics that directly
 * impact tourism user experience, especially for mobile visitors to Brava Island.
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Visual loading performance
 * - FID (First Input Delay): Interactivity and responsiveness
 * - CLS (Cumulative Layout Shift): Visual stability
 *
 * Tourism-specific considerations:
 * - Mobile-first measurement (primary device for tourists)
 * - Network throttling for Cape Verde connectivity conditions
 * - Image-heavy content optimization (directory cards, hero images)
 */

test.describe("Core Web Vitals - Tourism Performance", () => {

  test("homepage meets Core Web Vitals thresholds for tourism UX", async ({
    page,
    context,
  }) => {
    // Simulate mobile tourist with moderate connectivity
    await throttleNetwork(context, {
      latency: 200, // 200ms latency (realistic for Cape Verde)
    });

    // Navigate to homepage
    await page.goto("/", { waitUntil: "networkidle" });

    // Collect Web Vitals metrics
    const metrics = await collectWebVitals(page);

    console.log("Homepage Core Web Vitals:", metrics);

    // Assert Core Web Vitals thresholds
    // LCP: Good < 2.5s, Needs Improvement < 4s
    expect(metrics.lcp).toBeLessThan(2500);

    // FID: Good < 100ms, Needs Improvement < 300ms
    expect(metrics.fid).toBeLessThan(100);

    // CLS: Good < 0.1, Needs Improvement < 0.25
    expect(metrics.cls).toBeLessThan(0.25);

    // Additional metrics for tourism performance
    expect(metrics.fcp).toBeLessThan(1800); // First Contentful Paint
    expect(metrics.ttfb).toBeLessThan(800); // Time to First Byte
  });

  test("directory browsing maintains performance under load", async ({
    page,
  }) => {
    // Navigate to directory with all entries
    await page.goto("/directory/all", { waitUntil: "networkidle" });

    // Collect initial metrics
    const initialMetrics = await collectWebVitals(page);

    console.log("Directory Initial Metrics:", initialMetrics);

    // Perform user interactions that might affect performance
    const directoryCards = page
      .locator('[data-testid="directory-card"]')
      .or(page.locator(".card, .entry-card"));

    if ((await directoryCards.count()) > 0) {
      // Scroll through directory (affects CLS)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Click on directory card (tests FID/INP)
      await directoryCards.first().click();
      await page.waitForLoadState("networkidle");

      // Navigate back and collect final metrics
      await page.goBack();
      await page.waitForLoadState("networkidle");
    }

    const finalMetrics = await collectWebVitals(page);

    console.log("Directory Final Metrics:", finalMetrics);

    // Performance should remain good after interactions
    expect(finalMetrics.lcp).toBeLessThan(3000); // Slightly higher threshold for content-heavy page
    expect(finalMetrics.cls).toBeLessThan(0.25); // Visual stability during scrolling
  });

  test("interactive map performance for mobile tourists", async ({
    page,
    context,
  }) => {
    // This is the most complex page - needs special attention
    await throttleNetwork(context, {
      latency: 300, // 300ms latency (island connectivity)
    });

    await page.goto("/map", { waitUntil: "networkidle" });

    // Wait for map to initialize
    await page.waitForSelector('[data-testid="interactive-map"]', {
      timeout: 15000,
    });
    await page.waitForTimeout(3000); // Allow map tiles to load

    const mapMetrics = await collectWebVitals(page);

    console.log("Map Performance Metrics:", mapMetrics);

    // Map has higher thresholds due to complexity
    expect(mapMetrics.lcp).toBeLessThan(3500); // 3.5s for complex interactive content
    expect(mapMetrics.fid).toBeLessThan(200); // 200ms for map interactions
    expect(mapMetrics.cls).toBeLessThan(0.3); // Slightly higher due to dynamic map loading

    // Test map interaction performance
    const mapContainer = page
      .locator(".mapboxgl-canvas")
      .or(page.locator("canvas").first());

    if (await mapContainer.isVisible()) {
      const interactionStart = Date.now();

      // Click on map (should be responsive)
      await mapContainer.click();

      const interactionTime = Date.now() - interactionStart;

      // Map interaction should be quick
      expect(interactionTime).toBeLessThan(500);
    }
  });

  test("towns page cultural content loads efficiently", async ({ page }) => {
    await page.goto("/towns", { waitUntil: "networkidle" });

    const townsMetrics = await collectWebVitals(page);

    console.log("Towns Page Metrics:", townsMetrics);

    // Towns page should be fast (mostly static content)
    expect(townsMetrics.lcp).toBeLessThan(2000); // 2s for cultural content
    expect(townsMetrics.fid).toBeLessThan(100); // Quick interactions
    expect(townsMetrics.cls).toBeLessThan(0.1); // Stable layout for reading

    // Test image loading performance (towns have hero images)
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that images don't cause layout shifts
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const scrollMetrics = await collectWebVitals(page);

      // CLS should remain low after scrolling past images
      expect(scrollMetrics.cls).toBeLessThan(0.15);
    }
  });

  test("performance across different connection speeds", async ({
    page,
    context,
  }) => {
    const connectionProfiles = [
      {
        name: "4G",
        latency: 50,
      },
      {
        name: "3G",
        latency: 150,
      },
      {
        name: "Slow 3G",
        latency: 300,
      },
    ];

    for (const profile of connectionProfiles) {
      console.log(`Testing performance on ${profile.name} connection...`);

      await throttleNetwork(context, {
        latency: profile.latency,
      });

      await page.goto("/", { waitUntil: "networkidle" });

      const metrics = await collectWebVitals(page);

      console.log(`${profile.name} Metrics:`, metrics);

      // Adjust thresholds based on connection speed
      const lcpThreshold =
        profile.name === "Slow 3G" ? 4000 : profile.name === "3G" ? 3000 : 2500;

      expect(metrics.lcp).toBeLessThan(lcpThreshold);
      expect(metrics.cls).toBeLessThan(0.25); // CLS should be consistent regardless of connection

      // FID might be higher on slower connections due to resource loading
      const fidThreshold = profile.name === "Slow 3G" ? 300 : 100;
      expect(metrics.fid).toBeLessThan(fidThreshold);
    }
  });

  test("image optimization impact on performance", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check image formats and sizes
    const images = await page.locator("img").all();

    for (const img of images) {
      const src = await img.getAttribute("src");
      const loading = await img.getAttribute("loading");

      if (src) {
        // Check if images use modern formats (WebP, AVIF)
        const isModernFormat = src.includes(".webp") || src.includes(".avif");
        const isNextJsOptimized =
          src.includes("/_next/image") || src.includes("/_next/static");

        if (!isModernFormat && !isNextJsOptimized) {
          console.warn(`Image not optimized: ${src}`);
        }

        // Check for lazy loading
        if (!loading || loading !== "lazy") {
          // Only hero images should be eager loaded
          const isHeroImage = await img.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight; // Above the fold
          });

          if (!isHeroImage) {
            console.warn(`Image should be lazy loaded: ${src}`);
          }
        }
      }
    }

    const metrics = await collectWebVitals(page);

    // Well-optimized images should lead to good LCP
    expect(metrics.lcp).toBeLessThan(2500);
  });

  test("font loading impact on Core Web Vitals", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for font loading optimization
    const fontLoadingStrategy = await page.evaluate(() => {
      const linkTags = Array.from(
        document.querySelectorAll('link[rel="preload"][as="font"]')
      );
      const fontDisplay = Array.from(document.styleSheets).some((sheet) => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          return Array.from(rules).some(
            (rule) => rule.cssText && rule.cssText.includes("font-display")
          );
        } catch (e) {
          return false;
        }
      });

      return {
        preloadedFonts: linkTags.length,
        hasFontDisplay: fontDisplay,
      };
    });

    console.log("Font Loading Strategy:", fontLoadingStrategy);

    const metrics = await collectWebVitals(page);

    // Good font loading should minimize CLS
    expect(metrics.cls).toBeLessThan(0.1);

    // Should not significantly impact FCP
    expect(metrics.fcp).toBeLessThan(2000);
  });

  test("third-party script impact on performance", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Analyze third-party scripts
    const thirdPartyScripts = await page.evaluate(() => {
      const scripts = Array.from(
        document.querySelectorAll("script[src]")
      ) as HTMLScriptElement[];
      return scripts
        .map((script) => ({
          src: script.src,
          async: script.async,
          defer: script.defer,
          isThirdParty: !script.src.includes(window.location.origin),
        }))
        .filter((script) => script.isThirdParty);
    });

    console.log("Third-party scripts:", thirdPartyScripts);

    const metrics = await collectWebVitals(page);

    // Third-party scripts should not significantly impact Core Web Vitals
    expect(metrics.fid).toBeLessThan(150); // Slightly higher threshold if third-party scripts present
    expect(metrics.cls).toBeLessThan(0.1); // Third-party ads/widgets often cause layout shifts
  });
});

// Mobile-specific Core Web Vitals tests
test.describe("Mobile Core Web Vitals - Tourism Focus", () => {
  test.use({ viewport: { width: 360, height: 640 } }); // Mobile viewport

  test("mobile homepage performance for traveling tourists", async ({
    page,
    context,
  }) => {
    // Simulate mobile network conditions
    await throttleNetwork(context, {
      latency: 250, // 250ms (mobile latency)
    });

    await page.goto("/", { waitUntil: "networkidle" });

    const mobileMetrics = await collectWebVitals(page);

    console.log("Mobile Metrics:", mobileMetrics);

    // Mobile thresholds (slightly more lenient)
    expect(mobileMetrics.lcp).toBeLessThan(3000); // 3s for mobile
    expect(mobileMetrics.fid).toBeLessThan(200); // 200ms for mobile touch
    expect(mobileMetrics.cls).toBeLessThan(0.25); // Stable mobile layout
  });

  test("mobile directory scrolling performance", async ({ page }) => {
    await page.goto("/directory/all", { waitUntil: "networkidle" });

    // Test mobile scrolling behavior
    const initialMetrics = await collectWebVitals(page);

    // Simulate mobile scrolling
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
      await page.waitForTimeout(200);
    }

    const scrollMetrics = await collectWebVitals(page);

    // Mobile scrolling should not cause significant layout shifts
    expect(scrollMetrics.cls).toBeLessThan(0.3);

    console.log("Mobile Scroll Performance:", {
      initial: initialMetrics,
      afterScroll: scrollMetrics,
    });
  });
});
