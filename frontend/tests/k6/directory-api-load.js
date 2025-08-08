import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * K6 Load Testing for Nos Ilha Directory API
 * 
 * Tests the directory API under realistic tourism traffic loads.
 * Simulates scenarios where tourists are simultaneously browsing
 * restaurants, hotels, beaches, and landmarks on Brava Island.
 * 
 * Key scenarios:
 * - Peak tourism season traffic
 * - Mobile users with varying connection speeds
 * - Concurrent category filtering and individual entry lookups
 * - Map data loading for multiple markers
 * 
 * Run with: k6 run directory-api-load.js
 */

// Custom metrics for tourism-specific monitoring
const apiErrorRate = new Rate('api_errors');
const slowResponseRate = new Rate('slow_responses');

// Configuration based on tourism usage patterns
export const options = {
  scenarios: {
    // Scenario 1: Normal tourism browsing
    normal_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 }, // Ramp up to 10 tourists
        { duration: '5m', target: 10 }, // Stay at 10 tourists
        { duration: '2m', target: 0 },  // Ramp down
      ],
    },
    
    // Scenario 2: Peak season load (ferry arrival, events)
    peak_season: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },  // Quick ramp up
        { duration: '3m', target: 25 }, // Peak load - 25 concurrent tourists
        { duration: '2m', target: 25 }, // Sustained peak
        { duration: '2m', target: 0 },  // Ramp down
      ],
      startTime: '10m', // Start after normal browsing
    },
    
    // Scenario 3: Map data loading spike
    map_data_spike: {
      executor: 'constant-arrival-rate',
      rate: 30, // 30 requests per second
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 15,
      startTime: '15m',
    },
  },
  
  // Performance thresholds for tourism platform
  thresholds: {
    // 95% of requests should complete within 2 seconds (mobile tourists)
    http_req_duration: ['p(95)<2000'],
    
    // 99% of requests should complete within 5 seconds (slow connections)
    'http_req_duration{type:individual}': ['p(99)<5000'],
    
    // API should maintain 99% success rate
    http_req_failed: ['rate<0.01'],
    
    // Tourism-specific error monitoring
    api_errors: ['rate<0.02'],
    slow_responses: ['rate<0.10'], // Less than 10% slow responses
    
    // Scenario-specific thresholds
    'http_req_duration{scenario:peak_season}': ['p(95)<3000'], // Slightly higher during peak
  },
};

const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080';

// Tourism data for realistic test scenarios
const CATEGORIES = ['Restaurant', 'Hotel', 'Beach', 'Landmark'];
const TOWNS = ['Nova Sintra', 'Furna', 'Fajã de Água'];

// Simulate different user types and their behavior patterns
const USER_TYPES = {
  casual_tourist: { weight: 60, browse_depth: 3, rest_time: 2 },
  detailed_researcher: { weight: 25, browse_depth: 8, rest_time: 1 },
  quick_lookup: { weight: 15, browse_depth: 1, rest_time: 0.5 },
};

