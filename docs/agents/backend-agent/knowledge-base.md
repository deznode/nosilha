# Backend Agent Knowledge Base

## Domain Expertise: Spring Boot + Kotlin API Development for Cultural Heritage Platform

This platform serves as a cultural heritage hub connecting Brava Island locals to the global Cape Verdean diaspora while supporting sustainable, community-focused tourism.

### Architecture Overview
```
Controller Layer (REST endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Domain Layer (Entities & DTOs)
    ↓
Database Layer (PostgreSQL)
```

### Key Technologies
- **Spring Boot 3.4.7** with Kotlin 1.9.25 and Java 21
- **JPA/Hibernate** for ORM with PostgreSQL primary database
- **Spring Data Firestore** for AI metadata storage (version 6.2.2)
- **Google Cloud Platform** integration (Storage, Vision API, Secret Manager)
- **Flyway** for database migrations
- **JWT Authentication** via Supabase token validation
- **Jackson Kotlin** module for JSON serialization
- **Spring Boot Actuator** for monitoring and health checks
- **Detekt** for Kotlin static analysis
- **Jacoco** for test coverage reporting

## Core Patterns

### 1. Single Table Inheritance (DirectoryEntry)
```kotlin
// Based on actual implementation from backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry {
    @Id
    @GeneratedValue
    var id: UUID? = null

    @Column(nullable = false)
    lateinit var name: String

    @Column(unique = true, nullable = false)
    lateinit var slug: String

    @Column(length = 2048)
    lateinit var description: String

    @Column(name = "category", nullable = false, insertable = false, updatable = false)
    lateinit var category: String

    @Column(nullable = false)
    lateinit var town: String

    @Column(nullable = false)
    var latitude: Double = 0.0

    @Column(nullable = false)
    var longitude: Double = 0.0

    var imageUrl: String? = null
    var rating: Double? = null
    var reviewCount: Int = 0

    // Restaurant-specific fields (all nullable in base table)
    var phoneNumber: String? = null
    var openingHours: String? = null
    var cuisine: String? = null

    // Hotel-specific fields (all nullable in base table)
    var amenities: String? = null

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
    
    @PrePersist
    protected fun onCreate() {
        val now = LocalDateTime.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    protected fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@DiscriminatorValue("Restaurant")
class Restaurant : DirectoryEntry()
```

**Key Points**:
- All entry types (Restaurant, Hotel, Landmark, Beach) share common fields
- Type-specific fields added in subclasses
- Single table for performance, discriminator column for type identification

### 2. Repository Pattern with JPA
```kotlin
@Repository
interface DirectoryEntryRepository : JpaRepository<DirectoryEntry, UUID> {
    fun findByCategory(category: Category): List<DirectoryEntry>
    fun findByNameContainingIgnoreCase(name: String): List<DirectoryEntry>
    
    @Query("SELECT d FROM DirectoryEntry d WHERE d.latitude BETWEEN :minLat AND :maxLat")
    fun findByLocationBounds(minLat: Double, maxLat: Double): List<DirectoryEntry>
}
```

### 3. DTO Mapping Pattern
```kotlin
data class DirectoryEntryDto(
    val id: UUID,
    val name: String,
    val description: String?,
    val category: Category,
    val type: String,
    val details: Any? // Type-specific details
)

fun DirectoryEntry.toDto(): DirectoryEntryDto {
    val details = when (this.category) {
        "Restaurant" -> RestaurantDetailsDto(
            cuisine = this.cuisine,
            phoneNumber = this.phoneNumber,
            openingHours = this.openingHours
        )
        "Hotel" -> HotelDetailsDto(
            amenities = this.amenities?.split(",")?.map { it.trim() } ?: emptyList()
        )
        else -> null
    }
    
    return DirectoryEntryDto(
        id = this.id!!,
        name = this.name,
        slug = this.slug,
        description = this.description,
        category = this.category,
        town = this.town,
        latitude = this.latitude,
        longitude = this.longitude,
        imageUrl = this.imageUrl,
        rating = this.rating,
        reviewCount = this.reviewCount,
        details = details,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
```

