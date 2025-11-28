import { chromium, FullConfig } from "@playwright/test";
import { setupTestDatabase } from "./database-setup";
import { seedMockData } from "./mock-data-setup";

/**
 * Global setup for Nos Ilha integration tests.
 *
 * This setup ensures:
 * - Test environment is properly configured
 * - Mock data is available for offline testing
 * - API endpoints are healthy before test execution
 * - Database is in a known state (if needed)
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Setting up Nos Ilha integration tests...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 1. Check if the application is running
    console.log("📍 Checking application health...");
    const baseURL = config.projects[0].use?.baseURL || "http://localhost:3000";

    try {
      await page.goto(`${baseURL}`, { timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      console.log("✅ Frontend application is accessible");
    } catch (error) {
      console.error("❌ Frontend application not accessible:", error);
      throw new Error(
        "Frontend application must be running before tests. Run: npm run dev"
      );
    }

    // 2. Check backend API health
    console.log("🔌 Checking backend API health...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      const healthResponse = await page.request.get(
        `${apiUrl}/actuator/health`
      );
      if (healthResponse.ok()) {
        console.log("✅ Backend API is healthy");
      } else {
        console.warn(
          "⚠️ Backend API health check failed - falling back to mock data"
        );
      }
    } catch (_error) {
      console.warn(
        "⚠️ Backend API not accessible - tests will use mock data fallback"
      );
    }

    // 3. Setup test database if configured
    if (process.env.TEST_DATABASE_URL) {
      console.log("🗄️ Setting up test database...");
      await setupTestDatabase();
      console.log("✅ Test database ready");
    }

    // 4. Ensure mock data is available for offline testing
    console.log("🎭 Setting up mock data...");
    await seedMockData();
    console.log("✅ Mock data configured");

    // 5. Check critical pages load correctly
    console.log("🏠 Verifying critical pages...");
    const criticalPages = ["/", "/directory/all", "/map", "/towns"];

    for (const pagePath of criticalPages) {
      try {
        const response = await page.goto(`${baseURL}${pagePath}`, {
          timeout: 15000,
          waitUntil: "domcontentloaded",
        });

        if (!response || !response.ok()) {
          console.warn(`⚠️ Page ${pagePath} returned ${response?.status()}`);
        } else {
          console.log(`✅ Page ${pagePath} loads successfully`);
        }
      } catch (error) {
        console.warn(`⚠️ Page ${pagePath} failed to load:`, error);
      }
    }

    // 6. Verify essential dependencies are available
    console.log("🗺️ Checking map dependencies...");
    try {
      // Check if Mapbox token is configured
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!mapboxToken || mapboxToken.startsWith("your_mapbox_token")) {
        console.warn(
          "⚠️ Mapbox token not configured - map tests will be limited"
        );
      } else {
        console.log("✅ Mapbox integration ready");
      }
    } catch (error) {
      console.warn("⚠️ Map dependencies check failed:", error);
    }

    console.log("🎉 Global setup completed successfully!");

    // Store setup state for tests to reference
    process.env.PLAYWRIGHT_SETUP_COMPLETE = "true";
    process.env.PLAYWRIGHT_SETUP_TIMESTAMP = new Date().toISOString();
  } catch (error) {
    console.error("💥 Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
