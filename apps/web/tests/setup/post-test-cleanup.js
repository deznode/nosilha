#!/usr/bin/env node

/**
 * Post-test cleanup script for Nos Ilha integration testing.
 *
 * Handles cleanup and result processing after integration tests
 * complete for the tourism platform.
 *
 * Tasks:
 * - Test result aggregation
 * - Performance metrics collection
 * - CI/CD integration data preparation
 * - Artifact organization
 * - Report generation
 */

const fs = require("fs").promises;
const path = require("path");

// Configuration
const CONFIG = {
  RESULTS_DIR: "test-results",
  REPORTS_DIR: "playwright-report",
  LIGHTHOUSE_DIR: ".lighthouseci",
  K6_RESULTS_DIR: "results",
  OUTPUT_DIR: "test-output",
  CI_INTEGRATION_FILE: "ci-integration-results.json",
};

async function main() {
  console.log("🧹 Starting Nos Ilha Integration Test Cleanup...\n");

  try {
    // Step 1: Collect test results
    const testResults = await collectTestResults();

    // Step 2: Process performance metrics
    const performanceMetrics = await processPerformanceMetrics();

    // Step 3: Generate summary report
    const summary = await generateSummaryReport(
      testResults,
      performanceMetrics
    );

    // Step 4: Prepare CI/CD integration data
    await prepareCIIntegration(summary);

    // Step 5: Organize artifacts
    await organizeArtifacts();

    // Step 6: Display results
    displayResults(summary);

    console.log("\n✅ Test cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Test cleanup failed:", error.message);
    process.exit(1);
  }
}

async function collectTestResults() {
  console.log("📊 Collecting test results...");

  const results = {
    playwright: null,
    lighthouse: null,
    k6: null,
    timestamp: new Date().toISOString(),
  };

  // Collect Playwright results
  try {
    const playwrightResultsPath = path.join(CONFIG.RESULTS_DIR, "results.json");
    const playwrightResults = await fs.readFile(playwrightResultsPath, "utf8");
    results.playwright = JSON.parse(playwrightResults);
    console.log("   ✓ Playwright results collected");
  } catch (_error) {
    console.warn("   ⚠️  Playwright results not found");
  }

  // Collect Lighthouse results
  try {
    const lighthouseFiles = await fs.readdir(CONFIG.LIGHTHOUSE_DIR);
    const lhrFiles = lighthouseFiles.filter(
      (file) => file.startsWith("lhr-") && file.endsWith(".json")
    );

    if (lhrFiles.length > 0) {
      const lighthouseResults = [];

      for (const file of lhrFiles.slice(0, 5)) {
        // Limit to 5 most recent
        const filePath = path.join(CONFIG.LIGHTHOUSE_DIR, file);
        const content = await fs.readFile(filePath, "utf8");
        lighthouseResults.push(JSON.parse(content));
      }

      results.lighthouse = lighthouseResults;
      console.log(
        `   ✓ Lighthouse results collected (${lhrFiles.length} audits)`
      );
    }
  } catch (_error) {
    console.warn("   ⚠️  Lighthouse results not found");
  }

  // Collect K6 results
  try {
    const k6Files = await fs.readdir(CONFIG.K6_RESULTS_DIR);
    const k6Results = {};

    for (const file of k6Files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(CONFIG.K6_RESULTS_DIR, file);
        const content = await fs.readFile(filePath, "utf8");
        const testName = file.replace(".json", "").replace("-summary", "");
        k6Results[testName] = JSON.parse(content);
      }
    }

    if (Object.keys(k6Results).length > 0) {
      results.k6 = k6Results;
      console.log(
        `   ✓ K6 results collected (${Object.keys(k6Results).length} tests)`
      );
    }
  } catch (_error) {
    console.warn("   ⚠️  K6 results not found");
  }

  return results;
}