### 4. REST Controller Pattern
```kotlin
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
    private val service: DirectoryEntryService,
) {
    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    fun createNewEntry(
        @RequestBody request: CreateEntryRequestDto,
    ): ApiResponse<DirectoryEntryDto> {
        val createdEntry = service.createEntry(request)
        return ApiResponse(data = createdEntry, status = HttpStatus.CREATED.value())
    }

    @GetMapping("/entries")
    fun getEntries(
        @RequestParam(name = "category", required = false) category: String?,
        @RequestParam(name = "town", required = false) town: String?,
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResponse<DirectoryEntryDto> {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        
        val resultPage = when {
            category != null && town != null -> service.getEntriesByCategoryAndTownPage(category, town, pageable)
            category != null -> service.getEntriesByCategoryPage(category, pageable)
            town != null -> service.getEntriesByTownPage(town, pageable)
            else -> service.getEntriesPage(pageable)
        }
        
        return PagedApiResponse.from(resultPage)
    }

    @GetMapping("/entries/{id}")
    fun getEntryById(
        @PathVariable id: UUID,
    ): ApiResponse<DirectoryEntryDto> {
        val entry = service.getEntryById(id)
        return ApiResponse(data = entry)
    }

    @GetMapping("/slug/{slug}")
    fun getEntryBySlug(
        @PathVariable slug: String,
    ): ApiResponse<DirectoryEntryDto> {
        val entry = service.getEntryBySlug(slug)
        return ApiResponse(data = entry)
    }

    @PutMapping("/entries/{id}")
    fun updateEntry(
        @PathVariable id: UUID,
        @RequestBody request: CreateEntryRequestDto,
    ): ApiResponse<DirectoryEntryDto> {
        val updatedEntry = service.updateEntry(id, request)
        return ApiResponse(data = updatedEntry)
    }

    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntry(
        @PathVariable id: UUID,
    ) {
        service.deleteEntry(id)
    }
}
```

## Database Migration (Flyway)

### Migration File Structure
- Location: `src/main/resources/db/migration/`
- Naming: `V{version}__{description}.sql`
- Example: `V1__Create_directory_entries_table.sql`

### Sample Migration
```sql
-- V1__Create_directory_entries_table.sql
CREATE TABLE directory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    entry_type VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Restaurant specific
    cuisine VARCHAR(100),
    price_range VARCHAR(20),
    hours VARCHAR(255),
    
    -- Hotel specific
    amenities TEXT[],
    room_types TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_directory_entries_category ON directory_entries(category);
CREATE INDEX idx_directory_entries_type ON directory_entries(entry_type);
CREATE INDEX idx_directory_entries_location ON directory_entries(latitude, longitude);
```

## Authentication & Security

### JWT Filter Implementation
```kotlin
@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {
    
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractTokenFromHeader(request)
        if (token != null && jwtService.validateToken(token)) {
            val authentication = jwtService.getAuthentication(token)
            SecurityContextHolder.getContext().authentication = authentication
        }
        filterChain.doFilter(request, response)
    }
}
```

### Supabase JWT Validation
```kotlin
@Component
class JwtAuthenticationFilter(
    @Value("\${supabase.jwt-secret}") private val jwtSecret: String,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authHeader: String? = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.substring(7)

        try {
            val key = Keys.hmacShaKeyFor(jwtSecret.toByteArray())
            val claims: Claims =
                Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .payload

            if (SecurityContextHolder.getContext().authentication == null) {
                val userId = claims.subject
                val role = claims["role"] as? String ?: "USER"
                val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))

                val authentication =
                    UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        authorities,
                    )

                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            logger.warn("JWT token processing error: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }
}
```

## Build Configuration (Gradle)

### Key Dependencies (build.gradle.kts)
```kotlin
// Based on actual implementation from backend/build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.4.7"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "1.9.25"
    jacoco
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
}

dependencies {
    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    
    // Google Cloud Platform
    implementation("com.google.cloud:spring-cloud-gcp-starter-storage")
    implementation("com.google.cloud:spring-cloud-gcp-starter-data-firestore")
    implementation("com.google.cloud:spring-cloud-gcp-starter-vision")
    
    // Kotlin & Jackson
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    
    // JWT Processing
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")
    
    // Database & Migrations
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")
    
    // Documentation
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.9")
    
    // Logging
    implementation("io.github.oshai:kotlin-logging-jvm:7.0.3")
}

// Quality & Testing
jacoco {
    toolVersion = "0.8.12"
}

detekt {
    buildUponDefaultConfig = true
    baseline = file("detekt-baseline.xml")
    config.setFrom(file("detekt.yml"))
}
```

### Docker Image Configuration
```kotlin
// Configured for Google Artifact Registry
tasks.getByName<BootBuildImage>("bootBuildImage") {
    imageName.set("us-east1-docker.pkg.dev/nosilha/nosilha-backend/nosilha-core-api:${project.version}")
}
```

## Configuration Patterns

### Application Properties Structure
```yaml
# application.yml - Production configuration
spring:
  application:
    name: nos-ilha-core
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/nosilha_db}
    username: ${DATABASE_USERNAME:nosilha}
    password: ${DATABASE_PASSWORD:nosilha}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc.batch_size: 20
        order_inserts: true
        order_updates: true

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    
  cloud:
    gcp:
      project-id: ${GCP_PROJECT_ID}
      storage:
        bucket: ${GCS_BUCKET_NAME}
      firestore:
        project-id: ${GCP_PROJECT_ID}

# application-local.yml - Local development overrides
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nosilha_db
    username: nosilha
    password: nosilha
  
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: validate
      
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,flyway
```

## Testing Patterns

### Service Layer Testing
```kotlin
@ExtendWith(MockitoExtension::class)
class DirectoryEntryServiceTest {
    
    @Mock
    private lateinit var repository: DirectoryEntryRepository
    
    @InjectMocks
    private lateinit var service: DirectoryEntryService
    
    @Test
    fun `should return all entries when requested`() {
        // Given
        val entries = listOf(
            createRestaurant("Casa Nova"),
            createHotel("Hotel Mar")
        )
        whenever(repository.findAll()).thenReturn(entries)
        
        // When
        val result = service.getAllEntries()
        
        // Then
        assertThat(result).hasSize(2)
        assertThat(result[0].name).isEqualTo("Casa Nova")
    }
}
```

### Integration Testing with TestContainers
```kotlin
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = ["spring.profiles.active=test"])
class DirectoryEntryControllerIntegrationTest {
    
    @Autowired
    private lateinit var testRestTemplate: TestRestTemplate
    
    @Test
    fun `should fetch all directory entries`() {
        val response = testRestTemplate.getForEntity(
            "/api/v1/directory/entries",
            String::class.java
        )
        
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        // Additional assertions...
    }
}
```

## Common File Locations

### Source Structure
```
backend/src/main/kotlin/com/nosilha/core/
├── NosIlhaCoreApplication.kt           # Main application
├── config/                             # Configuration classes
│   ├── SecurityConfig.kt              # Security configuration
│   ├── PersistenceConfig.kt           # JPA configuration
│   └── LocalStorageConfig.kt          # GCS configuration
├── controller/                         # REST endpoints
│   ├── DirectoryEntryController.kt    # Main CRUD controller
│   ├── FileUploadController.kt        # Media upload endpoints
│   └── TownController.kt              # Town data endpoints
├── service/                           # Business logic
│   ├── DirectoryEntryService.kt       # Main business service
│   ├── FileStorageService.kt          # GCS integration
│   └── AIService.kt                   # Cloud Vision API
├── domain/                            # Entity classes
│   ├── DirectoryEntry.kt              # Base entity
│   ├── Restaurant.kt                  # Restaurant entity
│   ├── Hotel.kt                       # Hotel entity
│   └── Landmark.kt                    # Landmark entity
├── dto/                               # Data transfer objects
│   ├── DirectoryEntryDto.kt           # Main DTO
│   ├── CreateEntryRequestDto.kt       # Create request DTO
│   └── ApiResponse.kt                 # Standard response wrapper
├── repository/                        # Data access layer
│   └── jpa/
│       ├── DirectoryEntryRepository.kt # Main repository
│       └── TownRepository.kt          # Town repository
└── exception/                         # Exception handling
    ├── GlobalExceptionHandler.kt      # Global error handler
    └── ResourceNotFoundException.kt   # Custom exceptions
```

