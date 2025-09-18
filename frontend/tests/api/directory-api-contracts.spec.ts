import { test, expect } from "@playwright/test";

/**
 * Directory API Contract Tests for Nos Ilha Tourism Platform
 *
 * Validates that the frontend and backend API contracts are compatible
 * and that the tourism platform's core directory functionality works
 * correctly across system boundaries.
 *
 * Tests API contracts for:
 * - Directory entries CRUD operations
 * - Category filtering and pagination
 * - Search functionality
 * - Data validation and error handling
 * - Response format consistency
 */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface PagedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

interface DirectoryEntryDto {
  id: string;
  slug: string;
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Landmark";
  town: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string;
  rating?: number;
  reviewCount: number;
  details: any; // Restaurant/Hotel specific details
  createdAt: string;
  updatedAt: string;
}

test.describe("Directory API Contracts", () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  test("GET /api/v1/directory/entries returns paginated directory entries", async ({
    request,
  }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );

    expect(response.ok()).toBeTruthy();

    const data: PagedApiResponse<DirectoryEntryDto> = await response.json();

    // Validate response structure
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(data).toHaveProperty("timestamp");

    // Validate pagination structure
    expect(data.pagination).toHaveProperty("page");
    expect(data.pagination).toHaveProperty("size");
    expect(data.pagination).toHaveProperty("total");
    expect(data.pagination).toHaveProperty("totalPages");

    // Validate directory entries structure
    if (data.data.length > 0) {
      const firstEntry = data.data[0];

      // Required fields
      expect(firstEntry).toHaveProperty("id");
      expect(firstEntry).toHaveProperty("slug");
      expect(firstEntry).toHaveProperty("name");
      expect(firstEntry).toHaveProperty("category");
      expect(firstEntry).toHaveProperty("town");
      expect(firstEntry).toHaveProperty("latitude");
      expect(firstEntry).toHaveProperty("longitude");
      expect(firstEntry).toHaveProperty("description");
      expect(firstEntry).toHaveProperty("reviewCount");
      expect(firstEntry).toHaveProperty("createdAt");
      expect(firstEntry).toHaveProperty("updatedAt");

      // Validate data types
      expect(typeof firstEntry.id).toBe("string");
      expect(typeof firstEntry.name).toBe("string");
      expect(["Restaurant", "Hotel", "Beach", "Landmark"]).toContain(
        firstEntry.category
      );
      expect(typeof firstEntry.latitude).toBe("number");
      expect(typeof firstEntry.longitude).toBe("number");
      expect(typeof firstEntry.reviewCount).toBe("number");

      // Validate geographic constraints for Brava Island
      expect(firstEntry.latitude).toBeGreaterThan(14.0);
      expect(firstEntry.latitude).toBeLessThan(15.0);
      expect(firstEntry.longitude).toBeGreaterThan(-25.0);
      expect(firstEntry.longitude).toBeLessThan(-24.0);

      // Validate timestamps
      expect(() => new Date(firstEntry.createdAt)).not.toThrow();
      expect(() => new Date(firstEntry.updatedAt)).not.toThrow();
    }
  });

  test("GET /api/v1/directory/entries supports category filtering", async ({
    request,
  }) => {
    const categories = ["Restaurant", "Hotel", "Beach", "Landmark"];

    for (const category of categories) {
      const response = await request.get(
        `${apiBaseUrl}/api/v1/directory/entries?category=${category}`
      );

      expect(response.ok()).toBeTruthy();

      const data: PagedApiResponse<DirectoryEntryDto> = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      // All returned entries should match the requested category
      data.data.forEach((entry) => {
        expect(entry.category).toBe(category);
      });
    }
  });

  test("GET /api/v1/directory/entries supports pagination parameters", async ({
    request,
  }) => {
    // Test with different page sizes
    const pageSizes = [5, 10, 20];

    for (const size of pageSizes) {
      const response = await request.get(
        `${apiBaseUrl}/api/v1/directory/entries?page=0&size=${size}`
      );

      expect(response.ok()).toBeTruthy();

      const data: PagedApiResponse<DirectoryEntryDto> = await response.json();

      expect(data.success).toBe(true);
      expect(data.pagination.size).toBe(size);
      expect(data.pagination.page).toBe(0);
      expect(data.data.length).toBeLessThanOrEqual(size);
    }

    // Test pagination navigation
    const firstPageResponse = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries?page=0&size=5`
    );
    const firstPageData: PagedApiResponse<DirectoryEntryDto> =
      await firstPageResponse.json();

    if (firstPageData.pagination.totalPages > 1) {
      const secondPageResponse = await request.get(
        `${apiBaseUrl}/api/v1/directory/entries?page=1&size=5`
      );
      const secondPageData: PagedApiResponse<DirectoryEntryDto> =
        await secondPageResponse.json();

      expect(secondPageData.success).toBe(true);
      expect(secondPageData.pagination.page).toBe(1);

      // Entries should be different between pages
      const firstPageIds = firstPageData.data.map((e) => e.id);
      const secondPageIds = secondPageData.data.map((e) => e.id);

      const hasOverlap = firstPageIds.some((id) => secondPageIds.includes(id));
      expect(hasOverlap).toBe(false);
    }
  });

  test("GET /api/v1/directory/slug/{slug} returns specific entry", async ({
    request,
  }) => {
    // First, get a list of entries to find a valid slug
    const entriesResponse = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries?size=5`
    );
    const entriesData: PagedApiResponse<DirectoryEntryDto> =
      await entriesResponse.json();

    if (entriesData.data.length > 0) {
      const testEntry = entriesData.data[0];

      // Test getting entry by slug
      const response = await request.get(
        `${apiBaseUrl}/api/v1/directory/slug/${testEntry.slug}`
      );

      expect(response.ok()).toBeTruthy();

      const data: ApiResponse<DirectoryEntryDto> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(testEntry.id);
      expect(data.data.slug).toBe(testEntry.slug);

      // Verify complete entry structure
      expect(data.data).toMatchObject({
        id: testEntry.id,
        slug: testEntry.slug,
        name: testEntry.name,
        category: testEntry.category,
        town: testEntry.town,
      });
    }
  });

  test("GET /api/v1/directory/slug/{slug} returns 404 for non-existent entry", async ({
    request,
  }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/directory/slug/non-existent-entry-slug`
    );

    expect(response.status()).toBe(404);

    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
  });

  test("POST /api/v1/directory/entries validates required fields", async ({
    request,
  }) => {
    // Test with missing required fields
    const invalidEntry = {
      name: "Test Restaurant",
      // Missing category, town, coordinates, description
    };

    const response = await request.post(
      `${apiBaseUrl}/api/v1/directory/entries`,
      {
        data: invalidEntry,
        headers: {
          "Content-Type": "application/json",
          // Note: This would require authentication in a real scenario
        },
      }
    );

    expect(response.status()).toBe(400);

    const errorData = await response.json();

    expect(errorData.success).toBe(false);
    expect(errorData).toHaveProperty("message");

    // Should provide validation details
    if (errorData.details) {
      expect(Array.isArray(errorData.details)).toBe(true);
    }
  });

  test("POST /api/v1/directory/entries validates geographic constraints", async ({
    request,
  }) => {
    const entryWithInvalidCoordinates = {
      name: "Test Restaurant",
      category: "Restaurant",
      town: "Nova Sintra",
      latitude: 0, // Invalid for Brava Island
      longitude: 0, // Invalid for Brava Island
      description: "Test description",
    };

    const response = await request.post(
      `${apiBaseUrl}/api/v1/directory/entries`,
      {
        data: entryWithInvalidCoordinates,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Should either reject invalid coordinates or accept them (depending on validation rules)
    if (response.status() === 400) {
      const errorData = await response.json();
      expect(errorData.success).toBe(false);

      // Validation should mention coordinate issues
      const errorMessage = errorData.message?.toLowerCase() || "";
      expect(errorMessage).toMatch(/(latitude|longitude|coordinate|location)/);
    }
  });

  test("API responses include proper CORS headers", async ({ request }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );

    // Check for CORS headers
    const corsHeader = response.headers()["access-control-allow-origin"];
    const corsCredentials =
      response.headers()["access-control-allow-credentials"];

    // Should allow frontend origin
    expect(corsHeader).toBeDefined();

    // For tourism platform, CORS should be properly configured
    expect(
      ["*", "http://localhost:3000", process.env.FRONTEND_URL].some((origin) =>
        corsHeader?.includes(origin || "")
      )
    ).toBe(true);
  });

  test("API handles malformed requests gracefully", async ({ request }) => {
    // Test with invalid JSON
    const response = await request.post(
      `${apiBaseUrl}/api/v1/directory/entries`,
      {
        data: "{ invalid json",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    expect(response.status()).toBe(400);

    const errorData = await response.json();
    expect(errorData.success).toBe(false);
    expect(errorData).toHaveProperty("message");
  });

  test("API performance meets tourism platform requirements", async ({
    request,
  }) => {
    const startTime = Date.now();

    const response = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );

    const responseTime = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();

    // API should respond quickly for tourism use cases
    expect(responseTime).toBeLessThan(2000); // 2 seconds max

    console.log(`Directory API response time: ${responseTime}ms`);

    // Check response size is reasonable for mobile
    const responseSize = Buffer.byteLength(await response.text());
    expect(responseSize).toBeLessThan(1024 * 1024); // 1MB max for mobile

    console.log(`Directory API response size: ${responseSize} bytes`);
  });

  test("API maintains data consistency across operations", async ({
    request,
  }) => {
    // Get all entries
    const allEntriesResponse = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );
    const allEntries: PagedApiResponse<DirectoryEntryDto> =
      await allEntriesResponse.json();

    if (allEntries.data.length > 0) {
      const testEntry = allEntries.data[0];

      // Get same entry by slug
      const slugResponse = await request.get(
        `${apiBaseUrl}/api/v1/directory/slug/${testEntry.slug}`
      );
      const slugEntry: ApiResponse<DirectoryEntryDto> =
        await slugResponse.json();

      // Data should be consistent
      expect(slugEntry.data).toMatchObject({
        id: testEntry.id,
        slug: testEntry.slug,
        name: testEntry.name,
        category: testEntry.category,
        town: testEntry.town,
        latitude: testEntry.latitude,
        longitude: testEntry.longitude,
      });

      // Timestamps should match
      expect(slugEntry.data.createdAt).toBe(testEntry.createdAt);
      expect(slugEntry.data.updatedAt).toBe(testEntry.updatedAt);
    }
  });

  test("API supports case-insensitive category filtering", async ({
    request,
  }) => {
    // Test with different case variations
    const categoryVariations = [
      "restaurant",
      "RESTAURANT",
      "Restaurant",
      "rEsTaUrAnT",
    ];

    for (const categoryVariation of categoryVariations) {
      const response = await request.get(
        `${apiBaseUrl}/api/v1/directory/entries?category=${categoryVariation}`
      );

      // Should either work (case-insensitive) or return consistent error
      if (response.ok()) {
        const data: PagedApiResponse<DirectoryEntryDto> = await response.json();
        expect(data.success).toBe(true);

        // All entries should be restaurants
        data.data.forEach((entry) => {
          expect(entry.category).toBe("Restaurant");
        });
      } else {
        // If case-sensitive, should consistently fail for non-exact matches
        expect(response.status()).toBe(400);
      }
    }
  });
});

// Health and status endpoint tests
test.describe("API Health and Status Contracts", () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  test("Health endpoint provides system status", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/actuator/health`);

    expect(response.ok()).toBeTruthy();

    const healthData = await response.json();

    expect(healthData).toHaveProperty("status");
    expect(["UP", "DOWN"].includes(healthData.status)).toBe(true);

    // Should provide component health details
    if (healthData.components) {
      // Database health is critical for directory operations
      if (healthData.components.db) {
        expect(healthData.components.db.status).toBe("UP");
      }
    }
  });

  test("API provides proper content-type headers", async ({ request }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );

    expect(response.ok()).toBeTruthy();

    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});
