#!/usr/bin/env node

/**
 * Pre-test setup script for Nos Ilha integration testing.
 * 
 * Ensures the testing environment is properly configured before
 * running integration tests for the tourism platform.
 * 
 * Tasks:
 * - Environment validation
 * - Test data preparation
 * - Service health checks
 * - Cleanup of previous test artifacts
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  FRONTEND_URL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  TEST_TIMEOUT: 30000,
  REQUIRED_DIRS: [
    'test-results',
    'playwright-report',
    '.lighthouseci',
    'coverage',
    'results'
  ],
  REQUIRED_ENV_VARS: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN'
  ]
};

async function main() {
  console.log('🚀 Starting Nos Ilha Integration Test Setup...\n');
  
  try {
    // Step 1: Environment validation
    await validateEnvironment();
    
    // Step 2: Directory preparation
    await prepareDirectories();
    
    // Step 3: Service health checks
    await performHealthChecks();
    
    // Step 4: Test data validation
    await validateTestData();
    
    // Step 5: Previous test cleanup
    await cleanupPreviousTests();
    
    console.log('✅ Test setup completed successfully!\n');
    console.log('🎯 Ready to run integration tests for tourism platform');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    process.exit(1);
  }
}

async function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (majorVersion < 18) {
    throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
  }
  
  console.log(`   ✓ Node.js version: ${nodeVersion}`);
  
  // Check required environment variables
  const missingVars = [];
  
  for (const envVar of CONFIG.REQUIRED_ENV_VARS) {
    if (!process.env[envVar] || process.env[envVar].startsWith('your_')) {
      missingVars.push(envVar);
    } else {
      console.log(`   ✓ ${envVar} is configured`);
    }
  }
  
  if (missingVars.length > 0) {
    console.warn(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('      Some tests may use mock data fallbacks');
  }
  
  // Check if we're in CI environment
  if (process.env.CI) {
    console.log('   ✓ Running in CI environment');
  } else {
    console.log('   ✓ Running in local development environment');
  }
}

async function prepareDirectories() {
  console.log('📁 Preparing test directories...');
  
  for (const dir of CONFIG.REQUIRED_DIRS) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`   ✓ Directory ready: ${dir}`);
    } catch (error) {
      console.warn(`   ⚠️  Could not create directory ${dir}:`, error.message);
    }
  }
  
  // Create test results structure
  const testDirs = [
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/performance',
    'results/k6'
  ];
  
  for (const dir of testDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignore errors for nested directories
    }
  }
}

async function performHealthChecks() {
  console.log('🏥 Performing service health checks...');
  
  // Check API health
  try {
    const apiHealthy = await checkService(CONFIG.API_URL + '/actuator/health', 'Backend API');
    
    if (apiHealthy) {
      console.log('   ✓ Backend API is healthy');
      
      // Test critical endpoints
      const criticalEndpoints = [
        '/api/v1/directory/entries',
        '/api/v1/towns/all'
      ];
      
      for (const endpoint of criticalEndpoints) {
        const endpointHealthy = await checkService(CONFIG.API_URL + endpoint, `API ${endpoint}`);
        if (endpointHealthy) {
          console.log(`   ✓ ${endpoint} is accessible`);
        } else {
          console.warn(`   ⚠️  ${endpoint} may not be available`);
        }
      }
    } else {
      console.warn('   ⚠️  Backend API not accessible - tests will use mock data');
    }
  } catch (error) {
    console.warn('   ⚠️  Backend API check failed - tests will use mock data');
  }
  
  // Check frontend if not in API-only mode
  if (!process.env.API_ONLY_TESTS) {
    try {
      const frontendHealthy = await checkService(CONFIG.FRONTEND_URL, 'Frontend');
      
      if (frontendHealthy) {
        console.log('   ✓ Frontend is accessible');
      } else {
        console.warn('   ⚠️  Frontend not accessible - running API-only tests');
        process.env.API_ONLY_TESTS = 'true';
      }
    } catch (error) {
      console.warn('   ⚠️  Frontend check failed - running API-only tests');
      process.env.API_ONLY_TESTS = 'true';
    }
  }
}

async function checkService(url, serviceName) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  );
  
  try {
    // Use node's built-in fetch or http module
    let response;
    
    if (typeof fetch !== 'undefined') {
      response = await Promise.race([fetch(url), timeout]);
    } else {
      // Fallback for older Node.js versions
      const http = require('http');
      const https = require('https');
      
      const client = url.startsWith('https:') ? https : http;
      
      response = await Promise.race([
        new Promise((resolve, reject) => {
          const req = client.get(url, (res) => {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
          });
          req.on('error', reject);
          req.setTimeout(5000, () => reject(new Error('Timeout')));
        }),
        timeout
      ]);
    }
    
    return response.ok || (response.status >= 200 && response.status < 400);
  } catch (error) {
    return false;
  }
}

async function validateTestData() {
  console.log('🗄️  Validating test data availability...');
  
  // Check if mock data is available
  const mockDataPath = path.join('src', 'lib', '__test_mocks__');
  
  try {
    const mockDataExists = await fs.access(mockDataPath).then(() => true).catch(() => false);
    
    if (mockDataExists) {
      console.log('   ✓ Mock data directory exists');
      
      // Check for critical mock files
      const mockFiles = [
        'directory-entries.json',
        'towns.json',
        'api-response-templates.json'
      ];
      
      for (const file of mockFiles) {
        try {
          await fs.access(path.join(mockDataPath, file));
          console.log(`   ✓ Mock data file: ${file}`);
        } catch (error) {
          console.warn(`   ⚠️  Mock data file missing: ${file}`);
        }
      }
    } else {
      console.log('   ⚠️  Mock data directory not found - will be created during tests');
    }
  } catch (error) {
    console.warn('   ⚠️  Could not validate test data:', error.message);
  }
}

async function cleanupPreviousTests() {
  console.log('🧹 Cleaning up previous test artifacts...');
  
  const cleanupPaths = [
    'test-results/results.json',
    'test-results/junit.xml',
    'playwright-report/index.html',
    '.lighthouseci/lhr-*.json',
    'results/*.json'
  ];
  
  let cleanedCount = 0;
  
  for (const pattern of cleanupPaths) {
    try {
      if (pattern.includes('*')) {
        // Handle glob patterns (simplified)
        const dir = path.dirname(pattern);
        const filename = path.basename(pattern);
        
        try {
          const files = await fs.readdir(dir);
          const matchingFiles = files.filter(file => {
            const regex = new RegExp(filename.replace('*', '.*'));
            return regex.test(file);
          });
          
          for (const file of matchingFiles) {
            await fs.unlink(path.join(dir, file));
            cleanedCount++;
          }
        } catch (error) {
          // Directory might not exist, which is fine
        }
      } else {
        await fs.unlink(pattern);
        cleanedCount++;
      }
    } catch (error) {
      // File might not exist, which is fine
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`   ✓ Cleaned up ${cleanedCount} previous test artifacts`);
  } else {
    console.log('   ✓ No previous artifacts to clean up');
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };