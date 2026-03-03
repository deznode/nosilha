import { test, expect } from "@playwright/test";

/**
 * Towns Exploration Integration Tests for Nos Ilha Tourism Platform
 *
 * Tests the towns section that helps tourists discover and explore
 * the unique communities and settlements across Brava Island.
 *
 * Key cultural tourism aspects:
 * - Showcase authentic Cape Verdean communities
 * - Highlight cultural heritage and local traditions
 * - Connect to directory entries within each town
 * - Mobile-optimized for traveling tourists
 * - Preserve cultural authenticity in digital representation
 */

test.describe("Towns Exploration - Cultural Heritage Discovery", () => {
  test("displays overview of Brava Island communities", async ({ page }) => {
    await page.goto("/towns");

    // Verify towns page structure
    await expect(
      page.getByRole("heading", { name: /towns.*villages/i })
    ).toBeVisible();

    // Check for island communities introduction
    const introSection = page
      .locator("section")
      .filter({ hasText: /island communities/i });
    await expect(introSection).toBeVisible();

    // Verify cultural context is present
    const pageContent = await page.textContent("body");

    // Should include authentic Cape Verdean cultural references
    expect(pageContent).toMatch(/(morabeza|morna|sodade)/i);

    // Should reference actual town names
    expect(pageContent).toMatch(/(Nova Sintra|Furna|Fajã de Água)/i);

    // Check for overview imagery
    const overviewImage = page
      .locator("img")
      .filter({ hasText: /panoramic|overview|towns/i })
      .or(page.locator('img[alt*="towns"], img[alt*="settlements"]'));

    if (await overviewImage.isVisible()) {
      await expect(overviewImage).toHaveAttribute("alt");
    }
  });

  test("showcases featured towns with detailed information", async ({
    page,
  }) => {
    await page.goto("/towns");

    // Look for featured towns section
    const featuredSection = page
      .locator("section")
      .filter({ hasText: /main communities/i });
    await expect(featuredSection).toBeVisible();

    // Should display Nova Sintra and Furna prominently
    const novaSintraCard = page
      .getByText(/Nova Sintra/i)
      .locator("..")
      .locator("..");
    const furnaCard = page.getByText(/Furna/i).locator("..").locator("..");

    await expect(novaSintraCard).toBeVisible();
    await expect(furnaCard).toBeVisible();

    // Check Nova Sintra details (capital town)
    if (await novaSintraCard.isVisible()) {
      const sintraContent = await novaSintraCard.textContent();

      // Should mention UNESCO heritage status
      expect(sintraContent?.toLowerCase()).toContain("unesco");

      // Should have population information
      expect(sintraContent).toMatch(/\d+.*residents/i);

      // Should have elevation data
      expect(sintraContent).toMatch(/\d+.*meters/i);

      // Should have cultural highlights
      expect(sintraContent?.toLowerCase()).toContain("colonial");
    }

    // Check Furna details (historic fishing village)
    if (await furnaCard.isVisible()) {
      const furnaContent = await furnaCard.textContent();

      // Should mention fishing/maritime heritage
      expect(furnaContent?.toLowerCase()).toMatch(/(fishing|harbor|maritime)/);

      // Should reference volcanic crater
      expect(furnaContent?.toLowerCase()).toContain("crater");
    }
  });

  test("enables navigation to individual town pages", async ({ page }) => {
    await page.goto("/towns");

    // Find and click on a town link
    const townLink = page
      .getByRole("link", { name: /explore.*nova sintra/i })
      .or(page.getByRole("link", { name: /nova sintra/i }));

    if (await townLink.isVisible()) {
      await townLink.click();

      // Should navigate to specific town page
      await page.waitForURL("**/towns/nova-sintra**");

      // Verify individual town page content
      await expect(
        page.getByRole("heading", { name: /nova sintra/i })
      ).toBeVisible();

      // Should have detailed town information
      const townContent = await page.textContent("body");
      expect(townContent?.toLowerCase()).toContain("capital");
      expect(townContent?.toLowerCase()).toContain("unesco");
    } else {
      // If direct town pages don't exist, test alternative navigation
      const townCards = page.locator('[data-testid="town-card"]').or(
        page
          .locator("div")
          .filter({ hasText: /nova sintra|furna/i })
          .first()
      );

      if (await townCards.isVisible()) {
        await townCards.click();

        // Should either navigate or expand content
        const hasNavigated = !page.url().includes("/towns");
        const hasExpandedContent = await page
          .locator('[data-testid="town-details"]')
          .isVisible();

        expect(hasNavigated || hasExpandedContent).toBeTruthy();
      }
    }
  });

  test("displays hidden gems and smaller communities", async ({ page }) => {
    await page.goto("/towns");

    // Look for hidden gems section
    const hiddenGemsSection = page
      .locator("section")
      .filter({ hasText: /hidden gems/i });
    await expect(hiddenGemsSection).toBeVisible();

    // Should show smaller communities
    const smallerTowns = [
      "Mato",
      "Cachaço",
      "Nossa Senhora do Monte",
      "Lima Doce",
    ];
    const pageContent = await page.textContent("body");

    // At least one smaller community should be mentioned
    const hasSmallCommunity = smallerTowns.some((town) =>
      pageContent?.toLowerCase().includes(town.toLowerCase())
    );

    expect(hasSmallCommunity).toBeTruthy();

    // Verify smaller communities have basic information
    const hiddenGemCards = hiddenGemsSection
      .locator("div")
      .filter({ hasText: /residents|population|elevation/i });

    if ((await hiddenGemCards.count()) > 0) {
      const firstGem = hiddenGemCards.first();
      const gemContent = await firstGem.textContent();

      // Should have population or elevation info
      expect(gemContent).toMatch(/(residents|population|elevation|meters)/i);
    }
  });

  test("integrates with interactive map for spatial context", async ({
    page,
  }) => {
    await page.goto("/towns");

    // Look for map integration
    const mapCTA = page
      .locator("section")
      .filter({ hasText: /interactive map/i });
    await expect(mapCTA).toBeVisible();

    // Should have link to map
    const mapLink = page.getByRole("link", { name: /view map/i });
    await expect(mapLink).toBeVisible();

    await mapLink.click();
    await page.waitForURL("/map");

    // Verify map loads with town context
    await expect(
      page.getByRole("heading", { name: /interactive map/i })
    ).toBeVisible();

    // Map should be visible
    const mapContainer = page
      .locator('[data-testid="interactive-map"]')
      .or(page.locator(".mapboxgl-canvas"));

    // Allow time for map to load
    await page.waitForTimeout(3000);
    await expect(mapContainer).toBeVisible();
  });

  test("encourages community contribution and engagement", async ({ page }) => {
    await page.goto("/towns");

    // Look for contribution section
    const contributeSection = page
      .locator("section")
      .filter({ hasText: /share your town stories/i });
    await expect(contributeSection).toBeVisible();

    // Should encourage photo and story contributions
    const contributeContent = await contributeSection.textContent();
    expect(contributeContent?.toLowerCase()).toMatch(
      /(photos|experiences|stories|contribute)/
    );

    // Should have link to contribute page
    const contributeLink = page.getByRole("link", {
      name: /contribute content/i,
    });
    await expect(contributeLink).toBeVisible();

    await contributeLink.click();
    await page.waitForURL("/contribute");

    // Verify contribute page loads
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("connects to directory entries within towns", async ({ page }) => {
    await page.goto("/towns");

    // Should have link to browse directory
    const directoryLink = page.getByRole("link", { name: /browse directory/i });

    if (await directoryLink.isVisible()) {
      await directoryLink.click();
      await page.waitForURL("/directory/**");

      // Should show directory filtered by location context
      await expect(
        page.getByRole("heading", { name: /directory/i })
      ).toBeVisible();
    }

    // Test town-specific business discovery
    await page.goto("/towns");

    // Look for town cards with business counts or links
    const townCards = page
      .locator('[data-testid="town-card"]')
      .or(page.locator("div").filter({ hasText: /nova sintra|furna/i }));

    if ((await townCards.count()) > 0) {
      const firstTownCard = townCards.first();

      // Check if town card mentions local businesses
      const townContent = await firstTownCard.textContent();
      const hasBusinessMention =
        /restaurant|hotel|business|establishment/i.test(townContent || "");

      if (hasBusinessMention) {
        // Should be able to explore businesses in that town
        expect(townContent?.length).toBeGreaterThan(50); // Has substantial content
      }
    }
  });

  test("preserves cultural authenticity in presentation", async ({ page }) => {
    await page.goto("/towns");

    const pageContent = await page.textContent("body");

    // Should use authentic Cape Verdean terminology
    expect(pageContent).toMatch(/(morabeza|morna|sodade)/i);

    // Should reference cultural elements appropriately
    expect(pageContent?.toLowerCase()).toMatch(
      /(heritage|tradition|cultural|maritime|colonial)/
    );

    // Should mention geographic/geological context
    expect(pageContent?.toLowerCase()).toMatch(
      /(volcanic|crater|mountain|coastline|atlantic)/
    );

    // Check for respectful language about communities
    const hasRespectfulTone = !/(primitive|backward|underdeveloped|poor)/i.test(
      pageContent || ""
    );
    expect(hasRespectfulTone).toBeTruthy();

    // Should emphasize positive community aspects
    expect(pageContent?.toLowerCase()).toMatch(
      /(resilience|creativity|hospitality|welcome|authentic)/
    );
  });

  test("provides practical tourism information", async ({ page }) => {
    await page.goto("/towns");

    // Should provide elevation data (useful for hikers/tourists)
    const pageContent = await page.textContent("body");
    expect(pageContent).toMatch(/\d+.*meters.*above.*sea.*level/i);

    // Should provide population context
    expect(pageContent).toMatch(/\d+.*residents/i);

    // Should highlight unique features tourists would want to visit
    const highlights = ["UNESCO", "harbor", "pools", "architecture", "views"];
    const hasHighlights = highlights.some((highlight) =>
      pageContent?.toLowerCase().includes(highlight.toLowerCase())
    );

    expect(hasHighlights).toBeTruthy();

    // Check for tourism-relevant highlights in cards
    const highlightTags = page
      .locator("span")
      .filter({ hasText: /UNESCO|Harbor|Pools|Architecture|Views|Heritage/i });

    if ((await highlightTags.count()) > 0) {
      const firstHighlight = highlightTags.first();
      await expect(firstHighlight).toBeVisible();

      const highlightText = await firstHighlight.textContent();
      expect(highlightText?.length).toBeGreaterThan(3);
    }
  });

  test("optimized for mobile cultural exploration", async ({
    page,
    browserName,
  }) => {
    // Test mobile viewport
    const isMobile =
      page.viewportSize()?.width && page.viewportSize()!.width <= 768;
    if (!isMobile) return;

    await page.goto("/towns");

    // Mobile layout should be touch-friendly
    const townCards = page
      .locator('[data-testid="town-card"]')
      .or(page.locator("div").filter({ hasText: /nova sintra|furna/i }));

    if ((await townCards.count()) > 0) {
      const firstCard = townCards.first();
      const cardBox = await firstCard.boundingBox();

      // Cards should be large enough for touch interaction
      expect(cardBox?.height).toBeGreaterThan(60);

      // Test touch interaction
      await firstCard.tap();

      // Should either navigate or show more information
      const hasInteraction =
        (await page.locator('[data-testid="town-details"]').isVisible()) ||
        !page.url().includes("/towns");

      expect(hasInteraction).toBeTruthy();
    }

    // Images should be responsive
    const images = page.locator("img");
    if ((await images.count()) > 0) {
      const firstImage = images.first();
      const imageBox = await firstImage.boundingBox();

      // Should not overflow mobile screen
      const viewportWidth = page.viewportSize()?.width || 375;
      expect(imageBox?.width || 0).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test("handles connectivity issues with graceful degradation", async ({
    page,
  }) => {
    await page.goto("/towns");

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Verify base content is loaded
    await expect(
      page.getByRole("heading", { name: /towns.*villages/i })
    ).toBeVisible();

    // Simulate going offline
    await page.setOffline(true);

    // Try to navigate to map integration
    const mapLink = page.getByRole("link", { name: /view map/i });

    if (await mapLink.isVisible()) {
      await mapLink.click();

      // Should either:
      // 1. Show offline message
      // 2. Load cached content
      // 3. Handle gracefully

      const hasOfflineHandling =
        (await page
          .locator("text=/offline|unavailable|connection/i")
          .isVisible()) ||
        (await page.locator('[data-testid="interactive-map"]').isVisible());

      expect(hasOfflineHandling).toBeTruthy();
    }

    // Restore connectivity
    await page.setOffline(false);
  });

  test("supports SEO and metadata for cultural discoverability", async ({
    page,
  }) => {
    await page.goto("/towns");

    // Check page title
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/(towns|villages|brava|nos ilha)/);

    // Check meta description
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      "content"
    );
    if (metaDescription) {
      expect(metaDescription.toLowerCase()).toMatch(
        /(brava|cape verde|communities|heritage)/
      );
    }

    // Check Open Graph tags for social sharing
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      "content"
    );
    if (ogTitle) {
      expect(ogTitle.toLowerCase()).toMatch(/(towns|villages|brava)/);
    }

    // Should have structured data for search engines
    const hasStructuredData = await page
      .locator('script[type="application/ld+json"]')
      .isVisible();

    if (hasStructuredData) {
      console.log(
        "Structured data present for enhanced search discoverability"
      );
    }
  });
});

// Individual Town Page Tests (if they exist)
test.describe("Individual Town Pages", () => {
  test("displays detailed Nova Sintra information", async ({ page }) => {
    // Try to navigate to individual town page
    await page.goto("/towns/nova-sintra");

    // If individual town pages exist
    if (!page.url().includes("404") && !page.url().includes("not-found")) {
      await expect(
        page.getByRole("heading", { name: /nova sintra/i })
      ).toBeVisible();

      const pageContent = await page.textContent("body");

      // Should have detailed historical information
      expect(pageContent?.toLowerCase()).toMatch(
        /(capital|unesco|colonial|architecture)/
      );

      // Should have practical visitor information
      expect(pageContent).toMatch(/\d+.*meters.*elevation/i);

      // Should connect to directory entries in Nova Sintra
      const directoryLinks = page.getByRole("link", {
        name: /restaurant|hotel|business/i,
      });

      if ((await directoryLinks.count()) > 0) {
        const firstLink = directoryLinks.first();
        await firstLink.click();

        // Should navigate to filtered directory
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();

        expect(currentUrl).toMatch(/(directory|nova-sintra)/);
      }
    } else {
      console.log(
        "Individual town pages not implemented - testing main towns page integration"
      );
    }
  });
});
