# Integration Agent Knowledge Base

## Domain Expertise: Full-Stack Type Safety + API Contracts + Cross-System Integration

### Architecture Overview
```
Frontend TypeScript Interfaces
    ↓
API Client with Type Safety
    ↓
Backend API Contracts (DTOs)
    ↓
Database Schema Validation
    ↓
End-to-End Type Consistency
```

### Key Technologies
- **TypeScript** - Strict typing across frontend and backend interfaces
- **API Contracts** - Request/response type definitions and validation
- **OpenAPI/Swagger** - API documentation and contract generation
- **Bean Validation** - Backend input validation with annotations
- **Jest/Testing Library** - Frontend component and integration testing
- **JUnit/MockK** - Backend unit and integration testing

## Core Integration Patterns

### 1. Full-Stack Type Safety
```typescript
// frontend/src/types/api.ts - Comprehensive API type definitions
// Base response wrapper matching backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

// Directory Entry types matching backend DTOs exactly
export interface DirectoryEntryDto {
  id: string
  name: string
  description?: string
  category: Category
  entryType: string
  latitude?: number
  longitude?: number
  address?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  priceRange?: PriceRange
  isFeatured: boolean
  status: EntryStatus
  details?: RestaurantDetailsDto | HotelDetailsDto | LandmarkDetailsDto | BeachDetailsDto
  createdAt: string
  updatedAt: string
}

// Type-specific details matching backend inheritance
export interface RestaurantDetailsDto {
  cuisine?: string
  hours?: string
  menuUrl?: string
  dietaryOptions?: string[]
}

export interface HotelDetailsDto {
  amenities?: string[]
  roomTypes?: string[]
  checkInTime?: string
  checkOutTime?: string
}

export interface LandmarkDetailsDto {
  historicalInfo?: string
  visitingHours?: string
  entranceFee?: number
  historicalPeriod?: string
}

export interface BeachDetailsDto {
  beachActivities?: string[]
  facilities?: string[]
  waterConditions?: string
  safetyRating?: number
}

// Request DTOs matching backend exactly
export interface CreateEntryRequestDto {
  name: string
  description?: string
  category: Category
  latitude?: number
  longitude?: number
  address?: string
  phone?: string
  email?: string
  website?: string
  details?: CreateRestaurantDetailsDto | CreateHotelDetailsDto | CreateLandmarkDetailsDto | CreateBeachDetailsDto
}

// Enum types matching backend exactly
export enum Category {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  LANDMARK = 'LANDMARK',
  BEACH = 'BEACH'
}

export enum PriceRange {
  BUDGET = '$',
  MODERATE = '$$',
  UPSCALE = '$$$',
  LUXURY = '$$$$'
}

export enum EntryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

// Media types for AI processing
export interface MediaMetadataDto {
  id: string
  fileName: string
  gcsPath: string
  publicUrl: string
  contentType: string
  fileSize: number
  category: Category
  entryId?: string
  aiAnalysis?: AIAnalysisResultDto
  processingStatus: MediaProcessingStatus
  createdAt: string
  updatedAt: string
}

export interface AIAnalysisResultDto {
  labels: AILabelDto[]
  landmarks: AILandmarkDto[]
  extractedText?: string
  objects: AIObjectDto[]
  dominantColors: AIColorDto[]
  isAppropriate: boolean
}

export interface AILabelDto {
  description: string
  confidence: number
}
```