async function processPerformanceMetrics() {
  console.log("⚡ Processing performance metrics...");

  const metrics = {
    coreWebVitals: null,
    apiPerformance: null,
    userJourneys: null,
  };

  // Process Lighthouse Core Web Vitals
  try {
    const lighthouseFiles = await fs.readdir(CONFIG.LIGHTHOUSE_DIR);
    const lhrFiles = lighthouseFiles.filter(
      (file) => file.startsWith("lhr-") && file.endsWith(".json")
    );

    if (lhrFiles.length > 0) {
      const coreWebVitals = [];

      for (const file of lhrFiles) {
        const filePath = path.join(CONFIG.LIGHTHOUSE_DIR, file);
        const content = await fs.readFile(filePath, "utf8");
        const report = JSON.parse(content);

        const webVitals = {
          url: report.finalUrl,
          lcp: report.audits["largest-contentful-paint"]?.numericValue,
          fid: report.audits["max-potential-fid"]?.numericValue,
          cls: report.audits["cumulative-layout-shift"]?.numericValue,
          fcp: report.audits["first-contentful-paint"]?.numericValue,
          performance: report.categories.performance?.score * 100,
          accessibility: report.categories.accessibility?.score * 100,
          seo: report.categories.seo?.score * 100,
        };

        coreWebVitals.push(webVitals);
      }

      metrics.coreWebVitals = coreWebVitals;
      console.log("   ✓ Core Web Vitals processed");
    }
  } catch (_error) {
    console.warn("   ⚠️  Could not process Core Web Vitals");
  }

  // Process K6 API performance metrics
  try {
    const k6Files = await fs.readdir(CONFIG.K6_RESULTS_DIR);
    const apiMetrics = {};

    for (const file of k6Files) {
      if (file.includes("api") && file.endsWith(".json")) {
        const filePath = path.join(CONFIG.K6_RESULTS_DIR, file);
        const content = await fs.readFile(filePath, "utf8");
        const k6Data = JSON.parse(content);

        const testName = file.replace("-summary.json", "");
        apiMetrics[testName] = {
          avgResponseTime: k6Data.metrics?.http_req_duration?.avg,
          p95ResponseTime: k6Data.metrics?.http_req_duration?.p95,
          errorRate: k6Data.metrics?.http_req_failed?.rate,
          requestCount: k6Data.metrics?.http_reqs?.count,
        };
      }
    }

    if (Object.keys(apiMetrics).length > 0) {
      metrics.apiPerformance = apiMetrics;
      console.log("   ✓ API performance metrics processed");
    }
  } catch (_error) {
    console.warn("   ⚠️  Could not process API performance metrics");
  }

  return metrics;
}

async function generateSummaryReport(testResults, performanceMetrics) {
  console.log("📝 Generating summary report...");

  const summary = {
    timestamp: new Date().toISOString(),
    platform: "Nos Ilha Tourism Platform",
    testSuite: "Integration Tests",
    environment: process.env.NODE_ENV || "test",
    ci: !!process.env.CI,

    // Test execution summary
    execution: {
      playwright: testResults.playwright
        ? {
            totalTests:
              testResults.playwright.suites?.reduce(
                (acc, suite) => acc + suite.tests?.length || 0,
                0
              ) || 0,
            passed: 0, // Will be calculated
            failed: 0, // Will be calculated
            duration: testResults.playwright.duration || 0,
          }
        : null,

      lighthouse: testResults.lighthouse
        ? {
            auditsRun: testResults.lighthouse.length,
            avgPerformanceScore: performanceMetrics.coreWebVitals
              ? performanceMetrics.coreWebVitals.reduce(
                  (sum, item) => sum + item.performance,
                  0
                ) / performanceMetrics.coreWebVitals.length
              : null,
          }
        : null,

      k6: testResults.k6
        ? {
            testsRun: Object.keys(testResults.k6).length,
            totalRequests: Object.values(testResults.k6).reduce(
              (sum, test) => sum + (test.metrics?.http_reqs?.count || 0),
              0
            ),
          }
        : null,
    },

    // Performance summary
    performance: {
      coreWebVitals: performanceMetrics.coreWebVitals
        ? {
            avgLCP:
              performanceMetrics.coreWebVitals.reduce(
                (sum, item) => sum + (item.lcp || 0),
                0
              ) / performanceMetrics.coreWebVitals.length,
            avgCLS:
              performanceMetrics.coreWebVitals.reduce(
                (sum, item) => sum + (item.cls || 0),
                0
              ) / performanceMetrics.coreWebVitals.length,
            avgPerformanceScore:
              performanceMetrics.coreWebVitals.reduce(
                (sum, item) => sum + item.performance,
                0
              ) / performanceMetrics.coreWebVitals.length,
          }
        : null,

      apiPerformance: performanceMetrics.apiPerformance
        ? {
            avgResponseTime:
              Object.values(performanceMetrics.apiPerformance).reduce(
                (sum, test) => sum + (test.avgResponseTime || 0),
                0
              ) / Object.keys(performanceMetrics.apiPerformance).length,
            avgErrorRate:
              Object.values(performanceMetrics.apiPerformance).reduce(
                (sum, test) => sum + (test.errorRate || 0),
                0
              ) / Object.keys(performanceMetrics.apiPerformance).length,
          }
        : null,
    },

    // Tourism-specific metrics
    tourismMetrics: {
      mobileOptimization: performanceMetrics.coreWebVitals
        ? performanceMetrics.coreWebVitals.filter(
            (item) => item.performance > 75
          ).length / performanceMetrics.coreWebVitals.length
        : null,

      culturalContentAccess: testResults.k6?.["towns-api-load"]
        ? testResults.k6["towns-api-load"].metrics?.town_api_errors?.rate < 0.01
        : null,

      directoryDiscovery: testResults.k6?.["directory-api-load"]
        ? testResults.k6["directory-api-load"].metrics?.api_errors?.rate < 0.02
        : null,
    },

    // Recommendations
    recommendations: [],
  };

  // Generate recommendations based on results
  if (summary.performance.coreWebVitals?.avgPerformanceScore < 75) {
    summary.recommendations.push(
      "Improve Core Web Vitals for better mobile tourism experience"
    );
  }

  if (summary.performance.apiPerformance?.avgResponseTime > 1000) {
    summary.recommendations.push(
      "Optimize API response times for tourism platform responsiveness"
    );
  }

  if (summary.tourismMetrics.mobileOptimization < 0.8) {
    summary.recommendations.push(
      "Focus on mobile optimization for traveling tourists"
    );
  }

  // Save summary report
  try {
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    const summaryPath = path.join(
      CONFIG.OUTPUT_DIR,
      "integration-test-summary.json"
    );
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log("   ✓ Summary report generated");
  } catch (error) {
    console.warn("   ⚠️  Could not save summary report:", error.message);
  }

  return summary;
}

