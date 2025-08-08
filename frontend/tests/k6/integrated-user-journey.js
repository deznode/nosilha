import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

/**
 * K6 Integrated User Journey Testing for Nos Ilha Tourism Platform
 * 
 * Simulates complete tourism user journeys that span multiple APIs
 * and represent realistic visitor behavior patterns on Brava Island.
 * 
 * Key integrated flows:
 * - Tourism discovery: Homepage → Directory → Map → Individual entries
 * - Cultural exploration: Towns → Directory filtering → Detailed research
 * - Mobile tourist: Quick lookups → Map interactions → Decision making
 * - Planning visitor: Comprehensive research across all platform features
 * 
 * Run with: k6 run integrated-user-journey.js
 */

// Custom metrics for integrated journey tracking
const journeyCompletionRate = new Rate('journey_completion_rate');
const journeyErrorRate = new Rate('journey_error_rate');
const userSatisfactionTime = new Trend('user_satisfaction_time');
const apiConsistencyErrors = new Counter('api_consistency_errors');

export const options = {
  scenarios: {
    // Tourism discovery journey (most common)
    tourism_discovery: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 8 },  // Gradual discovery
        { duration: '5m', target: 15 }, // Peak exploration
        { duration: '3m', target: 8 },  // Sustained browsing
        { duration: '2m', target: 0 },  // Completion
      ],
      exec: 'tourismDiscoveryJourney',
    },
    
    // Cultural heritage exploration
    cultural_exploration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 3 },
        { duration: '6m', target: 8 }, // Deep cultural exploration
        { duration: '3m', target: 3 },
        { duration: '2m', target: 0 },
      ],
      startTime: '3m',
      exec: 'culturalExplorationJourney',
    },
    
    // Mobile quick access patterns
    mobile_quick_access: {
      executor: 'constant-arrival-rate',
      rate: 12, // 12 quick sessions per second
      timeUnit: '1s',
      duration: '4m',
      preAllocatedVUs: 10,
      startTime: '8m',
      exec: 'mobileQuickAccessJourney',
    },
    
    // Comprehensive planning journey
    planning_research: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '8m', target: 5 }, // Extended research
        { duration: '30s', target: 0 },
      ],
      startTime: '12m',
      exec: 'planningResearchJourney',
    },
  },
  
  // Integrated journey thresholds
  thresholds: {
    // Overall journey performance
    'http_req_duration{journey:tourism_discovery}': ['p(95)<3000'],
    'http_req_duration{journey:cultural_exploration}': ['p(95)<2500'],
    'http_req_duration{journey:mobile_quick_access}': ['p(95)<2000'],
    'http_req_duration{journey:planning_research}': ['p(95)<4000'],
    
    // Journey success rates
    journey_completion_rate: ['rate>0.90'], // 90% of journeys should complete successfully
    journey_error_rate: ['rate<0.05'], // Less than 5% journey errors
    
    // User experience metrics
    user_satisfaction_time: ['p(90)<30000'], // 90% of journeys under 30 seconds
    api_consistency_errors: ['count<10'], // Minimal consistency issues
    
    // Overall system health during integrated load
    http_req_failed: ['rate<0.02'],
  },
};

const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080';
const FRONTEND_BASE_URL = __ENV.FRONTEND_BASE_URL || 'http://localhost:3000';

// Journey tracking
let journeyStartTime;
let journeySteps;
let journeyErrors;

export function setup() {
  console.log('🗺️  Setting up Integrated Tourism Journey Tests...');
  
  // Verify both API and frontend are accessible
  const apiHealth = http.get(`${API_BASE_URL}/actuator/health`);
  const frontendHealth = http.get(`${FRONTEND_BASE_URL}/`);
  
  if (apiHealth.status !== 200) {
    throw new Error(`API not accessible: ${apiHealth.status}`);
  }
  
  if (frontendHealth.status !== 200) {
    console.warn(`Frontend not accessible: ${frontendHealth.status} - API-only testing`);
  }
  
  // Gather test data
  const setupData = {
    apiAvailable: apiHealth.status === 200,
    frontendAvailable: frontendHealth.status === 200,
    sampleData: {},
  };
  
  // Get sample data for realistic journeys
  try {
    const entriesResponse = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=20`);
    if (entriesResponse.status === 200) {
      const entriesData = JSON.parse(entriesResponse.body);
      setupData.sampleData.entries = entriesData.data || [];
    }
    
    const townsResponse = http.get(`${API_BASE_URL}/api/v1/towns/all`);
    if (townsResponse.status === 200) {
      const townsData = JSON.parse(townsResponse.body);
      setupData.sampleData.towns = townsData.data || [];
    }
  } catch (error) {
    console.warn('Could not retrieve sample data:', error);
  }
  
  console.log('✅ Integrated journey test setup complete');
  return setupData;
}

// Tourism Discovery Journey (Homepage → Directory → Map → Entry Details)
export function tourismDiscoveryJourney(data) {
  startJourney('tourism_discovery');
  
  try {
    // Step 1: Homepage discovery
    const homepageStep = performHomepageDiscovery();
    recordJourneyStep('homepage', homepageStep);
    
    if (!homepageStep.success) {
      throw new Error('Homepage discovery failed');
    }
    
    // Step 2: Directory browsing
    const directoryStep = performDirectoryBrowsing();
    recordJourneyStep('directory', directoryStep);
    
    // Step 3: Category exploration
    if (directoryStep.success) {
      const categoryStep = performCategoryExploration();
      recordJourneyStep('category', categoryStep);
    }
    
    // Step 4: Individual entry investigation
    if (data.sampleData.entries && data.sampleData.entries.length > 0) {
      const entryStep = performEntryInvestigation(data.sampleData.entries);
      recordJourneyStep('entry_detail', entryStep);
    }
    
    // Step 5: Map exploration
    const mapStep = performMapExploration();
    recordJourneyStep('map', mapStep);
    
    completeJourney('tourism_discovery', true);
    
  } catch (error) {
    completeJourney('tourism_discovery', false, error.message);
  }
}

// Cultural Heritage Exploration Journey (Towns → Cultural Content → Related Entries)
export function culturalExplorationJourney(data) {
  startJourney('cultural_exploration');
  
  try {
    // Step 1: Cultural overview via towns
    const townsStep = performTownsExploration();
    recordJourneyStep('towns_overview', townsStep);
    
    if (!townsStep.success) {
      throw new Error('Towns exploration failed');
    }
    
    // Step 2: Detailed cultural investigation
    if (data.sampleData.towns && data.sampleData.towns.length > 0) {
      const culturalStep = performCulturalInvestigation(data.sampleData.towns);
      recordJourneyStep('cultural_detail', culturalStep);
    }
    
    // Step 3: Connect to directory entries in cultural context
    const contextualStep = performContextualDirectoryExploration();
    recordJourneyStep('contextual_directory', contextualStep);
    
    completeJourney('cultural_exploration', true);
    
  } catch (error) {
    completeJourney('cultural_exploration', false, error.message);
  }
}

// Mobile Quick Access Journey (Optimized for on-the-go tourists)
export function mobileQuickAccessJourney(data) {
  startJourney('mobile_quick_access');
  
  try {
    // Quick directory lookup (most common mobile pattern)
    const quickStep = performQuickDirectoryLookup();
    recordJourneyStep('quick_lookup', quickStep);
    
    if (quickStep.success && data.sampleData.entries && data.sampleData.entries.length > 0) {
      // Fast entry detail check
      const detailStep = performFastEntryDetail(data.sampleData.entries);
      recordJourneyStep('fast_detail', detailStep);
    }
    
    completeJourney('mobile_quick_access', true);
    
  } catch (error) {
    completeJourney('mobile_quick_access', false, error.message);
  }
}

// Planning Research Journey (Comprehensive information gathering)
export function planningResearchJourney(data) {
  startJourney('planning_research');
  
  try {
    // Comprehensive data gathering
    const steps = [
      { name: 'towns_research', fn: () => performTownsExploration() },
      { name: 'directory_analysis', fn: () => performDirectoryBrowsing() },
      { name: 'category_research', fn: () => performCategoryExploration() },
      { name: 'detailed_entries', fn: () => data.sampleData.entries ? performMultipleEntryAnalysis(data.sampleData.entries) : { success: true } },
      { name: 'map_planning', fn: () => performMapExploration() },
    ];
    
    for (const step of steps) {
      const result = step.fn();
      recordJourneyStep(step.name, result);
      
      if (!result.success) {
        throw new Error(`${step.name} failed in planning journey`);
      }
      
      // Planning involves more thoughtful time between steps
      sleep(1 + Math.random() * 2);
    }
    
    completeJourney('planning_research', true);
    
  } catch (error) {
    completeJourney('planning_research', false, error.message);
  }
}

// Individual journey step implementations
function performHomepageDiscovery() {
  const params = { tags: { step: 'homepage', journey: 'tourism_discovery' } };
  
  if (__ENV.FRONTEND_AVAILABLE !== 'false') {
    const response = http.get(`${FRONTEND_BASE_URL}/`, params);
    
    return {
      success: check(response, {
        'homepage loads': (r) => r.status === 200,
        'homepage has content': (r) => r.body.includes('Discover') || r.body.includes('Brava'),
      }),
      duration: response.timings.duration,
      response: response
    };
  } else {
    // API-only fallback
    const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=4`, params);
    
    return {
      success: response.status === 200,
      duration: response.timings.duration,
      response: response
    };
  }
}

