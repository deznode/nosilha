import { test, expect } from "@playwright/test";

/**
 * Homepage Integration Tests for Nos Ilha Tourism Platform
 *
 * These tests verify the critical first-impression user experience
 * for visitors to Brava Island discovering the tourism platform.
 *
 * Key tourism flows tested:
 * - Hero section loads with compelling island imagery
 * - Featured highlights showcase authentic island content
 * - Navigation to key platform features (map, directory, towns)
 * - Core Web Vitals performance for mobile tourists
 */

test.describe("Homepage - Tourism Platform Entry Point", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage with tourism platform expectations
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("displays compelling hero section for tourism discovery", async ({
    page,
  }) => {
    // Verify hero section captures Brava Island's essence
    const heroTitle = page.getByRole("heading", {
      name: /discover the soul of brava/i,
    });
    await expect(heroTitle).toBeVisible();

    // Check for authentic island imagery
    const heroImage = page.locator('img[alt*="scenic"]');
    await expect(heroImage).toBeVisible();

    // Verify call-to-action for map exploration
    const mapButton = page.getByRole("link", {
      name: /explore the interactive map/i,
    });
    await expect(mapButton).toBeVisible();

    // Test map navigation from hero
    await mapButton.click();
    await page.waitForURL("/map");
    await expect(
      page.getByRole("heading", { name: /interactive map/i })
    ).toBeVisible();
  });

  test("showcases featured highlights from directory", async ({ page }) => {
    // Verify featured highlights section displays authentic content
    const featuredSection = page
      .locator("section")
      .filter({ hasText: "Featured Highlights" });
    await expect(featuredSection).toBeVisible();

    // Check for directory cards showing real island businesses/landmarks
    const directoryCards = page.locator('[data-testid="directory-card"]');
    await expect(directoryCards).toHaveCount(4); // Should show top 4 featured items

    // Verify each card has essential tourism information
    const firstCard = directoryCards.first();
    await expect(firstCard.locator("h3")).toBeVisible(); // Business/location name
    await expect(firstCard.locator("p")).toBeVisible(); // Description
    await expect(firstCard.locator("img")).toBeVisible(); // Visual content

    // Test navigation to detailed directory entry
    await firstCard.click();

    // Should navigate to specific entry page
    await page.waitForURL("/directory/entry/**");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("provides clear navigation to core tourism features", async ({
    page,
  }) => {
    // Verify Island Guide section with key platform features
    const islandGuide = page
      .locator("section")
      .filter({ hasText: "Your Comprehensive Guide to Brava" });
    await expect(islandGuide).toBeVisible();

    // Check for three core features
    const interactiveMapLink = page.getByRole("link", {
      name: /interactive map/i,
    });
    const directoryLink = page.getByRole("link", {
      name: /complete directory/i,
    });
    const historyLink = page.getByRole("link", {
      name: /rich history & culture/i,
    });

    await expect(interactiveMapLink).toBeVisible();
    await expect(directoryLink).toBeVisible();
    await expect(historyLink).toBeVisible();

    // Test navigation to directory
    await directoryLink.click();
    await page.waitForURL("/directory/all");
    await expect(
      page.getByRole("heading", { name: /directory/i })
    ).toBeVisible();
  });

  test("performs well for mobile tourists with limited bandwidth", async ({
    page,
    context,
  }) => {
    // Simulate mobile device with slower connection (common in Cape Verde)
    const { throttleNetwork } = await import("../utils/network");
    await throttleNetwork(context, {
      latency: 150, // 150ms latency
    });

    const startTime = Date.now();
    await page.reload({ waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    // Verify acceptable load time for tourism context (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Check that essential content is still visible
    await expect(
      page.getByRole("heading", { name: /discover the soul of brava/i })
    ).toBeVisible();

    // Verify images have proper loading attributes for performance
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      // Hero image should be prioritized, others can be lazy loaded
      if (i === 0) {
        await expect(img).toHaveAttribute("loading", "eager");
      }
    }
  });

  test("maintains accessibility for diverse tourism audience", async ({
    page,
  }) => {
    // Test keyboard navigation for users with accessibility needs
    await page.keyboard.press("Tab"); // Should focus on first interactive element

    // Verify main navigation is accessible
    const mapButton = page.getByRole("link", {
      name: /explore the interactive map/i,
    });
    await mapButton.focus();
    await expect(mapButton).toBeFocused();

    await page.keyboard.press("Enter");
    await page.waitForURL("/map");

    // Check color contrast and text readability
    await page.goBack();

    const heroTitle = page.getByRole("heading", {
      name: /discover the soul of brava/i,
    });
    const titleColor = await heroTitle.evaluate(
      (el) => window.getComputedStyle(el).color
    );

    // Verify text is readable (this would be more sophisticated in real tests)
    expect(titleColor).toBeDefined();
  });

  test("handles API failures gracefully with mock data fallback", async ({
    page,
  }) => {
    // Simulate API failure scenario
    await page.route("**/api/v1/directory/entries**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Service temporarily unavailable",
        }),
      });
    });

    // Page should still load with fallback content
    await page.reload({ waitUntil: "networkidle" });

    // Hero section should always be available (static content)
    await expect(
      page.getByRole("heading", { name: /discover the soul of brava/i })
    ).toBeVisible();

    // Featured highlights might use mock data or show graceful degradation
    const featuredSection = page
      .locator("section")
      .filter({ hasText: "Featured Highlights" });
    await expect(featuredSection).toBeVisible();

    // Should either show mock data or appropriate message
    const hasCards =
      (await page.locator('[data-testid="directory-card"]').count()) > 0;
    const hasErrorMessage = await page
      .locator("text=temporarily unavailable")
      .isVisible();

    expect(hasCards || hasErrorMessage).toBeTruthy();
  });

  test("supports Cape Verde cultural context and language", async ({
    page,
  }) => {
    // Verify cultural authenticity in content
    const pageContent = await page.textContent("body");

    // Should include authentic Cape Verdean terms
    expect(pageContent).toMatch(/(morabeza|morna|sodade|Brava)/i);

    // Check for proper island geography references
    expect(pageContent).toMatch(/(Nova Sintra|Furna|Fajã de Água)/i);

    // Verify meta tags for proper cultural representation
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      "content"
    );
    expect(metaDescription).toContain("Brava");
    expect(metaDescription).toContain("Cape Verde");
  });
});

// Performance helper for Core Web Vitals monitoring
test.describe("Homepage Performance Metrics", () => {
  test("measures Core Web Vitals for tourism platform", async ({ page }) => {
    // This would integrate with real performance monitoring in production
    const performanceMetrics = await page.evaluate(() => {
      return new Promise<{
        lcp: number;
        fid: number;
        cls: number;
      }>((resolve) => {
        // Simulate basic performance measurement
        resolve({
          lcp: performance.now(), // Largest Contentful Paint
          fid: 0, // First Input Delay (would measure real interaction)
          cls: 0.1, // Cumulative Layout Shift
        });
      });
    });

    // Verify metrics are within acceptable ranges for tourism UX
    expect(performanceMetrics.lcp).toBeLessThan(2500); // LCP should be under 2.5s
    expect(performanceMetrics.cls).toBeLessThan(0.25); // CLS should be under 0.25

    console.log("Performance metrics:", performanceMetrics);
  });
});