### 2. Type-Safe API Client
```typescript
// frontend/src/lib/api-client.ts - Type-safe API integration
import { createClient } from '@supabase/supabase-js'

class TypeSafeApiClient {
  private readonly baseUrl: string
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl
  }

  private async request<TResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TResponse> {
    const url = `${this.baseUrl}/api/v1${endpoint}`
    
    // Add authentication headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Get JWT token from Supabase
    const { data: { session } } = await this.supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData: ApiResponse<never> = await response.json().catch(() => ({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }))
        throw new ApiError(errorData.error || 'Request failed', response.status, errorData)
      }

      const data: ApiResponse<TResponse> = await response.json()
      
      if (!data.success) {
        throw new ApiError(data.error || 'API request failed', response.status, data)
      }

      return data.data!
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error(`API request failed: ${endpoint}`, error)
      throw new ApiError('Network request failed', 0)
    }
  }

  // Directory Entry CRUD operations with full type safety
  async getDirectoryEntries(params?: {
    category?: Category
    search?: string
    latitude?: number
    longitude?: number
    radius?: number
    limit?: number
    offset?: number
  }): Promise<DirectoryEntryDto[]> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    const endpoint = `/directory/entries${query ? `?${query}` : ''}`
    
    return this.request<DirectoryEntryDto[]>(endpoint)
  }

  async getDirectoryEntry(id: string): Promise<DirectoryEntryDto> {
    return this.request<DirectoryEntryDto>(`/directory/entries/${id}`)
  }

  async createDirectoryEntry(entry: CreateEntryRequestDto): Promise<DirectoryEntryDto> {
    return this.request<DirectoryEntryDto>('/directory/entries', {
      method: 'POST',
      body: JSON.stringify(entry)
    })
  }

  async updateDirectoryEntry(id: string, entry: Partial<CreateEntryRequestDto>): Promise<DirectoryEntryDto> {
    return this.request<DirectoryEntryDto>(`/directory/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry)
    })
  }

  async deleteDirectoryEntry(id: string): Promise<void> {
    await this.request<void>(`/directory/entries/${id}`, {
      method: 'DELETE'
    })
  }

  // Media operations
  async uploadMedia(file: File, category: Category, entryId?: string): Promise<MediaMetadataDto> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    if (entryId) {
      formData.append('entryId', entryId)
    }

    const { data: { session } } = await this.supabase.auth.getSession()
    const headers: HeadersInit = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${this.baseUrl}/api/v1/media/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const errorData: ApiResponse<never> = await response.json().catch(() => ({
        success: false,
        error: `Upload failed with status ${response.status}`
      }))
      throw new ApiError(errorData.error || 'Upload failed', response.status, errorData)
    }

    const data: ApiResponse<MediaMetadataDto> = await response.json()
    if (!data.success) {
      throw new ApiError(data.error || 'Upload failed', response.status, data)
    }

    return data.data!
  }

  async getMediaByEntry(entryId: string): Promise<MediaMetadataDto[]> {
    return this.request<MediaMetadataDto[]>(`/media/entry/${entryId}`)
  }

  // Tourism-specific search
  async searchImagesByLabels(labels: string[]): Promise<MediaMetadataDto[]> {
    const params = new URLSearchParams()
    labels.forEach(label => params.append('labels', label))
    return this.request<MediaMetadataDto[]>(`/media/search?${params.toString()}`)
  }
}

// Custom error class for type-safe error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: ApiResponse<never>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Export singleton instance
export const apiClient = new TypeSafeApiClient()
```

### 3. Backend DTO Validation
```kotlin
// Backend: Comprehensive DTO validation matching frontend types
import javax.validation.constraints.*
import javax.validation.Valid

data class CreateEntryRequestDto(
    @field:NotBlank(message = "Name is required")
    @field:Size(max = 255, message = "Name must not exceed 255 characters")
    val name: String,

    @field:Size(max = 2000, message = "Description must not exceed 2000 characters")
    val description: String?,

    @field:NotNull(message = "Category is required")
    val category: Category,

    @field:DecimalMin(value = "14.80", message = "Latitude must be within Brava Island bounds")
    @field:DecimalMax(value = "14.90", message = "Latitude must be within Brava Island bounds")
    val latitude: Double?,

    @field:DecimalMin(value = "-24.75", message = "Longitude must be within Brava Island bounds")
    @field:DecimalMax(value = "-24.65", message = "Longitude must be within Brava Island bounds")
    val longitude: Double?,

    @field:Size(max = 500, message = "Address must not exceed 500 characters")
    val address: String?,

    @field:Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number format is invalid")
    val phone: String?,

    @field:Email(message = "Email format is invalid")
    @field:Size(max = 255, message = "Email must not exceed 255 characters")
    val email: String?,

    @field:Pattern(regexp = "^https?://.*", message = "Website must be a valid URL")
    @field:Size(max = 500, message = "Website URL must not exceed 500 characters")
    val website: String?,

    @field:Valid
    val details: Any? // Will be validated based on category
) {
    // Custom validation to ensure location data is complete
    @AssertTrue(message = "Both latitude and longitude must be provided together")
    fun isLocationComplete(): Boolean {
        return (latitude == null && longitude == null) || 
               (latitude != null && longitude != null)
    }

    // Category-specific details validation
    @AssertTrue(message = "Details must match the selected category")
    fun areDetailsValid(): Boolean {
        return when (category) {
            Category.RESTAURANT -> details is CreateRestaurantDetailsDto?
            Category.HOTEL -> details is CreateHotelDetailsDto?
            Category.LANDMARK -> details is CreateLandmarkDetailsDto?
            Category.BEACH -> details is CreateBeachDetailsDto?
        }
    }
}

// Type-specific detail DTOs with validation
data class CreateRestaurantDetailsDto(
    @field:Size(max = 100, message = "Cuisine must not exceed 100 characters")
    val cuisine: String?,

    @field:Pattern(
        regexp = "^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(-[A-Za-z]{3})? \\d{1,2}:\\d{2}-\\d{1,2}:\\d{2}.*",
        message = "Hours format is invalid"
    )
    val hours: String?,

    @field:Pattern(regexp = "^https?://.*", message = "Menu URL must be valid")
    val menuUrl: String?,

    val dietaryOptions: List<@Size(max = 50) String>?
)

data class CreateHotelDetailsDto(
    val amenities: List<@Size(max = 100, message = "Amenity name too long") String>?,
    
    val roomTypes: List<@Size(max = 100, message = "Room type name too long") String>?,
    
    @field:Pattern(regexp = "^\\d{1,2}:\\d{2}$", message = "Check-in time format must be HH:MM")
    val checkInTime: String?,
    
    @field:Pattern(regexp = "^\\d{1,2}:\\d{2}$", message = "Check-out time format must be HH:MM")
    val checkOutTime: String?
) {
    @AssertTrue(message = "Check-out time must be after check-in time")
    fun isCheckTimeValid(): Boolean {
        if (checkInTime == null || checkOutTime == null) return true
        
        val checkIn = LocalTime.parse(checkInTime)
        val checkOut = LocalTime.parse(checkOutTime)
        return checkOut.isAfter(checkIn)
    }
}

// Global exception handler for validation errors
@RestControllerAdvice
class ValidationExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(
        ex: MethodArgumentNotValidException
    ): ResponseEntity<ApiResponse<Nothing>> {
        val errors = ex.bindingResult.fieldErrors.associate { 
            it.field to (it.defaultMessage ?: "Invalid value")
        }
        
        return ResponseEntity.badRequest().body(
            ApiResponse.error(
                message = "Validation failed",
                details = errors
            )
        )
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException
    ): ResponseEntity<ApiResponse<Nothing>> {
        val errors = ex.constraintViolations.associate {
            it.propertyPath.toString() to it.message
        }
        
        return ResponseEntity.badRequest().body(
            ApiResponse.error(
                message = "Constraint violation",
                details = errors
            )
        )
    }
}
```

### 4. OpenAPI Documentation Generation
```kotlin
// Backend: OpenAPI configuration for API documentation
@Configuration
@OpenAPIDefinition(
    info = Info(
        title = "Nos Ilha Tourism API",
        version = "1.0",
        description = "API for managing tourism content on Brava Island, Cape Verde",
        contact = Contact(name = "Nos Ilha Team", email = "info@nosilha.com")
    ),
    servers = [
        Server(url = "https://api.nosilha.com", description = "Production server"),
        Server(url = "http://localhost:8080", description = "Development server")
    ]
)
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        return OpenAPI()
            .components(
                Components()
                    .addSecuritySchemes(
                        "bearerAuth",
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("JWT token from Supabase authentication")
                    )
            )
            .addSecurityItem(
                SecurityRequirement().addList("bearerAuth")
            )
    }
}

