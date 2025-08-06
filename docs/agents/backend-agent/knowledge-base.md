# Backend Agent Knowledge Base

## Domain Expertise: Spring Boot + Kotlin API Development

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
- **Spring Boot 3.4.7** with Kotlin
- **JPA/Hibernate** for ORM
- **PostgreSQL** as primary database
- **Flyway** for database migrations
- **JWT Authentication** via Supabase
- **Jackson** for JSON serialization
- **Actuator** for monitoring

## Core Patterns

### 1. Single Table Inheritance (DirectoryEntry)
```kotlin
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "entry_type", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry(
    @Id @GeneratedValue val id: UUID = UUID.randomUUID(),
    val name: String,
    val description: String?,
    val category: Category,
    // ... common fields
)

@Entity
@DiscriminatorValue("RESTAURANT")
class Restaurant(
    // inherited fields
    val cuisine: String?,
    val priceRange: String?,
    val hours: String?
) : DirectoryEntry(...)
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

fun DirectoryEntry.toDto(): DirectoryEntryDto = when (this) {
    is Restaurant -> DirectoryEntryDto(
        id = id, name = name, category = category, type = "RESTAURANT",
        details = RestaurantDetailsDto(cuisine, priceRange, hours)
    )
    // ... other mappings
}
```

### 4. REST Controller Pattern
```kotlin
@RestController
@RequestMapping("/api/v1/directory")
@CrossOrigin(origins = ["\${app.cors.allowed-origins}"])
class DirectoryEntryController(
    private val directoryService: DirectoryEntryService
) {
    @GetMapping("/entries")
    fun getAllEntries(): ResponseEntity<ApiResponse<List<DirectoryEntryDto>>> {
        return try {
            val entries = directoryService.getAllEntries()
            ResponseEntity.ok(ApiResponse.success(entries))
        } catch (e: Exception) {
            logger.error("Error fetching entries", e)
            ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch entries"))
        }
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
@Service
class JwtService(
    @Value("\${supabase.jwt.secret}") private val jwtSecret: String
) {
    fun validateToken(token: String): Boolean {
        return try {
            val verifier = JWT.require(Algorithm.HMAC256(jwtSecret))
                .withIssuer("https://your-supabase-project.supabase.co/auth/v1")
                .build()
            verifier.verify(token)
            true
        } catch (e: Exception) {
            false
        }
    }
}
```

## Configuration Patterns

### Application Properties Structure
```yaml
# application.yml
spring:
  application.name: nos-ilha-core
  profiles.active: ${SPRING_PROFILES_ACTIVE:local}
  
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000

  jpa:
    hibernate.ddl-auto: validate
    show-sql: false
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
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

This knowledge base provides comprehensive coverage of the backend architecture, patterns, and best practices specific to the Nos Ilha platform.