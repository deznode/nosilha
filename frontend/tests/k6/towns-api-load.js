import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

/**
 * K6 Load Testing for Nos Ilha Towns API
 *
 * Tests the towns API under realistic cultural tourism traffic.
 * Simulates tourists exploring Brava Island's communities and
 * cultural heritage information.
 *
 * Key scenarios:
 * - Cultural heritage exploration
 * - Town-specific information lookup
 * - Integration with directory browsing
 * - Mobile-first access patterns
 *
 * Run with: k6 run towns-api-load.js
 */

// Custom metrics for towns API monitoring
const townApiErrorRate = new Rate("town_api_errors");
const culturalContentLoadTime = new Rate("slow_cultural_content");

export const options = {
  scenarios: {
    // Scenario 1: Cultural heritage exploration
    cultural_exploration: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 5 }, // Gradual interest in cultural content
        { duration: "4m", target: 15 }, // Peak cultural exploration
        { duration: "2m", target: 5 }, // Sustained interest
        { duration: "1m", target: 0 }, // Wind down
      ],
    },

    // Scenario 2: Quick town lookup (mobile users)
    quick_town_lookup: {
      executor: "constant-arrival-rate",
      rate: 10, // 10 requests per second
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 8,
      startTime: "5m",
    },

    // Scenario 3: Educational/research access
    educational_research: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 3 },
        { duration: "3m", target: 8 }, // Researchers dig deeper
        { duration: "30s", target: 0 },
      ],
      startTime: "8m",
    },
  },

  // Performance thresholds for cultural content
  thresholds: {
    // Cultural content should load quickly for engagement
    http_req_duration: ["p(95)<1500"],

    // Individual town pages should be very fast
    "http_req_duration{type:town_detail}": ["p(95)<1000"],

    // High reliability for cultural heritage platform
    http_req_failed: ["rate<0.005"],

    // Towns API specific metrics
    town_api_errors: ["rate<0.01"],
    slow_cultural_content: ["rate<0.05"], // Less than 5% slow content
  },
};

const API_BASE_URL = __ENV.API_BASE_URL || "http://localhost:8080";

// Brava Island towns for testing
const EXPECTED_TOWNS = [
  "nova-sintra",
  "furna",
  "faja-de-agua",
  "mato",
  "cachaco",
  "nossa-senhora-do-monte",
];

export function setup() {
  console.log("🏘️  Setting up Nos Ilha Towns API Load Test...");

  // Verify towns API is accessible
  const healthCheck = http.get(`${API_BASE_URL}/actuator/health`);

  if (healthCheck.status !== 200) {
    throw new Error(`API health check failed: ${healthCheck.status}`);
  }

  // Get actual towns data for testing
  const townsResponse = http.get(`${API_BASE_URL}/api/v1/towns/all`);

  if (townsResponse.status === 200) {
    const data = JSON.parse(townsResponse.body);
    const townSlugs = data.data ? data.data.map((town) => town.slug) : [];
    console.log(
      `🏘️  Retrieved ${townSlugs.length} town slugs for testing: ${townSlugs.join(", ")}`
    );
    return { townSlugs };
  } else {
    console.warn("⚠️  Could not retrieve town data - using expected towns");
    return { townSlugs: EXPECTED_TOWNS };
  }
}

export default function (data) {
  const scenario = __ENV.K6_SCENARIO || "cultural_exploration";

  switch (scenario) {
    case "cultural_exploration":
      performCulturalExploration(data);
      break;
    case "quick_town_lookup":
      performQuickTownLookup(data);
      break;
    case "educational_research":
      performEducationalResearch(data);
      break;
    default:
      performCulturalExploration(data);
  }
}

function performCulturalExploration(data) {
  const params = {
    tags: {
      user_type: "cultural_explorer",
      scenario: "cultural_exploration",
    },
  };

  // 1. Browse all towns to understand the island
  browseAllTowns(params);

  // 2. Deep dive into main cultural centers
  if (data.townSlugs && data.townSlugs.length > 0) {
    exploreMainTowns(data.townSlugs, params);
  }

  // 3. Compare different communities
  if (Math.random() < 0.6) {
    // 60% of cultural explorers compare towns
    compareTowns(data.townSlugs, params);
  }

  // Simulate time spent appreciating cultural content
  sleep(2 + Math.random() * 3);
}

function performQuickTownLookup(data) {
  const params = {
    tags: {
      user_type: "quick_lookup",
      scenario: "quick_town_lookup",
    },
  };

  if (data.townSlugs && data.townSlugs.length > 0) {
    // Quick lookup of specific town (mobile user pattern)
    const randomTown =
      data.townSlugs[Math.floor(Math.random() * data.townSlugs.length)];
    lookupSpecificTown(randomTown, params);
  } else {
    // Fallback to towns list
    browseAllTowns(params);
  }

  // Quick mobile interaction
  sleep(0.5);
}

function performEducationalResearch(data) {
  const params = {
    tags: {
      user_type: "researcher",
      scenario: "educational_research",
    },
  };

  // 1. Comprehensive towns overview
  browseAllTowns(params);

  // 2. Detailed study of multiple towns
  if (data.townSlugs && data.townSlugs.length > 0) {
    const townsToStudy = Math.min(data.townSlugs.length, 4);

    for (let i = 0; i < townsToStudy; i++) {
      const town = data.townSlugs[i];
      lookupSpecificTown(town, params);

      // Researchers spend more time analyzing
      sleep(1 + Math.random() * 2);
    }
  }

  // Additional research time
  sleep(3);
}

