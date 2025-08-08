import fs from 'fs/promises';
import path from 'path';

/**
 * Mock data setup for integration tests.
 * 
 * Ensures that tests can run offline with consistent mock data
 * when backend APIs are not available. This is critical for:
 * - CI/CD environments where backend may not be running
 * - Development environments with intermittent connectivity
 * - Testing fallback behavior of the tourism platform
 */

export interface MockApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface MockPagedResponse<T> {
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

/**
 * Setup mock data for offline testing capability.
 */
export async function seedMockData(): Promise<void> {
  try {
    console.log('🎭 Setting up mock data for offline testing...');
    
    const mockDataDir = path.join(process.cwd(), 'src', 'lib', '__test_mocks__');
    await fs.mkdir(mockDataDir, { recursive: true });
    
    // 1. Directory entries mock data
    const mockDirectoryEntries = generateMockDirectoryEntries();
    await writeMockFile(mockDataDir, 'directory-entries.json', mockDirectoryEntries);
    
    // 2. Towns mock data
    const mockTowns = generateMockTowns();
    await writeMockFile(mockDataDir, 'towns.json', mockTowns);
    
    // 3. API response templates
    const apiResponseTemplates = generateApiResponseTemplates();
    await writeMockFile(mockDataDir, 'api-response-templates.json', apiResponseTemplates);
    
    // 4. Error response examples
    const errorResponses = generateErrorResponseExamples();
    await writeMockFile(mockDataDir, 'error-responses.json', errorResponses);
    
    console.log('✅ Mock data setup complete');
    
  } catch (error) {
    console.error('❌ Mock data setup failed:', error);
    throw error;
  }
}

/**
 * Generate consistent mock directory entries for testing.
 */
function generateMockDirectoryEntries() {
  return [
    {
      id: 'mock-restaurant-casa-nova',
      slug: 'casa-nova-restaurant',
      name: 'Casa Nova Restaurant',
      category: 'Restaurant',
      town: 'Nova Sintra',
      latitude: 14.8514,
      longitude: -24.7151,
      description: 'Authentic Cape Verdean cuisine in the heart of Nova Sintra',
      imageUrl: '/images/restaurants/casa-nova.jpg',
      rating: 4.5,
      reviewCount: 23,
      details: {
        phoneNumber: '+238 285 1234',
        openingHours: 'Mon-Sat: 11:00-22:00, Sun: 17:00-22:00',
        cuisine: ['Cape Verdean', 'Portuguese', 'Seafood']
      },
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-12-01T15:30:00Z'
    },
    {
      id: 'mock-hotel-brava-mar',
      slug: 'hotel-brava-mar',
      name: 'Hotel Brava Mar',
      category: 'Hotel',
      town: 'Nova Sintra',
      latitude: 14.8520,
      longitude: -24.7145,
      description: 'Comfortable accommodation with stunning ocean views',
      imageUrl: '/images/hotels/brava-mar.jpg',
      rating: 4.2,
      reviewCount: 15,
      details: {
        phoneNumber: '+238 285 5678',
        amenities: ['Ocean View', 'Restaurant', 'Wi-Fi', 'Breakfast Included']
      },
      createdAt: '2023-02-01T14:00:00Z',
      updatedAt: '2024-11-15T09:45:00Z'
    },
    {
      id: 'mock-beach-faja-agua',
      slug: 'beach-faja-de-agua',
      name: 'Beach Fajã de Água',
      category: 'Beach',
      town: 'Fajã de Água',
      latitude: 14.8200,
      longitude: -24.7200,
      description: 'Natural swimming pools with crystal clear waters',
      imageUrl: '/images/beaches/faja-agua.jpg',
      rating: 4.8,
      reviewCount: 42,
      details: null,
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2024-10-20T16:20:00Z'
    },
    {
      id: 'mock-landmark-lighthouse',
      slug: 'lighthouse-ponta-oeste',
      name: 'Ponta Oeste Lighthouse',
      category: 'Landmark',
      town: 'Nova Sintra',
      latitude: 14.8600,
      longitude: -24.7300,
      description: 'Historic lighthouse offering panoramic island views',
      imageUrl: '/images/landmarks/lighthouse.jpg',
      rating: 4.3,
      reviewCount: 18,
      details: null,
      createdAt: '2023-03-10T08:00:00Z',
      updatedAt: '2024-09-05T11:15:00Z'
    }
  ];
}

/**
 * Generate mock towns data for testing.
 */
function generateMockTowns() {
  return [
    {
      id: 'mock-nova-sintra',
      name: 'Nova Sintra',
      slug: 'nova-sintra',
      description: 'The charming capital of Brava Island, perched high in the mountains with stunning views and UNESCO World Heritage colonial architecture.',
      population: '~1,200 residents',
      elevation: '520 meters above sea level',
      highlights: ['UNESCO World Heritage Site', 'Colonial Architecture', 'Mountain Views', 'Cultural Center'],
      heroImage: '/images/towns/nova-sintra-panoramic.jpg',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-12-01T12:00:00Z'
    },
    {
      id: 'mock-furna',
      name: 'Furna',
      slug: 'furna',
      description: 'A historic fishing village nestled in a volcanic crater, home to Brava\'s main harbor and maritime traditions.',
      population: '~800 residents',
      elevation: 'Sea level',
      highlights: ['Natural Harbor', 'Fishing Tradition', 'Volcanic Crater', 'Maritime Heritage'],
      heroImage: '/images/towns/furna-harbor.jpg',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-11-20T14:30:00Z'
    },
    {
      id: 'mock-faja-agua',
      name: 'Fajã de Água',
      slug: 'faja-de-agua',
      description: 'A coastal paradise famous for its natural swimming pools and dramatic cliffs meeting the Atlantic Ocean.',
      population: '~300 residents',
      elevation: '50 meters above sea level',
      highlights: ['Natural Swimming Pools', 'Coastal Scenery', 'Rock Formations', 'Peaceful Setting'],
      heroImage: '/images/towns/faja-agua-pools.jpg',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-10-15T10:45:00Z'
    }
  ];
}

/**
 * Generate API response templates for testing.
 */
function generateApiResponseTemplates() {
  return {
    successResponse: {
      success: true,
      message: 'Request completed successfully',
      timestamp: '2024-12-08T15:30:00Z'
    },
    pagedResponse: {
      success: true,
      pagination: {
        page: 0,
        size: 20,
        total: 50,
        totalPages: 3
      },
      timestamp: '2024-12-08T15:30:00Z'
    },
    createdResponse: {
      success: true,
      message: 'Resource created successfully',
      timestamp: '2024-12-08T15:30:00Z'
    }
  };
}

/**
 * Generate error response examples for testing error handling.
 */
function generateErrorResponseExamples() {
  return {
    notFound: {
      success: false,
      error: 'Resource not found',
      message: 'The requested directory entry does not exist',
      timestamp: '2024-12-08T15:30:00Z',
      status: 404
    },
    validation: {
      success: false,
      error: 'Validation failed',
      message: 'The request contains invalid data',
      details: [
        { field: 'name', message: 'Name is required' },
        { field: 'latitude', message: 'Latitude must be between -90 and 90' }
      ],
      timestamp: '2024-12-08T15:30:00Z',
      status: 400
    },
    unauthorized: {
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required to access this resource',
      timestamp: '2024-12-08T15:30:00Z',
      status: 401
    },
    forbidden: {
      success: false,
      error: 'Forbidden',
      message: 'Insufficient permissions to perform this action',
      timestamp: '2024-12-08T15:30:00Z',
      status: 403
    },
    serverError: {
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the request',
      timestamp: '2024-12-08T15:30:00Z',
      status: 500
    }
  };
}

/**
 * Helper function to write mock data files.
 */
async function writeMockFile(dir: string, filename: string, data: any): Promise<void> {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`📄 Created mock data file: ${filename}`);
}