async function prepareCIIntegration(summary) {
  console.log("🔄 Preparing CI/CD integration data...");

  const ciData = {
    timestamp: summary.timestamp,
    platform: summary.platform,
    success: true, // Will be determined by actual results

    // Key metrics for CI/CD decision making
    metrics: {
      testsTotal: summary.execution.playwright?.totalTests || 0,
      testsPassed: summary.execution.playwright?.passed || 0,
      testsFailed: summary.execution.playwright?.failed || 0,
      performanceScore:
        summary.performance.coreWebVitals?.avgPerformanceScore || 0,
      apiResponseTime: summary.performance.apiPerformance?.avgResponseTime || 0,
      errorRate: summary.performance.apiPerformance?.avgErrorRate || 0,
    },

    // Tourism platform specific CI metrics
    tourismQuality: {
      mobileReadiness: summary.tourismMetrics.mobileOptimization || 0,
      culturalContentReliability:
        summary.tourismMetrics.culturalContentAccess || false,
      directoryFunctionality:
        summary.tourismMetrics.directoryDiscovery || false,
    },

    // Deployment readiness assessment
    deploymentReady: false, // Will be calculated

    // Recommendations for development team
    recommendations: summary.recommendations,

    // Links to detailed reports
    reports: {
      playwrightReport: "playwright-report/index.html",
      lighthouseReport: ".lighthouseci/",
      summaryReport: "test-output/integration-test-summary.json",
    },
  };

  // Determine overall success and deployment readiness
  ciData.success =
    ciData.metrics.testsFailed === 0 &&
    ciData.metrics.performanceScore > 75 &&
    ciData.metrics.errorRate < 0.02;

  ciData.deploymentReady =
    ciData.success &&
    ciData.tourismQuality.mobileReadiness > 0.8 &&
    ciData.tourismQuality.culturalContentReliability &&
    ciData.tourismQuality.directoryFunctionality;

  // Save CI integration data
  try {
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    const ciPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.CI_INTEGRATION_FILE);
    await fs.writeFile(ciPath, JSON.stringify(ciData, null, 2));
    console.log("   ✓ CI/CD integration data prepared");
  } catch (error) {
    console.warn("   ⚠️  Could not save CI integration data:", error.message);
  }

  return ciData;
}

async function organizeArtifacts() {
  console.log("📁 Organizing test artifacts...");

  // Create organized structure
  const organizedDirs = [
    "test-output/screenshots",
    "test-output/videos",
    "test-output/traces",
    "test-output/reports",
    "test-output/performance",
    "test-output/k6-results",
  ];

  for (const dir of organizedDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (_error) {
      // Ignore errors
    }
  }

  // Copy key artifacts to organized structure
  try {
    // Copy Playwright HTML report
    const playwrightReportExists = await fs
      .access(path.join(CONFIG.REPORTS_DIR, "index.html"))
      .then(() => true)
      .catch(() => false);
    if (playwrightReportExists) {
      // Create a symlink or reference instead of copying large files
      const reportInfo = {
        type: "playwright-report",
        location: CONFIG.REPORTS_DIR,
        description: "Playwright HTML test report with detailed test results",
      };
      await fs.writeFile(
        "test-output/reports/playwright-report-info.json",
        JSON.stringify(reportInfo, null, 2)
      );
    }

    // Copy performance metrics
    const performanceFiles = await fs
      .readdir(CONFIG.K6_RESULTS_DIR)
      .catch(() => []);
    for (const file of performanceFiles.filter((f) => f.endsWith(".json"))) {
      try {
        await fs.copyFile(
          path.join(CONFIG.K6_RESULTS_DIR, file),
          path.join("test-output/k6-results", file)
        );
      } catch (_error) {
        // Ignore copy errors
      }
    }

    console.log("   ✓ Test artifacts organized");
  } catch (error) {
    console.warn("   ⚠️  Could not organize all artifacts:", error.message);
  }
}

function displayResults(summary) {
  console.log("\n📊 Integration Test Results Summary");
  console.log("=".repeat(50));

  // Test execution results
  if (summary.execution.playwright) {
    console.log(`\n🎭 Playwright Tests:`);
    console.log(`   Total Tests: ${summary.execution.playwright.totalTests}`);
    console.log(
      `   Duration: ${Math.round(summary.execution.playwright.duration / 1000)}s`
    );
  }

  if (summary.execution.lighthouse) {
    console.log(`\n🔍 Lighthouse Audits:`);
    console.log(`   Audits Run: ${summary.execution.lighthouse.auditsRun}`);
    console.log(
      `   Avg Performance Score: ${Math.round(summary.execution.lighthouse.avgPerformanceScore || 0)}/100`
    );
  }

  if (summary.execution.k6) {
    console.log(`\n⚡ K6 Load Tests:`);
    console.log(`   Tests Run: ${summary.execution.k6.testsRun}`);
    console.log(`   Total Requests: ${summary.execution.k6.totalRequests}`);
  }

  // Performance metrics
  console.log(`\n🚀 Performance Metrics:`);

  if (summary.performance.coreWebVitals) {
    console.log(
      `   Average LCP: ${Math.round(summary.performance.coreWebVitals.avgLCP)}ms`
    );
    console.log(
      `   Average CLS: ${summary.performance.coreWebVitals.avgCLS.toFixed(3)}`
    );
    console.log(
      `   Performance Score: ${Math.round(summary.performance.coreWebVitals.avgPerformanceScore)}/100`
    );
  }

  if (summary.performance.apiPerformance) {
    console.log(
      `   API Response Time: ${Math.round(summary.performance.apiPerformance.avgResponseTime)}ms`
    );
    console.log(
      `   API Error Rate: ${(summary.performance.apiPerformance.avgErrorRate * 100).toFixed(2)}%`
    );
  }

  // Tourism-specific metrics
  console.log(`\n🏝️  Tourism Platform Quality:`);

  if (summary.tourismMetrics.mobileOptimization !== null) {
    console.log(
      `   Mobile Optimization: ${Math.round(summary.tourismMetrics.mobileOptimization * 100)}%`
    );
  }

  console.log(
    `   Cultural Content Access: ${summary.tourismMetrics.culturalContentAccess ? "✅" : "❌"}`
  );
  console.log(
    `   Directory Discovery: ${summary.tourismMetrics.directoryDiscovery ? "✅" : "❌"}`
  );

  // Recommendations
  if (summary.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    summary.recommendations.forEach((rec) => console.log(`   • ${rec}`));
  }

  console.log(`\n📁 Detailed reports available in:`);
  console.log(`   • Playwright: playwright-report/index.html`);
  console.log(`   • Summary: test-output/integration-test-summary.json`);
  console.log(`   • CI Data: test-output/${CONFIG.CI_INTEGRATION_FILE}`);
}

// Run cleanup if called directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