// Controller with comprehensive OpenAPI annotations
@RestController
@RequestMapping("/api/v1/directory")
@Tag(name = "Directory", description = "Tourism directory management")
class DirectoryEntryController(
    private val directoryService: DirectoryEntryService
) {

    @GetMapping("/entries")
    @Operation(
        summary = "Get directory entries",
        description = "Retrieve tourism directory entries with optional filtering and search"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Directory entries retrieved successfully",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(
                        implementation = ApiResponse::class,
                        example = """
                        {
                          "success": true,
                          "data": [
                            {
                              "id": "123e4567-e89b-12d3-a456-426614174000",
                              "name": "Casa Nova Restaurant",
                              "category": "RESTAURANT",
                              "latitude": 14.8732,
                              "longitude": -24.7063
                            }
                          ]
                        }
                        """
                    )
                )]
            ),
            ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            ApiResponse(responseCode = "500", description = "Internal server error")
        ]
    )
    fun getDirectoryEntries(
        @Parameter(description = "Filter by category")
        @RequestParam(required = false) category: Category?,
        
        @Parameter(description = "Search in name and description")
        @RequestParam(required = false) search: String?,
        
        @Parameter(description = "User latitude for proximity search")
        @RequestParam(required = false) latitude: Double?,
        
        @Parameter(description = "User longitude for proximity search")
        @RequestParam(required = false) longitude: Double?,
        
        @Parameter(description = "Search radius in kilometers")
        @RequestParam(required = false) radius: Double?,
        
        @Parameter(description = "Maximum number of results", example = "20")
        @RequestParam(defaultValue = "20") limit: Int,
        
        @Parameter(description = "Number of results to skip", example = "0")
        @RequestParam(defaultValue = "0") offset: Int
    ): ResponseEntity<ApiResponse<List<DirectoryEntryDto>>> {
        // Implementation...
    }
}
```

## Testing Integration Patterns

### 1. End-to-End Type Safety Testing
```typescript
// frontend/src/tests/api-integration.test.ts
import { apiClient, ApiError } from '@/lib/api-client'
import { Category, CreateEntryRequestDto } from '@/types/api'

