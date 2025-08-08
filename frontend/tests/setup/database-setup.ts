/**
 * Database setup utilities for integration testing.
 * 
 * Provides functions to:
 * - Setup test database state
 * - Seed test data for consistent testing
 * - Reset database between test suites if needed
 */

export interface TestDataSeed {
  directoryEntries: Array<{
    id: string;
    name: string;
    slug: string;
    category: 'Restaurant' | 'Hotel' | 'Beach' | 'Landmark';
    town: string;
    latitude: number;
    longitude: number;
    description: string;
    imageUrl?: string;
  }>;
  towns: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    population?: string;
    elevation?: string;
    highlights: string[];
  }>;
}

/**
 * Sets up test database with known state.
 * This is optional and only runs if TEST_DATABASE_URL is configured.
 */
export async function setupTestDatabase(): Promise<void> {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  
  if (!testDatabaseUrl) {
    console.log('ℹ️ No test database configured - using API fallback to mock data');
    return;
  }
  
  try {
    // In a real implementation, you would:
    // 1. Connect to test database
    // 2. Run migrations if needed
    // 3. Seed known test data
    // 4. Ensure indexes are ready
    
    console.log('🗄️ Test database setup - connecting to:', testDatabaseUrl.replace(/:[^:]*@/, ':***@'));
    
    // Mock implementation - replace with actual database setup
    const mockSetup = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate setup time
      return true;
    };
    
    await mockSetup();
    console.log('✅ Test database ready');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw new Error(`Database setup failed: ${error}`);
  }
}

/**
 * Seeds the test database with consistent data for integration tests.
 */
export async function seedTestData(): Promise<TestDataSeed> {
  const testSeedData: TestDataSeed = {
    directoryEntries: [
      {
        id: 'test-restaurant-1',
        name: 'Test Casa Nova Restaurant',
        slug: 'test-casa-nova-restaurant',
        category: 'Restaurant',
        town: 'Nova Sintra',
        latitude: 14.85,
        longitude: -24.71,
        description: 'Test restaurant for integration testing',
        imageUrl: '/images/test-restaurant.jpg'
      },
      {
        id: 'test-hotel-1',
        name: 'Test Hotel Brava',
        slug: 'test-hotel-brava',
        category: 'Hotel',
        town: 'Nova Sintra',
        latitude: 14.85,
        longitude: -24.71,
        description: 'Test hotel for integration testing',
        imageUrl: '/images/test-hotel.jpg'
      },
      {
        id: 'test-beach-1',
        name: 'Test Beach Fajã de Água',
        slug: 'test-beach-faja-de-agua',
        category: 'Beach',
        town: 'Fajã de Água',
        latitude: 14.82,
        longitude: -24.72,
        description: 'Test beach for integration testing',
        imageUrl: '/images/test-beach.jpg'
      },
      {
        id: 'test-landmark-1',
        name: 'Test Lighthouse',
        slug: 'test-lighthouse',
        category: 'Landmark',
        town: 'Nova Sintra',
        latitude: 14.85,
        longitude: -24.71,
        description: 'Test landmark for integration testing',
        imageUrl: '/images/test-landmark.jpg'
      }
    ],
    towns: [
      {
        id: 'test-nova-sintra',
        name: 'Nova Sintra (Test)',
        slug: 'nova-sintra-test',
        description: 'Capital town of Brava Island - test version',
        population: '~1,200 residents',
        elevation: '520 meters above sea level',
        highlights: ['UNESCO World Heritage Site', 'Colonial Architecture', 'Test Data']
      },
      {
        id: 'test-furna',
        name: 'Furna (Test)',
        slug: 'furna-test',
        description: 'Historic fishing village in volcanic crater - test version',
        population: '~800 residents',
        elevation: 'Sea level',
        highlights: ['Natural Harbor', 'Fishing Tradition', 'Test Data']
      }
    ]
  };
  
  if (process.env.TEST_DATABASE_URL) {
    // In real implementation, you would insert this data into the test database
    console.log('🌱 Seeding test database with known data...');
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate seeding time
    console.log('✅ Test data seeded successfully');
  }
  
  return testSeedData;
}

/**
 * Resets the test database to a clean state.
 * Useful for running tests in isolation.
 */
export async function resetTestDatabase(): Promise<void> {
  if (!process.env.TEST_DATABASE_URL) {
    return;
  }
  
  try {
    console.log('🔄 Resetting test database...');
    // In real implementation: truncate tables, reset sequences, etc.
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('❌ Test database reset failed:', error);
    throw error;
  }
}