function performDirectoryBrowsing() {
  const params = { tags: { step: 'directory', journey: 'multiple' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=20`, params);
  
  const success = check(response, {
    'directory loads': (r) => r.status === 200,
    'directory has entries': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.length > 0;
    },
    'directory response time': (r) => r.timings.duration < 2000,
  });
  
  sleep(0.5 + Math.random());
  
  return { success, duration: response.timings.duration, response };
}

function performCategoryExploration() {
  const categories = ['Restaurant', 'Hotel', 'Beach', 'Landmark'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const params = { tags: { step: 'category', journey: 'multiple', category } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?category=${category}`, params);
  
  const success = check(response, {
    'category filter works': (r) => r.status === 200,
    'category has results': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data;
    },
  });
  
  sleep(0.3);
  
  return { success, duration: response.timings.duration, response, category };
}

function performEntryInvestigation(entries) {
  const entry = entries[Math.floor(Math.random() * entries.length)];
  
  const params = { tags: { step: 'entry_detail', journey: 'multiple' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/slug/${entry.slug}`, params);
  
  const success = check(response, {
    'entry detail loads': (r) => r.status === 200,
    'entry has complete info': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.description;
    },
  });
  
  // Simulate reading time
  sleep(1 + Math.random() * 2);
  
  return { success, duration: response.timings.duration, response, entrySlug: entry.slug };
}

function performMapExploration() {
  const params = { tags: { step: 'map', journey: 'multiple' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=100`, params);
  
  const success = check(response, {
    'map data loads': (r) => r.status === 200,
    'map data complete': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.length > 0;
    },
    'map data size reasonable': (r) => r.body.length < 2 * 1024 * 1024, // 2MB limit
  });
  
  sleep(0.5);
  
  return { success, duration: response.timings.duration, response };
}

function performTownsExploration() {
  const params = { tags: { step: 'towns', journey: 'cultural' } };
  const response = http.get(`${API_BASE_URL}/api/v1/towns/all`, params);
  
  const success = check(response, {
    'towns load': (r) => r.status === 200,
    'towns have cultural content': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data[0] && body.data[0].description;
    },
  });
  
  sleep(0.5);
  
  return { success, duration: response.timings.duration, response };
}

function performCulturalInvestigation(towns) {
  const town = towns[Math.floor(Math.random() * towns.length)];
  
  const params = { tags: { step: 'cultural_detail', journey: 'cultural' } };
  const response = http.get(`${API_BASE_URL}/api/v1/towns/slug/${town.slug}`, params);
  
  const success = check(response, {
    'cultural detail loads': (r) => r.status === 200 || r.status === 404, // 404 acceptable for some towns
    'cultural content authentic': (r) => {
      if (r.status !== 200) return true; // Skip validation for 404s
      const body = JSON.parse(r.body);
      const content = `${body.data.description} ${body.data.highlights?.join(' ') || ''}`.toLowerCase();
      return content.length > 50; // Substantial cultural content
    },
  });
  
  // Cultural exploration takes time
  sleep(1.5 + Math.random() * 2);
  
  return { success, duration: response.timings.duration, response, townSlug: town.slug };
}