describe('API Integration Type Safety', () => {
  describe('Directory Entries', () => {
    it('should handle typed API responses correctly', async () => {
      const entries = await apiClient.getDirectoryEntries({
        category: Category.RESTAURANT,
        limit: 5
      })

      // TypeScript ensures these properties exist and have correct types
      expect(Array.isArray(entries)).toBe(true)
      entries.forEach(entry => {
        expect(typeof entry.id).toBe('string')
        expect(typeof entry.name).toBe('string')
        expect(Object.values(Category)).toContain(entry.category)
        if (entry.latitude) {
          expect(typeof entry.latitude).toBe('number')
          expect(entry.latitude).toBeGreaterThan(14.80)
          expect(entry.latitude).toBeLessThan(14.90)
        }
      })
    })

    it('should validate create entry request types', async () => {
      const newEntry: CreateEntryRequestDto = {
        name: 'Test Restaurant',
        description: 'A test restaurant for integration testing',
        category: Category.RESTAURANT,
        latitude: 14.8732,
        longitude: -24.7063,
        details: {
          cuisine: 'Cape Verdean',
          hours: 'Mon-Fri 11:00-22:00'
        }
      }

      // TypeScript ensures request matches backend expectations
      const createdEntry = await apiClient.createDirectoryEntry(newEntry)
      
      expect(createdEntry).toMatchObject({
        name: newEntry.name,
        category: newEntry.category,
        latitude: newEntry.latitude,
        longitude: newEntry.longitude
      })
    })

    it('should handle API errors with proper typing', async () => {
      try {
        await apiClient.getDirectoryEntry('invalid-id')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(typeof apiError.message).toBe('string')
        expect(typeof apiError.status).toBe('number')
      }
    })
  })

  describe('Media Upload Integration', () => {
    it('should handle file uploads with type safety', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      
      const uploadResult = await apiClient.uploadMedia(
        file, 
        Category.RESTAURANT,
        'entry-id'
      )

      expect(uploadResult).toMatchObject({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        category: Category.RESTAURANT,
        entryId: 'entry-id'
      })
      expect(typeof uploadResult.id).toBe('string')
      expect(typeof uploadResult.publicUrl).toBe('string')
    })
  })
})
```

### 2. Backend API Contract Testing
```kotlin
// Backend: Contract testing to ensure API matches frontend expectations
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class APIContractIntegrationTest {

    @Autowired
    private lateinit var testRestTemplate: TestRestTemplate

    @Test
    fun `should return directory entries matching frontend interface`() {
        val response = testRestTemplate.getForEntity(
            "/api/v1/directory/entries",
            object : ParameterizedTypeReference<ApiResponse<List<DirectoryEntryDto>>>() {}
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.success).isTrue
        
        response.body?.data?.forEach { entry ->
            // Verify all required fields match TypeScript interface
            assertThat(entry.id).isNotNull
            assertThat(entry.name).isNotEmpty
            assertThat(entry.category).isIn(Category.values())
            assertThat(entry.entryType).isNotEmpty
            assertThat(entry.createdAt).isNotNull
            assertThat(entry.updatedAt).isNotNull
            
            // Verify optional fields are properly nullable
            entry.latitude?.let { lat ->
                assertThat(lat).isBetween(14.80, 14.90)
            }
            entry.longitude?.let { lng ->
                assertThat(lng).isBetween(-24.75, -24.65)
            }
        }
    }

    @Test
    fun `should validate create entry request according to frontend types`() {
        val createRequest = CreateEntryRequestDto(
            name = "Test Restaurant",
            description = "Integration test restaurant",
            category = Category.RESTAURANT,
            latitude = 14.8732,
            longitude = -24.7063,
            details = CreateRestaurantDetailsDto(
                cuisine = "Cape Verdean",
                hours = "Mon-Fri 11:00-22:00"
            )
        )

        val response = testRestTemplate.postForEntity(
            "/api/v1/directory/entries",
            createRequest,
            object : ParameterizedTypeReference<ApiResponse<DirectoryEntryDto>>() {}
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.success).isTrue
        
        val createdEntry = response.body?.data
        assertThat(createdEntry?.name).isEqualTo(createRequest.name)
        assertThat(createdEntry?.category).isEqualTo(createRequest.category)
    }

    @Test
    fun `should return validation errors in format expected by frontend`() {
        val invalidRequest = CreateEntryRequestDto(
            name = "", // Invalid: empty name
            description = null,
            category = Category.RESTAURANT,
            latitude = 50.0, // Invalid: outside Brava Island bounds
            longitude = -24.7063
        )

        val response = testRestTemplate.postForEntity(
            "/api/v1/directory/entries",
            invalidRequest,
            object : ParameterizedTypeReference<ApiResponse<Nothing>>() {}
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(response.body?.success).isFalse
        assertThat(response.body?.error).contains("validation", ignoreCase = true)
    }
}
```

## Environment Configuration Management

### 1. Type-Safe Environment Variables
```typescript
// frontend/src/lib/env.ts - Centralized environment validation
interface EnvironmentConfig {
  // API Configuration
  API_URL: string
  
  // Supabase Configuration
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  
  // Mapbox Configuration
  MAPBOX_ACCESS_TOKEN: string
  
  // Feature Flags
  ENABLE_AI_FEATURES: boolean
  ENABLE_OFFLINE_MODE: boolean
  
  // Environment Info
  NODE_ENV: 'development' | 'production' | 'test'
  IS_PRODUCTION: boolean
  IS_DEVELOPMENT: boolean
}

function validateEnvironment(): EnvironmentConfig {
  const requiredEnvVars = {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  }

  // Validate all required variables are present
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  return {
    API_URL: requiredEnvVars.API_URL!,
    SUPABASE_URL: requiredEnvVars.SUPABASE_URL!,
    SUPABASE_ANON_KEY: requiredEnvVars.SUPABASE_ANON_KEY!,
    MAPBOX_ACCESS_TOKEN: requiredEnvVars.MAPBOX_ACCESS_TOKEN!,
    
    // Feature flags with defaults
    ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
    ENABLE_OFFLINE_MODE: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    
    // Environment detection
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
  }
}

// Export validated configuration
export const env = validateEnvironment()

// Development-only configuration validation
if (env.IS_DEVELOPMENT) {
  console.log('Environment Configuration:', {
    API_URL: env.API_URL,
    SUPABASE_URL: env.SUPABASE_URL,
    MAPBOX_CONFIGURED: !!env.MAPBOX_ACCESS_TOKEN,
    FEATURES: {
      AI: env.ENABLE_AI_FEATURES,
      OFFLINE: env.ENABLE_OFFLINE_MODE
    }
  })
}
```

### 2. Configuration Validation Testing
```typescript
// frontend/src/tests/environment.test.ts
describe('Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should validate required environment variables', () => {
    // Set valid environment
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'mapbox-token'

    const { env } = require('@/lib/env')
    
    expect(env.API_URL).toBe('http://localhost:8080')
    expect(env.SUPABASE_URL).toBe('https://project.supabase.co')
    expect(env.IS_DEVELOPMENT).toBe(true)
  })

  it('should throw error for missing required variables', () => {
    delete process.env.NEXT_PUBLIC_API_URL

    expect(() => {
      require('@/lib/env')
    }).toThrow('Missing required environment variables')
  })
})
```

This knowledge base provides comprehensive coverage of full-stack type safety, API contract management, and cross-system integration patterns for the Nos Ilha tourism platform.