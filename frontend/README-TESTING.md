# Integration Testing Strategy for Nos Ilha Tourism Platform

This document provides comprehensive guidance for running and maintaining the integration testing suite for the Nos Ilha tourism platform, which serves visitors to Brava Island, Cape Verde.

## Overview

The testing strategy is designed specifically for a **tourism platform** with the following priorities:

- **Mobile-first approach**: Most tourists access the platform via mobile devices
- **Network resilience**: Testing under Cape Verde's connectivity conditions
- **Cultural authenticity**: Validating respectful representation of local heritage
- **Critical user journeys**: Tourism discovery, cultural exploration, and trip planning
- **Performance optimization**: Fast loading for image-heavy tourism content

## Test Architecture

```
tests/
├── shared/                 # Cross-platform critical user journeys
│   ├── homepage.spec.ts           # Tourism platform entry point
│   ├── directory-browsing.spec.ts # Core business discovery
│   ├── interactive-map.spec.ts    # Spatial tourism exploration
│   └── towns-exploration.spec.ts  # Cultural heritage discovery
├── mobile/                 # Mobile-specific tourism scenarios
├── desktop/               # Desktop-specific scenarios
├── cross-browser/         # Browser compatibility for global audience
├── api/                   # Backend contract validation
│   ├── directory-api-contracts.spec.ts
│   └── towns-api-contracts.spec.ts
├── performance/           # Core Web Vitals and UX metrics
│   └── core-web-vitals.spec.ts
├── k6/                    # Load testing for tourism traffic
│   ├── directory-api-load.js
│   ├── towns-api-load.js
│   └── integrated-user-journey.js
└── setup/                 # Test environment management
    ├── global-setup.ts
    ├── global-teardown.ts
    ├── pre-test-setup.js
    └── post-test-cleanup.js
```

## Test Categories

### 1. Critical User Journeys (shared/)

**Purpose**: Validate essential tourism flows that work across all devices and browsers.

**Key Tests**:

- **Homepage Discovery**: Hero section, featured highlights, navigation to core features
- **Directory Browsing**: Restaurant/hotel/beach/landmark discovery with filtering
- **Interactive Map**: Mapbox integration, marker interactions, spatial discovery
- **Towns Exploration**: Cultural heritage content, community information

**Run Command**: `npm run test:critical`

### 2. Mobile Tourism Experience (mobile/)

**Purpose**: Ensure optimal experience for traveling tourists using mobile devices.

**Focus Areas**:

- Touch-friendly interactions
- Offline functionality
- Network resilience
- Image optimization for mobile data
- Cross-device synchronization

**Run Command**: `npm run test:mobile`

### 3. API Contract Testing (api/)

**Purpose**: Validate frontend-backend compatibility and data integrity.

**Key Validations**:

- Directory API endpoints (`/api/v1/directory/*`)
- Towns API endpoints (`/api/v1/towns/*`)
- Response format consistency
- Geographic data validation for Brava Island
- Cultural content accuracy

**Run Command**: `npm run test:api`

### 4. Performance & Core Web Vitals (performance/)

**Purpose**: Ensure fast loading for tourism content and optimal mobile performance.

**Metrics**:

- **LCP (Largest Contentful Paint)**: < 2.5s for tourism engagement
- **FID (First Input Delay)**: < 100ms for responsive interactions
- **CLS (Cumulative Layout Shift)**: < 0.25 for stable browsing
- **Mobile performance**: Optimized for 3G networks

**Run Command**: `npm run test:performance`

### 5. Load Testing (k6/)

**Purpose**: Validate performance under realistic tourism traffic patterns.

**Scenarios**:

- **Normal browsing**: 10 concurrent tourists
- **Peak season**: 25 concurrent users (ferry arrivals, events)
- **Map data spikes**: 30 requests/second for marker loading
- **Cultural exploration**: Deep content browsing patterns

**Run Command**: `npm run k6:all`

## Running Tests

### Local Development

```bash
# Full integration test suite
npm run test:ci

# Individual test categories
npm run test:critical          # Essential tourism journeys
npm run test:mobile           # Mobile experience
npm run test:api              # Backend contract validation
npm run test:performance      # Core Web Vitals
npm run k6:directory         # Directory API load testing
npm run lighthouse:audit      # Performance auditing

# Development and debugging
npm run test:e2e:ui          # Interactive test runner
npm run test:e2e:headed      # Run tests with browser visible
npm run test:e2e:debug       # Debug specific test failures
```

### Environment Setup

**Required Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

**Services Required**:

1. **Backend API**: Running on port 8080 with health endpoint
2. **Frontend**: Running on port 3000 (or custom PLAYWRIGHT_BASE_URL)
3. **Database**: PostgreSQL with test data

### CI/CD Integration

**GitHub Actions Workflow**: `.github/workflows/integration-testing.yml`

**Trigger Conditions**:

- **Pull Requests**: Runs critical tests for quick feedback
- **Main branch push**: Full test suite including performance
- **Manual dispatch**: Custom scope selection

**Test Scopes**:

