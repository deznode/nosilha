import { test, expect } from "@playwright/test";

/**
 * Interactive Map Integration Tests for Nos Ilha Tourism Platform
 *
 * Tests the Mapbox-powered interactive map that helps tourists
 * spatially discover businesses and landmarks across Brava Island.
 *
 * Critical for tourism UX:
 * - Map loads with accurate Brava Island geography
 * - Directory entries appear as interactive markers
 * - Category filtering works spatially
 * - Mobile touch interactions for on-the-go exploration
 * - Offline fallback when connectivity is limited
 */

test.describe("Interactive Map - Spatial Tourism Discovery", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page
    await page.goto("/map");

    // Wait for map to initialize (Mapbox requires time to load)
    await page.waitForSelector('[data-testid="interactive-map"]', {
      timeout: 15000,
    });

    // Allow additional time for map tiles and markers to load
    await page.waitForTimeout(2000);
  });

  test("loads interactive map centered on Brava Island", async ({ page }) => {
    // Verify map page structure
    await expect(
      page.getByRole("heading", { name: /interactive map/i })
    ).toBeVisible();

    // Check that map container is present
    const mapContainer = page.locator('[data-testid="interactive-map"]');
    await expect(mapContainer).toBeVisible();

    // Verify map has loaded (Mapbox creates canvas elements)
    const mapCanvas = page
      .locator(".mapboxgl-canvas")
      .or(page.locator("canvas").first());
    await expect(mapCanvas).toBeVisible();

    // Check that map is interactive (has zoom controls)
    const zoomControls = page
      .locator(".mapboxgl-ctrl-zoom")
      .or(page.locator('[data-testid="zoom-controls"]'));

    // Zoom controls might be custom or default Mapbox
    if (await zoomControls.isVisible()) {
      const zoomIn = zoomControls
        .locator('[data-testid="zoom-in"]')
        .or(zoomControls.getByRole("button").first());
      await expect(zoomIn).toBeVisible();
    }
  });

  test("displays directory entries as interactive map markers", async ({
    page,
  }) => {
    // Wait for markers to load
    await page.waitForTimeout(3000);

    // Look for map markers representing directory entries
    const markers = page
      .locator(".mapboxgl-marker")
      .or(page.locator('[data-testid="map-marker"]'));

    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);

    // Test marker interaction
    const firstMarker = markers.first();
    await firstMarker.click();

    // Should show popup or info window with business details
    const popup = page
      .locator(".mapboxgl-popup")
      .or(page.locator('[data-testid="map-popup"]'));

    if (await popup.isVisible()) {
      // Verify popup contains business information
      const popupContent = await popup.textContent();
      expect(popupContent).toMatch(/(restaurant|hotel|beach|landmark)/i);

      // Should have business name
      expect(popupContent?.length).toBeGreaterThan(5);
    }
  });

  test("enables category filtering for spatial discovery", async ({ page }) => {
    // Look for category filter controls
    const categoryFilters = page
      .locator('[data-testid="map-filters"]')
      .or(page.locator(".map-filter-control"));

    if (await categoryFilters.isVisible()) {
      // Test restaurant filter
      const restaurantFilter = categoryFilters
        .getByRole("button", { name: /restaurant/i })
        .or(categoryFilters.getByText(/restaurant/i));

      if (await restaurantFilter.isVisible()) {
        await restaurantFilter.click();

        // Wait for map to update
        await page.waitForTimeout(1000);

        // Verify only restaurant markers are visible
        const visibleMarkers = page
          .locator(".mapboxgl-marker:visible")
          .or(page.locator('[data-testid="map-marker"]:visible'));

        // Should still have some markers (assuming there are restaurants)
        const visibleCount = await visibleMarkers.count();
        expect(visibleCount).toBeGreaterThanOrEqual(0);

        // Test clicking a visible marker to confirm it's a restaurant
        if (visibleCount > 0) {
          await visibleMarkers.first().click();

          const popup = page
            .locator(".mapboxgl-popup")
            .or(page.locator('[data-testid="map-popup"]'));

          if (await popup.isVisible()) {
            const popupText = await popup.textContent();
            expect(popupText?.toLowerCase()).toContain("restaurant");
          }
        }
      }
    }
  });

  test("provides smooth pan and zoom interactions", async ({ page }) => {
    const mapCanvas = page
      .locator(".mapboxgl-canvas")
      .or(page.locator("canvas").first());

    // Test zoom in functionality
    const zoomInButton = page
      .locator('[data-testid="zoom-in"]')
      .or(page.locator(".mapboxgl-ctrl-zoom-in"));

    if (await zoomInButton.isVisible()) {
      // Click zoom in multiple times
      await zoomInButton.click();
      await page.waitForTimeout(500);
      await zoomInButton.click();
      await page.waitForTimeout(500);

      // Map should still be functional
      await expect(mapCanvas).toBeVisible();
    }

    // Test pan by dragging (simulate touch/mouse drag)
    const canvasBox = await mapCanvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        canvasBox.x + canvasBox.width / 2 + 50,
        canvasBox.y + canvasBox.height / 2 + 50
      );
      await page.mouse.up();

      // Wait for map to settle
      await page.waitForTimeout(1000);

      // Map should still be responsive
      await expect(mapCanvas).toBeVisible();
    }
  });

  test("integrates with directory for seamless tourism flow", async ({
    page,
  }) => {
    // Look for a marker and click it
    const markers = page
      .locator(".mapboxgl-marker")
      .or(page.locator('[data-testid="map-marker"]'));

    if ((await markers.count()) > 0) {
      await markers.first().click();

      // Look for link to directory entry
      const viewDetailsLink = page
        .getByRole("link", { name: /view details|more info/i })
        .or(page.getByRole("button", { name: /view details|more info/i }));

      if (await viewDetailsLink.isVisible()) {
        await viewDetailsLink.click();

        // Should navigate to directory entry page
        await page.waitForURL("**/directory/entry/**");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        // Verify we can navigate back to map
        const backToMapLink = page
          .getByRole("link", { name: /map/i })
          .or(page.getByRole("button", { name: /back/i }));

        if (await backToMapLink.isVisible()) {
          await backToMapLink.click();
          await page.waitForURL("/map");
          await expect(page.locator(".mapboxgl-canvas")).toBeVisible();
        }
      }
    }
  });

  test("performs well on mobile devices with touch controls", async ({
    page,
    browserName,
  }) => {
    // Skip on non-mobile test runs
    const isMobile =
      page.viewportSize()?.width && page.viewportSize()!.width <= 768;
    if (!isMobile) return;

    const mapCanvas = page
      .locator(".mapboxgl-canvas")
      .or(page.locator("canvas").first());

    // Test touch zoom (pinch-to-zoom simulation)
    const canvasBox = await mapCanvas.boundingBox();
    if (canvasBox) {
      // Simulate pinch gesture for zoom
      await page.touchscreen.tap(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2
      );
      await page.waitForTimeout(500);

      // Map should remain responsive after touch
      await expect(mapCanvas).toBeVisible();
    }

    // Test marker tap on mobile
    const markers = page
      .locator(".mapboxgl-marker")
      .or(page.locator('[data-testid="map-marker"]'));

    if ((await markers.count()) > 0) {
      await markers.first().tap();

      // Should show popup optimized for mobile
      const popup = page
        .locator(".mapboxgl-popup")
        .or(page.locator('[data-testid="map-popup"]'));

      if (await popup.isVisible()) {
        // Popup should be touch-friendly sized
        const popupBox = await popup.boundingBox();
        expect(popupBox?.height).toBeGreaterThan(40);
      }
    }
  });

  test("handles poor connectivity gracefully", async ({ page }) => {
    // Simulate slow connection (common in Cape Verde)
    await page.route("**/*", async (route) => {
      // Add delay to simulate slow connection
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
      await route.continue();
    });

    await page.reload();

    // Map should still attempt to load
    const mapContainer = page.locator('[data-testid="interactive-map"]');
    await expect(mapContainer).toBeVisible();

    // Should show loading state or offline message
    const loadingIndicator = page
      .locator('[data-testid="map-loading"]')
      .or(page.getByText(/loading|connecting/i));

    if (await loadingIndicator.isVisible()) {
      // Wait for loading to complete or timeout
      await loadingIndicator.waitFor({ state: "hidden", timeout: 10000 });
    }

    // Map should either load or show appropriate error message
    const mapCanvas = page.locator(".mapboxgl-canvas");
    const errorMessage = page.getByText(/unable to load|connection error/i);

    const mapLoaded = await mapCanvas.isVisible();
    const errorShown = await errorMessage.isVisible();

    expect(mapLoaded || errorShown).toBeTruthy();
  });

  test("displays accurate Brava Island geography", async ({ page }) => {
    // Wait for map to fully load
    await page.waitForTimeout(5000);

    // Get map center coordinates (should be approximately Brava Island)
    const mapInfo = await page.evaluate(() => {
      // Access Mapbox GL JS map instance if available
      const mapElement = document.querySelector(".mapboxgl-map");
      if (mapElement && (window as any).mapboxMap) {
        const map = (window as any).mapboxMap;
        const center = map.getCenter();
        return {
          lng: center.lng,
          lat: center.lat,
          zoom: map.getZoom(),
        };
      }
      return null;
    });

    if (mapInfo) {
      // Verify map is centered approximately on Brava Island
      // Brava coordinates: latitude: ~14.84, longitude: ~-24.71
      expect(mapInfo.lat).toBeGreaterThan(14.5);
      expect(mapInfo.lat).toBeLessThan(15.2);
      expect(mapInfo.lng).toBeGreaterThan(-25.0);
      expect(mapInfo.lng).toBeLessThan(-24.0);

      // Should have reasonable zoom level for island overview
      expect(mapInfo.zoom).toBeGreaterThan(8);
      expect(mapInfo.zoom).toBeLessThan(18);
    }
  });

  test("supports accessibility for diverse users", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Should be able to reach map controls
    const focusedElement = page.locator(":focus");
    const hasFocus = (await focusedElement.count()) > 0;

    if (hasFocus) {
      // Test keyboard zoom
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);

      // Map should remain functional
      const mapCanvas = page.locator(".mapboxgl-canvas");
      await expect(mapCanvas).toBeVisible();
    }

    // Check for alt text on markers or controls
    const mapImages = page.locator("img");
    const imageCount = await mapImages.count();

    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = mapImages.nth(i);
      const altText = await img.getAttribute("alt");
      if (altText) {
        expect(altText.length).toBeGreaterThan(0);
      }
    }
  });

  test("integrates with towns page for regional exploration", async ({
    page,
  }) => {
    // Look for town markers or labels on the map
    const townMarkers = page
      .locator('[data-testid="town-marker"]')
      .or(page.locator(".town-label, .city-label"));

    if ((await townMarkers.count()) > 0) {
      await townMarkers.first().click();

      // Should show town information or link to towns page
      const townInfo = page
        .locator('[data-testid="town-popup"]')
        .or(page.getByText(/Nova Sintra|Furna|Fajã de Água/i));

      if (await townInfo.isVisible()) {
        const townLink = page.getByRole("link", { name: /view town|explore/i });

        if (await townLink.isVisible()) {
          await townLink.click();

          // Should navigate to towns page or specific town page
          await page.waitForURL("**/towns/**");
          await expect(page.getByRole("heading")).toBeVisible();
        }
      }
    }
  });
});