export function setup() {
  console.log('🏝️  Setting up Nos Ilha Directory API Load Test...');
  
  // Verify API is accessible
  const healthCheck = http.get(`${API_BASE_URL}/actuator/health`);
  
  if (healthCheck.status !== 200) {
    throw new Error(`API health check failed: ${healthCheck.status}`);
  }
  
  console.log('✅ API is healthy - starting load test');
  
  // Get sample data for realistic testing
  const entriesResponse = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=50`);
  
  if (entriesResponse.status === 200) {
    const data = JSON.parse(entriesResponse.body);
    const sampleSlugs = data.data ? data.data.slice(0, 10).map(entry => entry.slug) : [];
    console.log(`📋 Retrieved ${sampleSlugs.length} sample entry slugs for testing`);
    return { sampleSlugs };
  }
  
  return { sampleSlugs: [] };
}

export default function(data) {
  // Select user type based on weights
  const userType = selectUserType();
  const config = USER_TYPES[userType];
  
  // Tag requests for scenario analysis
  const params = {
    tags: { 
      user_type: userType,
      scenario: __ENV.scenario || 'default'
    },
  };
  
  // Simulate realistic tourism browsing session
  performTourismBrowsingSession(data, config, params);
}

function selectUserType() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [type, config] of Object.entries(USER_TYPES)) {
    cumulative += config.weight;
    if (random <= cumulative) {
      return type;
    }
  }
  
  return 'casual_tourist'; // fallback
}

function performTourismBrowsingSession(data, config, params) {
  // 1. Directory browsing (main tourism activity)
  browseDirectoryEntries(config, params);
  
  // 2. Category filtering (tourists looking for specific types)
  if (config.browse_depth > 2) {
    filterByCategory(params);
  }
  
  // 3. Individual entry lookup (detailed information)
  if (data.sampleSlugs && data.sampleSlugs.length > 0 && config.browse_depth > 1) {
    viewIndividualEntry(data.sampleSlugs, params);
  }
  
  // 4. Map data loading (spatial discovery)
  if (Math.random() < 0.4) { // 40% of users check map
    loadMapData(params);
  }
  
  // Simulate user reading time
  sleep(config.rest_time);
}

function browseDirectoryEntries(config, params) {
  const pageSize = Math.random() < 0.7 ? 20 : 10; // Most users use default page size
  const maxPages = Math.min(config.browse_depth, 3);
  
  for (let page = 0; page < maxPages; page++) {
    const url = `${API_BASE_URL}/api/v1/directory/entries?page=${page}&size=${pageSize}`;
    
    const response = http.get(url, params);
    
    const success = check(response, {
      'directory entries loaded': (r) => r.status === 200,
      'response has data': (r) => {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.data);
      },
      'response time acceptable': (r) => r.timings.duration < 2000,
    });
    
    // Track tourism-specific metrics
    if (!success) {
      apiErrorRate.add(1);
    }
    
    if (response.timings.duration > 1500) {
      slowResponseRate.add(1, { type: 'directory_list' });
    }
    
    // Simulate user scanning results
    sleep(0.5 + Math.random() * 1);
    
    // Break if no more results
    if (response.status === 200) {
      const body = JSON.parse(response.body);
      if (!body.data || body.data.length === 0) break;
    }
  }
}

function filterByCategory(params) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const url = `${API_BASE_URL}/api/v1/directory/entries?category=${category}&size=20`;
  
  const taggedParams = { ...params };
  taggedParams.tags = { ...params.tags, type: 'category_filter', category };
  
  const response = http.get(url, taggedParams);
  
  const success = check(response, {
    'category filter works': (r) => r.status === 200,
    'category results valid': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
    'category filter fast': (r) => r.timings.duration < 1500,
  });
  
  if (!success) {
    apiErrorRate.add(1);
  }
  
  if (response.timings.duration > 1000) {
    slowResponseRate.add(1, { type: 'category_filter' });
  }
  
  sleep(0.3);
}

function viewIndividualEntry(sampleSlugs, params) {
  const slug = sampleSlugs[Math.floor(Math.random() * sampleSlugs.length)];
  const url = `${API_BASE_URL}/api/v1/directory/slug/${slug}`;
  
  const taggedParams = { ...params };
  taggedParams.tags = { ...params.tags, type: 'individual' };
  
  const response = http.get(url, taggedParams);
  
  const success = check(response, {
    'individual entry loaded': (r) => r.status === 200,
    'entry details complete': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.name && body.data.description;
    },
    'individual entry fast': (r) => r.timings.duration < 1000,
  });
  
  if (!success) {
    apiErrorRate.add(1);
  }
  
  if (response.timings.duration > 800) {
    slowResponseRate.add(1, { type: 'individual' });
  }
  
  // Simulate user reading detailed information
  sleep(1 + Math.random() * 2);
}

function loadMapData(params) {
  // Simulate map requesting more entries for markers
  const url = `${API_BASE_URL}/api/v1/directory/entries?size=100`;
  
  const taggedParams = { ...params };
  taggedParams.tags = { ...params.tags, type: 'map_data' };
  
  const response = http.get(url, taggedParams);
  
  const success = check(response, {
    'map data loaded': (r) => r.status === 200,
    'map data complete': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.length > 0;
    },
    'map data reasonable size': (r) => r.body.length < 1024 * 1024, // Less than 1MB
  });
  
  if (!success) {
    apiErrorRate.add(1);
  }
  
  if (response.timings.duration > 2000) {
    slowResponseRate.add(1, { type: 'map_data' });
  }
  
  sleep(0.2);
}

export function teardown(data) {
  console.log('🏁 Nos Ilha Directory API Load Test Complete');
  console.log('📊 Check the test results for performance insights:');
  console.log('   - Response times should be under 2s for 95% of requests');
  console.log('   - API error rate should be under 2%');
  console.log('   - Slow response rate should be under 10%');
}

// Helper function for debugging
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/directory-api-load-summary.json': JSON.stringify(data),
  };
}