- `critical`: Essential tourism journeys only
- `mobile`: Mobile-focused testing
- `performance`: Core Web Vitals and load testing
- `api-contracts`: Backend compatibility validation
- `full`: Complete test suite

## Tourism-Specific Test Considerations

### Network Conditions

Tests simulate realistic Cape Verde connectivity:

```javascript
// 3G conditions common in Cape Verde
await page.emulateNetworkConditions({
  downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
  uploadThroughput: (750 * 1024) / 8, // 750 Kbps
  latency: 200, // 200ms latency
});
```

### Cultural Content Validation

```javascript
// Verify authentic Cape Verdean cultural references
const culturalTerms = ["morabeza", "morna", "sodade", "heritage"];
expect(pageContent).toMatch(new RegExp(culturalTerms.join("|"), "i"));

// Ensure respectful language
const inappropriateTerms = ["primitive", "backward", "underdeveloped"];
expect(pageContent).not.toMatch(new RegExp(inappropriateTerms.join("|"), "i"));
```

### Geographic Validation

```javascript
// Validate coordinates are within Brava Island bounds
expect(entry.latitude).toBeGreaterThan(14.0);
expect(entry.latitude).toBeLessThan(15.0);
expect(entry.longitude).toBeGreaterThan(-25.0);
expect(entry.longitude).toBeLessThan(-24.0);
```

## Performance Thresholds

### Core Web Vitals (Tourism-Optimized)

| Metric | Good    | Needs Improvement | Poor    | Tourism Priority              |
| ------ | ------- | ----------------- | ------- | ----------------------------- |
| LCP    | < 2.5s  | 2.5s - 4s         | > 4s    | Critical for engagement       |
| FID    | < 100ms | 100ms - 300ms     | > 300ms | Essential for interactions    |
| CLS    | < 0.1   | 0.1 - 0.25        | > 0.25  | Important for mobile browsing |

### API Performance (Load Testing)

| Endpoint         | Response Time            | Error Rate | Throughput |
| ---------------- | ------------------------ | ---------- | ---------- |
| Directory List   | < 2s (95th percentile)   | < 2%       | 30 req/s   |
| Individual Entry | < 1s (95th percentile)   | < 1%       | 50 req/s   |
| Towns List       | < 1.5s (95th percentile) | < 0.5%     | 20 req/s   |
| Map Data         | < 3s (95th percentile)   | < 2%       | 15 req/s   |

## Test Data Management

### Mock Data Strategy

- **Offline Capability**: Tests can run without backend using mock data
- **Cultural Authenticity**: Mock data represents real Brava Island locations
- **Data Consistency**: Synchronized between frontend and backend schemas

**Mock Data Location**: `src/lib/__test_mocks__/`

### Real Data Validation

- **Geographic Bounds**: Ensure all locations are within Brava Island
- **Cultural Content**: Validate appropriate representation
- **Business Information**: Check for complete tourism details

## Maintenance and Updates

### Adding New Tests

1. **Identify User Journey**: What tourism scenario are you testing?
2. **Choose Test Category**: Critical, mobile, API, performance, or load testing
3. **Follow Naming Convention**: `{feature}-{scenario}.spec.ts`
4. **Include Failure Scenarios**: Test error handling and offline capability
5. **Add Cultural Validation**: Ensure respectful content representation

### Updating Thresholds

Performance thresholds should be adjusted based on:

- **Real User Monitoring**: Actual tourist behavior data
- **Network Conditions**: Changes in Cape Verde connectivity
- **Content Growth**: As platform adds more cultural content
- **Mobile Trends**: Evolving mobile device capabilities

### Test Environment Updates

- **Browser Updates**: Keep Playwright browsers current for compatibility
- **API Changes**: Update contract tests when backend schemas change
- **New Features**: Add tests for new tourism functionality
- **Performance Regressions**: Investigate and fix threshold failures

## Troubleshooting

### Common Issues

**Test Timeouts**:

- Check network conditions in test configuration
- Verify services are running and healthy
- Increase timeouts for complex tourism scenarios

**Mock Data Failures**:

- Regenerate mock data from current API responses
- Update mock data schemas to match backend changes
- Verify cultural content appropriateness

**Performance Test Failures**:

- Check for content bloat or unoptimized assets
- Verify network simulation accuracy
- Review mobile device performance

**CI/CD Failures**:

- Validate all required secrets are configured
- Check service startup order and dependencies
- Review artifact storage and cleanup processes

## Reporting and Analytics

### Test Reports

- **Playwright HTML Report**: Detailed test execution results
- **Lighthouse CI**: Performance and accessibility metrics
- **K6 Summary**: Load testing and API performance data
- **Integration Summary**: Combined tourism platform quality metrics

### Key Metrics to Monitor

1. **Tourism Journey Success Rate**: Percentage of complete user flows
2. **Mobile Performance**: Core Web Vitals on mobile devices
3. **Cultural Content Quality**: Validation of heritage representation
4. **API Reliability**: Uptime and response consistency for tourism data
5. **Cross-Browser Compatibility**: Support for global diaspora access

---

For more information about specific test implementations or troubleshooting, refer to the individual test files or contact the development team.