### Resource Structure
```
backend/src/main/resources/
├── application.yml                    # Main configuration
├── application-local.yml              # Local development
├── application-test.yml               # Test configuration
└── db/migration/                      # Flyway migrations
    ├── V1__Create_directory_entries_table.sql
    ├── V2__Add_towns_table.sql
    └── V3__Add_media_metadata.sql
```

## Performance Optimization

### Database Query Optimization
- Use `@BatchSize` for collection fetching
- Implement proper indexing on query fields
- Use `@Query` for complex queries instead of derived methods
- Monitor query execution with `show-sql: true` in development

### Connection Pooling
```yaml
spring.datasource.hikari:
  maximum-pool-size: 10        # Max connections
  minimum-idle: 2              # Min idle connections
  connection-timeout: 30000    # 30 seconds
  idle-timeout: 600000         # 10 minutes
  max-lifetime: 1800000        # 30 minutes
```

## Monitoring & Health Checks

### Actuator Endpoints
- `/actuator/health` - Application health status
- `/actuator/metrics` - Application metrics
- `/actuator/info` - Build information
- `/actuator/flyway` - Database migration status

### Custom Health Indicator
```kotlin
@Component
class DatabaseHealthIndicator(
    private val repository: DirectoryEntryRepository
) : HealthIndicator {
    
    override fun health(): Health {
        return try {
            val count = repository.count()
            Health.up()
                .withDetail("entries", count)
                .build()
        } catch (e: Exception) {
            Health.down()
                .withDetail("error", e.message)
                .build()
        }
    }
}
```

## Error Handling Standards

### Global Exception Handler
```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(e: ResourceNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(e.message ?: "Resource not found"))
    }
    
    @ExceptionHandler(ValidationException::class)
    fun handleValidation(e: ValidationException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(e.message ?: "Validation failed"))
    }
}
```

## Error Handling Standards

### Global Exception Handler
```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Resource not found: ${ex.message}" }
        
        val errorResponse = ErrorResponse(
            error = "Resource Not Found",
            message = ex.message ?: "The requested resource was not found",
            path = request.requestURI,
            status = HttpStatus.NOT_FOUND.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class, BindException::class)
    fun handleValidationErrors(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ValidationErrorResponse> {
        logger.warn { "Validation failed: ${ex.message}" }
        
        val fieldErrors = when (ex) {
            is MethodArgumentNotValidException -> ex.bindingResult.fieldErrors
            is BindException -> ex.bindingResult.fieldErrors
            else -> emptyList()
        }
        
        val validationErrors = fieldErrors.map { fieldError ->
            ValidationErrorResponse.FieldError(
                field = fieldError.field,
                rejectedValue = fieldError.rejectedValue,
                message = fieldError.defaultMessage ?: "Invalid value"
            )
        }
        
        val errorResponse = ValidationErrorResponse(
            error = "Validation failed",
            details = validationErrors,
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Business logic error: ${ex.message}" }
        
        val errorResponse = ErrorResponse(
            error = "Business Rule Violation",
            message = ex.message ?: "A business rule was violated",
            path = request.requestURI,
            status = HttpStatus.UNPROCESSABLE_ENTITY.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.error(ex) { "Unhandled exception occurred" }
        
        val errorResponse = ErrorResponse(
            error = "Internal Server Error",
            message = "An unexpected error occurred. Please try again later.",
            path = request.requestURI,
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

// Custom exceptions for specific HTTP status codes
class ResourceNotFoundException(message: String) : RuntimeException(message)
class BusinessException(message: String) : RuntimeException(message)
```

This knowledge base provides comprehensive coverage of the backend architecture, patterns, and best practices specific to the Nos Ilha cultural heritage platform that connects Brava locals to the global Cape Verdean diaspora while supporting sustainable community-focused tourism.