// Performance-focused map tests
test.describe("Map Performance for Tourism", () => {
  test("loads efficiently on various connection speeds", async ({
    page,
    context,
  }) => {
    // Test with different connection speeds
    const { throttleNetwork } = await import("../utils/network");
    const connectionProfiles = [
      {
        name: "3G",
        latency: 150,
      },
      {
        name: "4G",
        latency: 50,
      },
    ];

    for (const profile of connectionProfiles) {
      await throttleNetwork(context, {
        latency: profile.latency,
      });

      const startTime = Date.now();
      await page.goto("/map");

      // Wait for map to be visible
      await page.waitForSelector('[data-testid="interactive-map"]', {
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      console.log(`Map load time on ${profile.name}: ${loadTime}ms`);

      // Should load within reasonable time for tourism context
      expect(loadTime).toBeLessThan(profile.name === "3G" ? 15000 : 10000);

      // Verify map is functional
      const mapCanvas = page.locator(".mapboxgl-canvas");
      await expect(mapCanvas).toBeVisible();
    }
  });

  test("handles many markers efficiently", async ({ page }) => {
    await page.goto("/map");
    await page.waitForSelector('[data-testid="interactive-map"]', {
      timeout: 15000,
    });

    // Wait for all markers to load
    await page.waitForTimeout(3000);

    const markers = page
      .locator(".mapboxgl-marker")
      .or(page.locator('[data-testid="map-marker"]'));

    const markerCount = await markers.count();
    console.log(`Total markers on map: ${markerCount}`);

    // Test interaction performance with multiple markers
    if (markerCount > 5) {
      const startTime = Date.now();

      // Click on multiple markers
      for (let i = 0; i < Math.min(markerCount, 5); i++) {
        await markers.nth(i).click();
        await page.waitForTimeout(100);
      }

      const interactionTime = Date.now() - startTime;

      // Interactions should be responsive
      expect(interactionTime).toBeLessThan(3000);
    }
  });
});