function performContextualDirectoryExploration() {
  // Simulate finding directory entries in cultural context
  const params = { tags: { step: 'contextual', journey: 'cultural' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=10`, params);
  
  const success = response.status === 200;
  sleep(0.3);
  
  return { success, duration: response.timings.duration, response };
}

function performQuickDirectoryLookup() {
  const params = { tags: { step: 'quick_lookup', journey: 'mobile' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/entries?size=10`, params);
  
  const success = check(response, {
    'quick lookup fast': (r) => r.timings.duration < 1500,
    'quick lookup works': (r) => r.status === 200,
  });
  
  sleep(0.2); // Minimal delay for mobile
  
  return { success, duration: response.timings.duration, response };
}

function performFastEntryDetail(entries) {
  const entry = entries[Math.floor(Math.random() * entries.length)];
  
  const params = { tags: { step: 'fast_detail', journey: 'mobile' } };
  const response = http.get(`${API_BASE_URL}/api/v1/directory/slug/${entry.slug}`, params);
  
  const success = check(response, {
    'fast detail loads': (r) => r.status === 200,
    'fast detail quick': (r) => r.timings.duration < 1000,
  });
  
  sleep(0.5); // Quick mobile interaction
  
  return { success, duration: response.timings.duration, response };
}

function performMultipleEntryAnalysis(entries) {
  const entriesToAnalyze = entries.slice(0, Math.min(5, entries.length));
  let allSuccess = true;
  let totalDuration = 0;
  
  for (const entry of entriesToAnalyze) {
    const params = { tags: { step: 'multiple_analysis', journey: 'planning' } };
    const response = http.get(`${API_BASE_URL}/api/v1/directory/slug/${entry.slug}`, params);
    
    const success = response.status === 200;
    if (!success) allSuccess = false;
    
    totalDuration += response.timings.duration;
    
    sleep(0.5); // Planning research pause
  }
  
  return { success: allSuccess, duration: totalDuration, count: entriesToAnalyze.length };
}

// Journey tracking helpers
function startJourney(journeyType) {
  journeyStartTime = Date.now();
  journeySteps = [];
  journeyErrors = [];
  
  console.log(`🚀 Starting ${journeyType} journey`);
}

function recordJourneyStep(stepName, stepResult) {
  journeySteps.push({
    name: stepName,
    success: stepResult.success,
    duration: stepResult.duration,
    timestamp: Date.now()
  });
  
  if (!stepResult.success) {
    journeyErrors.push(`${stepName}: failed`);
  }
}

function completeJourney(journeyType, success, errorMessage) {
  const journeyDuration = Date.now() - journeyStartTime;
  const successfulSteps = journeySteps.filter(step => step.success).length;
  const completionRate = successfulSteps / journeySteps.length;
  
  // Record metrics
  journeyCompletionRate.add(success);
  userSatisfactionTime.add(journeyDuration);
  
  if (!success || journeyErrors.length > 0) {
    journeyErrorRate.add(1);
    
    if (errorMessage) {
      console.log(`❌ ${journeyType} journey failed: ${errorMessage}`);
    }
  } else {
    journeyErrorRate.add(0);
  }
  
  console.log(`✅ ${journeyType} journey completed: ${completionRate * 100}% success in ${journeyDuration}ms`);
  
  // Brief rest between journeys
  sleep(0.5);
}

export function teardown(data) {
  console.log('🏁 Integrated Tourism Journey Tests Complete');
  console.log('📊 Journey Performance Summary:');
  console.log('   - Tourism Discovery: Homepage → Directory → Map → Details');
  console.log('   - Cultural Exploration: Towns → Cultural Content → Related Entries');
  console.log('   - Mobile Quick Access: Optimized for on-the-go tourists');
  console.log('   - Planning Research: Comprehensive information gathering');
  console.log('');
  console.log('🎯 Success Metrics:');
  console.log('   - >90% journey completion rate');
  console.log('   - <5% journey error rate');
  console.log('   - 90% of journeys under 30 seconds');
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/integrated-journey-summary.json': JSON.stringify(data),
  };
}