function browseAllTowns(params) {
  const url = `${API_BASE_URL}/api/v1/towns/all`;

  const response = http.get(url, params);

  const success = check(response, {
    "towns list loaded": (r) => r.status === 200,
    "towns data structure valid": (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
    "towns list fast": (r) => r.timings.duration < 1000,
    "towns have cultural content": (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return (
        body.data &&
        body.data.length > 0 &&
        body.data[0].description &&
        body.data[0].highlights
      );
    },
  });

  if (!success) {
    townApiErrorRate.add(1);
  }

  if (response.timings.duration > 800) {
    culturalContentLoadTime.add(1, { type: "towns_list" });
  }

  // Validate cultural content quality
  if (response.status === 200) {
    validateCulturalContent(response);
  }

  sleep(0.5);
}

function exploreMainTowns(townSlugs, params) {
  // Focus on main cultural centers
  const mainTowns = townSlugs.filter(
    (slug) =>
      slug.includes("nova-sintra") ||
      slug.includes("furna") ||
      slug.includes("faja")
  );

  const townsToExplore =
    mainTowns.length > 0 ? mainTowns : townSlugs.slice(0, 2);

  for (const townSlug of townsToExplore) {
    lookupSpecificTown(townSlug, params);
    sleep(1 + Math.random()); // Cultural appreciation time
  }
}

function lookupSpecificTown(townSlug, params) {
  const url = `${API_BASE_URL}/api/v1/towns/slug/${townSlug}`;

  const taggedParams = { ...params };
  taggedParams.tags = { ...params.tags, type: "town_detail", town: townSlug };

  const response = http.get(url, taggedParams);

  const success = check(response, {
    "specific town loaded": (r) => r.status === 200,
    "town details complete": (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return (
        body.success &&
        body.data &&
        body.data.name &&
        body.data.description &&
        body.data.highlights &&
        body.data.highlights.length > 0
      );
    },
    "town detail fast": (r) => r.timings.duration < 800,
    "cultural authenticity": (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      const content =
        `${body.data.description} ${body.data.highlights.join(" ")}`.toLowerCase();

      // Check for authentic cultural references
      const culturalTerms = [
        "heritage",
        "tradition",
        "colonial",
        "fishing",
        "volcanic",
        "unesco",
      ];
      return culturalTerms.some((term) => content.includes(term));
    },
  });

  if (!success) {
    townApiErrorRate.add(1);
  }

  if (response.timings.duration > 600) {
    culturalContentLoadTime.add(1, { type: "town_detail" });
  }

  // Handle 404s gracefully (some towns might not exist)
  if (response.status === 404) {
    console.log(`ℹ️  Town not found: ${townSlug}`);
  }
}

function compareTowns(townSlugs, params) {
  // Load multiple towns for comparison (educational pattern)
  const townsToCompare = Math.min(3, townSlugs.length);
  const startTime = new Date().getTime();

  for (let i = 0; i < townsToCompare; i++) {
    const townSlug = townSlugs[i];
    lookupSpecificTown(townSlug, params);
    sleep(0.3); // Brief pause between comparisons
  }

  const totalTime = new Date().getTime() - startTime;

  // Comparison session should be reasonably fast
  if (totalTime > 5000) {
    culturalContentLoadTime.add(1, { type: "town_comparison" });
  }
}

function validateCulturalContent(response) {
  if (response.status !== 200) return;

  const body = JSON.parse(response.body);

  if (body.data && Array.isArray(body.data)) {
    body.data.forEach((town) => {
      // Check for cultural authenticity markers
      const description = town.description
        ? town.description.toLowerCase()
        : "";
      const highlights = town.highlights
        ? town.highlights.join(" ").toLowerCase()
        : "";

      const allContent = `${description} ${highlights}`;

      // Validate positive cultural representation
      const problematicTerms = [
        "primitive",
        "backward",
        "underdeveloped",
        "third world",
      ];
      const hasProblematicContent = problematicTerms.some((term) =>
        allContent.includes(term)
      );

      if (hasProblematicContent) {
        console.warn(
          `⚠️  Potentially problematic cultural content detected in town: ${town.name}`
        );
      }

      // Validate informative content
      if (description.length < 20) {
        console.warn(`⚠️  Town description too brief: ${town.name}`);
      }

      if (!highlights || highlights.length === 0) {
        console.warn(`⚠️  Town missing highlights: ${town.name}`);
      }
    });
  }
}

export function teardown(data) {
  console.log("🏁 Nos Ilha Towns API Load Test Complete");
  console.log("📊 Cultural Heritage Platform Performance Summary:");
  console.log("   - Cultural content should load within 1.5s for engagement");
  console.log("   - Town details should be under 800ms for mobile users");
  console.log(
    "   - API reliability should be >99.5% for heritage preservation"
  );
  console.log("   - Content should maintain cultural authenticity and respect");
}

// Enhanced summary for cultural tourism context
export function handleSummary(data) {
  const summary = {
    ...data,
    custom_metrics: {
      cultural_content_quality:
        "See console logs for cultural content validation",
      mobile_optimization:
        "Town detail responses optimized for mobile cultural exploration",
      heritage_preservation:
        "API maintains high reliability for cultural heritage access",
    },
  };

  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "results/towns-api-load-summary.json": JSON.stringify(summary),
  };
}
