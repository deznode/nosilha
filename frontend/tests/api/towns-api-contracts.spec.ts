import { test, expect } from "@playwright/test";

/**
 * Towns API Contract Tests for Nos Ilha Tourism Platform
 *
 * Validates the towns API endpoints that provide cultural and geographic
 * information about Brava Island's communities for tourism discovery.
 *
 * Tests API contracts for:
 * - Towns listing and individual town data
 * - Cultural information accuracy
 * - Geographic data validation
 * - Response format consistency
 * - Performance for tourism applications
 */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface TownDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  population?: string;
  elevation?: string;
  highlights: string[];
  heroImage?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

test.describe("Towns API Contracts", () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  test("GET /api/v1/towns/all returns all Brava Island towns", async ({
    request,
  }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);

    expect(response.ok()).toBeTruthy();

    const data: ApiResponse<TownDto[]> = await response.json();

    // Validate response structure
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("timestamp");
    expect(Array.isArray(data.data)).toBe(true);

    // Should have major Brava Island towns
    expect(data.data.length).toBeGreaterThan(0);

    // Verify town data structure
    if (data.data.length > 0) {
      const firstTown = data.data[0];

      // Required fields
      expect(firstTown).toHaveProperty("id");
      expect(firstTown).toHaveProperty("name");
      expect(firstTown).toHaveProperty("slug");
      expect(firstTown).toHaveProperty("description");
      expect(firstTown).toHaveProperty("highlights");
      expect(firstTown).toHaveProperty("createdAt");
      expect(firstTown).toHaveProperty("updatedAt");

      // Validate data types
      expect(typeof firstTown.id).toBe("string");
      expect(typeof firstTown.name).toBe("string");
      expect(typeof firstTown.slug).toBe("string");
      expect(typeof firstTown.description).toBe("string");
      expect(Array.isArray(firstTown.highlights)).toBe(true);

      // Validate timestamps
      expect(() => new Date(firstTown.createdAt)).not.toThrow();
      expect(() => new Date(firstTown.updatedAt)).not.toThrow();

      // Validate geographic coordinates if present
      if (firstTown.latitude && firstTown.longitude) {
        expect(firstTown.latitude).toBeGreaterThan(14.0);
        expect(firstTown.latitude).toBeLessThan(15.0);
        expect(firstTown.longitude).toBeGreaterThan(-25.0);
        expect(firstTown.longitude).toBeLessThan(-24.0);
      }
    }
  });

  test("GET /api/v1/towns/all includes key Brava Island communities", async ({
    request,
  }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const data: ApiResponse<TownDto[]> = await response.json();

    expect(data.success).toBe(true);

    const townNames = data.data.map((town) => town.name.toLowerCase());
    const townSlugs = data.data.map((town) => town.slug.toLowerCase());

    // Should include major Brava Island towns
    const expectedTowns = ["nova sintra", "furna", "fajã de água"];

    const expectedSlugs = ["nova-sintra", "furna", "faja-de-agua"];

    // At least the capital (Nova Sintra) should be present
    const hasCapital =
      townNames.some((name) => name.includes("nova sintra")) ||
      townSlugs.includes("nova-sintra");

    expect(hasCapital).toBe(true);

    // Should have reasonable number of towns (not too few, not too many)
    expect(data.data.length).toBeGreaterThan(2);
    expect(data.data.length).toBeLessThan(20);
  });

  test("GET /api/v1/towns/slug/{slug} returns specific town details", async ({
    request,
  }) => {
    // First get all towns to find valid slugs
    const allTownsResponse = await request.get(
      `${apiBaseUrl}/api/v1/towns/all`
    );
    const allTowns: ApiResponse<TownDto[]> = await allTownsResponse.json();

    if (allTowns.data.length > 0) {
      const testTown = allTowns.data[0];

      // Get specific town by slug
      const response = await request.get(
        `${apiBaseUrl}/api/v1/towns/slug/${testTown.slug}`
      );

      expect(response.ok()).toBeTruthy();

      const data: ApiResponse<TownDto> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();

      // Should return the exact same town
      expect(data.data.id).toBe(testTown.id);
      expect(data.data.slug).toBe(testTown.slug);
      expect(data.data.name).toBe(testTown.name);

      // Should have complete town information
      expect(data.data.description.length).toBeGreaterThan(10);
      expect(data.data.highlights.length).toBeGreaterThan(0);
    }
  });

  test("GET /api/v1/towns/slug/nova-sintra returns capital town details", async ({
    request,
  }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/towns/slug/nova-sintra`
    );

    if (response.ok()) {
      const data: ApiResponse<TownDto> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.name.toLowerCase()).toContain("nova sintra");

      // Nova Sintra should have capital/administrative highlights
      const description = data.data.description.toLowerCase();
      const highlights = data.data.highlights.join(" ").toLowerCase();

      const hasCapitalMentions =
        description.includes("capital") ||
        description.includes("administrative") ||
        highlights.includes("capital") ||
        highlights.includes("unesco");

      expect(hasCapitalMentions).toBe(true);

      // Should have elevation data (Nova Sintra is in mountains)
      if (data.data.elevation) {
        const elevationNum = parseInt(data.data.elevation);
        expect(elevationNum).toBeGreaterThan(300); // Should be significantly above sea level
      }
    } else if (response.status() === 404) {
      console.log(
        "Nova Sintra endpoint not available - towns may use different slugs"
      );
    }
  });

  test("GET /api/v1/towns/slug/{slug} returns 404 for non-existent town", async ({
    request,
  }) => {
    const response = await request.get(
      `${apiBaseUrl}/api/v1/towns/slug/non-existent-town`
    );

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
  });

  test("Towns API provides culturally authentic information", async ({
    request,
  }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const data: ApiResponse<TownDto[]> = await response.json();

    expect(data.success).toBe(true);

    // Check for cultural authenticity in descriptions and highlights
    const allText = data.data
      .map((town) => `${town.description} ${town.highlights.join(" ")}`)
      .join(" ")
      .toLowerCase();

    // Should include authentic Cape Verdean cultural references
    const culturalTerms = [
      "heritage",
      "tradition",
      "colonial",
      "fishing",
      "maritime",
      "volcanic",
      "crater",
      "unesco",
    ];

    const hasCulturalContent = culturalTerms.some((term) =>
      allText.includes(term)
    );
    expect(hasCulturalContent).toBe(true);

    // Should not use inappropriate or insensitive language
    const inappropriateTerms = [
      "primitive",
      "backward",
      "underdeveloped",
      "third world",
    ];

    const hasInappropriateContent = inappropriateTerms.some((term) =>
      allText.includes(term)
    );
    expect(hasInappropriateContent).toBe(false);
  });

  test("Towns API includes practical tourism information", async ({
    request,
  }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const data: ApiResponse<TownDto[]> = await response.json();

    expect(data.success).toBe(true);

    // Check that towns have practical information for tourists
    data.data.forEach((town) => {
      // Description should be substantial and informative
      expect(town.description.length).toBeGreaterThan(20);

      // Should have highlights that tourists would find interesting
      expect(town.highlights.length).toBeGreaterThan(0);
      town.highlights.forEach((highlight) => {
        expect(highlight.length).toBeGreaterThan(3);
      });

      // If population is provided, should be in readable format
      if (town.population) {
        expect(town.population.length).toBeGreaterThan(0);
      }

      // If elevation is provided, should be informative
      if (town.elevation) {
        expect(town.elevation.length).toBeGreaterThan(0);
      }
    });
  });

  test("Towns API performance meets tourism requirements", async ({
    request,
  }) => {
    const startTime = Date.now();

    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);

    const responseTime = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();

    // Towns API should be fast for tourism discovery
    expect(responseTime).toBeLessThan(1500); // 1.5 seconds max

    console.log(`Towns API response time: ${responseTime}ms`);

    // Response should be reasonably sized for mobile
    const responseText = await response.text();
    const responseSize = Buffer.byteLength(responseText);
    expect(responseSize).toBeLessThan(500 * 1024); // 500KB max

    console.log(`Towns API response size: ${responseSize} bytes`);
  });

  test("Towns API supports slugs with special characters", async ({
    request,
  }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const data: ApiResponse<TownDto[]> = await response.json();

    // Look for towns with special characters (like Fajã de Água)
    const townWithSpecialChars = data.data.find(
      (town) =>
        town.name.includes("ã") ||
        town.name.includes("á") ||
        town.name.includes("ç") ||
        town.slug.includes("faja") ||
        town.slug.includes("agua")
    );

    if (townWithSpecialChars) {
      // Test getting town by slug with special character handling
      const slugResponse = await request.get(
        `${apiBaseUrl}/api/v1/towns/slug/${townWithSpecialChars.slug}`
      );

      expect(slugResponse.ok()).toBeTruthy();

      const slugData: ApiResponse<TownDto> = await slugResponse.json();
      expect(slugData.success).toBe(true);
      expect(slugData.data.id).toBe(townWithSpecialChars.id);
    }
  });

  test("Towns API provides consistent data structure", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const data: ApiResponse<TownDto[]> = await response.json();

    expect(data.success).toBe(true);

    // All towns should have consistent structure
    data.data.forEach((town, index) => {
      // Required fields should be present for all towns
      expect(town).toHaveProperty("id");
      expect(town).toHaveProperty("name");
      expect(town).toHaveProperty("slug");
      expect(town).toHaveProperty("description");
      expect(town).toHaveProperty("highlights");
      expect(town).toHaveProperty("createdAt");
      expect(town).toHaveProperty("updatedAt");

      // Data types should be consistent
      expect(typeof town.id).toBe("string");
      expect(typeof town.name).toBe("string");
      expect(typeof town.slug).toBe("string");
      expect(typeof town.description).toBe("string");
      expect(Array.isArray(town.highlights)).toBe(true);

      // Optional fields should have correct types when present
      if (town.population) {
        expect(typeof town.population).toBe("string");
      }

      if (town.elevation) {
        expect(typeof town.elevation).toBe("string");
      }

      if (town.heroImage) {
        expect(typeof town.heroImage).toBe("string");
        expect(town.heroImage).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      }

      if (town.latitude) {
        expect(typeof town.latitude).toBe("number");
      }

      if (town.longitude) {
        expect(typeof town.longitude).toBe("number");
      }
    });
  });

  test("Towns API handles edge cases gracefully", async ({ request }) => {
    // Test with invalid slug characters
    const invalidSlugs = [
      "town-with-spaces spaces",
      "town/with/slashes",
      "town%20with%20encoding",
      "UPPERCASE-SLUG",
    ];

    for (const invalidSlug of invalidSlugs) {
      const response = await request.get(
        `${apiBaseUrl}/api/v1/towns/slug/${encodeURIComponent(invalidSlug)}`
      );

      // Should either handle gracefully or return consistent 404
      expect([200, 404, 400]).toContain(response.status());

      if (response.status() !== 200) {
        const errorData = await response.json();
        expect(errorData.success).toBe(false);
        expect(errorData).toHaveProperty("message");
      }
    }
  });

  test("Towns API maintains referential integrity with directory", async ({
    request,
  }) => {
    // Get all towns
    const townsResponse = await request.get(`${apiBaseUrl}/api/v1/towns/all`);
    const townsData: ApiResponse<TownDto[]> = await townsResponse.json();

    // Get all directory entries
    const directoryResponse = await request.get(
      `${apiBaseUrl}/api/v1/directory/entries`
    );

    if (directoryResponse.ok()) {
      const directoryData = await directoryResponse.json();

      if (directoryData.data && directoryData.data.length > 0) {
        // Check that directory entries reference valid towns
        const townNames = townsData.data.map((town) => town.name);

        directoryData.data.forEach((entry: any) => {
          if (entry.town) {
            const townExists = townNames.some(
              (townName) => townName.toLowerCase() === entry.town.toLowerCase()
            );

            // Directory entries should reference valid towns
            // (This might not be enforced, but it's good data integrity)
            if (!townExists) {
              console.warn(
                `Directory entry references unknown town: ${entry.town}`
              );
            }
          }
        });
      }
    }
  });
});

// Towns API Error Handling Tests
test.describe("Towns API Error Handling", () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  test("API provides proper error responses for malformed requests", async ({
    request,
  }) => {
    // Test with malformed slug
    const response = await request.get(`${apiBaseUrl}/api/v1/towns/slug/`);

    expect([404, 400]).toContain(response.status());

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
  });

  test("API handles server errors gracefully", async ({ request }) => {
    // Test endpoint that might cause server issues
    const response = await request.get(
      `${apiBaseUrl}/api/v1/towns/slug/${"x".repeat(1000)}`
    );

    // Should not return 500 errors for client issues
    expect(response.status()).toBeLessThan(500);

    if (!response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data).toHaveProperty("message");
    }
  });
});
