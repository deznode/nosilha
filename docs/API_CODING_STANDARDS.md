# Nos Ilha API Coding Standards

This document establishes comprehensive coding standards for the Nos Ilha backend API to ensure consistent, maintainable, and robust development practices. These standards build upon the existing architecture and provide guidance for implementing new features.

## 📋 Table of Contents

1. [Entity Design Patterns](#entity-design-patterns)
2. [Auditing Standards](#auditing-standards)
3. [Input Validation Standards](#input-validation-standards)
4. [Data Migration & Schema Evolution](#data-migration--schema-evolution)
5. [API Design Standards](#api-design-standards)
6. [Database & Persistence Standards](#database--persistence-standards)
7. [DTO & Mapping Standards](#dto--mapping-standards)
8. [Controller & Service Layer Standards](#controller--service-layer-standards)
9. [Error Handling Standards](#error-handling-standards)
10. [Future-Ready Standards](#future-ready-standards)
11. [Code Organization & Development Guidelines](#code-organization--development-guidelines)

---

## 1. Entity Design Patterns

### 1.1 Pattern Selection Criteria

Choose the appropriate entity pattern based on domain characteristics:

#### Single Table Inheritance
**Use when:**
- Entities share common behavior and attributes
- Polymorphic operations are needed
- Related entities have similar lifecycle management

**Example:** DirectoryEntry hierarchy (Restaurant, Hotel, Beach, Landmark)

```kotlin
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
    
    // Common fields...
}

@DiscriminatorValue("Restaurant")
class Restaurant : DirectoryEntry() {
    var phoneNumber: String? = null
    var openingHours: String? = null
    var cuisine: String? = null
}
```

#### Standalone Entities
**Use when:**
- Entities have distinct domain purposes
- Different lifecycle management requirements
- No polymorphic behavior needed

**Example:** Town entity for geographic/administrative data

```kotlin
@Entity
@Table(name = "towns")
class Town {
    @Id
    @GeneratedValue
    var id: UUID? = null
    
    @Column(nullable = false)
    lateinit var name: String
    
    // Town-specific fields...
    var population: String? = null
    var elevation: String? = null
}
```

#### Document Entities
**Use when:**
- Flexible schema requirements
- Metadata-heavy data
- NoSQL storage patterns needed

**Example:** ImageMetadata for AI-processed content

```kotlin
@Document(collectionName = "image-metadata")
data class ImageMetadata(
    @DocumentId
    var id: String? = null,
    var gcsUrl: String = "",
    var tags: List<String> = emptyList(),
    var createdAt: Instant = Instant.now()
)
```

### 1.2 Entity Design Principles

- **UUID Primary Keys**: Always use UUID for primary keys
- **Immutable Fields**: Use `lateinit var` for required fields, `var` for optional
- **Null Safety**: Leverage Kotlin's null safety features
- **Entity Equality**: Implement proper `equals()` and `hashCode()` based on ID

---

## 2. Auditing Standards

### 2.1 Current State vs. Standard Practice

**Current Implementation** (Manual):
```kotlin
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
```

**Standard Practice** (Spring Data JPA Auditing):
```kotlin
@EntityListeners(AuditingEntityListener::class)
abstract class AuditableEntity {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    lateinit var createdAt: LocalDateTime
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    lateinit var updatedAt: LocalDateTime
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: String? = null
    
    @LastModifiedBy
    @Column(name = "updated_by")
    var lastModifiedBy: String? = null
}
```

### 2.2 Configuration Setup

```kotlin
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
class JpaAuditingConfiguration {
    
    @Bean
    fun auditorProvider(): AuditorAware<String> {
        return AuditorAware {
            // Extract user from JWT token in SecurityContext
            val authentication = SecurityContextHolder.getContext().authentication
            Optional.ofNullable(authentication?.name ?: "system")
        }
    }
}
```

### 2.3 Migration Strategy

1. Create base `AuditableEntity` class
2. Update existing entities to extend from it
3. Create migration script to add audit columns
4. Remove manual `@PrePersist`/`@PreUpdate` callbacks

---

## 3. Input Validation Standards

### 3.1 Bean Validation Implementation

**Current State**: No validation annotations (spring-boot-starter-validation available)

**Standard Practice**: Comprehensive Bean Validation

#### 3.1.1 Request DTO Validation

```kotlin
data class CreateEntryRequestDto(
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    val name: String,
    
    @field:NotBlank(message = "Description is required")
    @field:Size(max = 2048, message = "Description must not exceed 2048 characters")
    val description: String,
    
    @field:NotBlank(message = "Category is required")
    @field:Pattern(
        regexp = "^(Restaurant|Hotel|Beach|Landmark)$",
        message = "Category must be one of: Restaurant, Hotel, Beach, Landmark"
    )
    val category: String,
    
    @field:NotBlank(message = "Town is required")
    val town: String,
    
    @field:DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @field:DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    val latitude: Double,
    
    @field:DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @field:DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    val longitude: Double,
    
    @field:URL(message = "Image URL must be a valid URL")
    val imageUrl: String?,
    
    @field:Valid
    val details: DetailsDto?
)
```

#### 3.1.2 Nested Validation

```kotlin
data class CreateRestaurantDetailsDto(
    @field:Pattern(
        regexp = "^\\+?[1-9]\\d{1,14}$",
        message = "Phone number must be a valid international format"
    )
    val phoneNumber: String?,
    
    @field:Size(max = 200, message = "Opening hours must not exceed 200 characters")
    val openingHours: String?,
    
    @field:Size(min = 1, message = "At least one cuisine type is required")
    val cuisine: List<@NotBlank(message = "Cuisine type cannot be blank") String>?
) : DetailsDto
```

#### 3.1.3 Controller Integration

```kotlin
@PostMapping("/entries")
@ResponseStatus(HttpStatus.CREATED)
fun createNewEntry(
    @Valid @RequestBody request: CreateEntryRequestDto
): ApiResponse<DirectoryEntryDto> {
    val createdEntry = service.createEntry(request)
    return ApiResponse(data = createdEntry, status = HttpStatus.CREATED.value())
}
```

### 3.2 Custom Validation Annotations

```kotlin
@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [UniqueslugValidator::class])
annotation class UniqueSlug(
    val message: String = "Slug must be unique",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)

class UniqueslugValidator : ConstraintValidator<UniqueSlug, String> {
    @Autowired
    private lateinit var repository: DirectoryEntryRepository
    
    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        if (value == null) return true
        return repository.findBySlug(value) == null
    }
}
```

### 3.3 Validation Messages

Create `src/main/resources/ValidationMessages.properties`:

```properties
# Field validation messages
field.required=This field is required
field.size.min=Must be at least {min} characters
field.size.max=Must not exceed {max} characters
field.email.invalid=Must be a valid email address
field.url.invalid=Must be a valid URL

# Business validation messages
business.slug.duplicate=An entry with this name already exists
business.category.invalid=Invalid category specified
business.coordinates.invalid=Coordinates must be within valid geographic bounds
```

---

## 4. Data Migration & Schema Evolution

### 4.1 Flyway Naming Conventions

#### 4.1.1 Current State Analysis
**Issue**: Mixed DDL and seed data in single files (e.g., `V2__seed_initial_data.sql` contains INSERT statements)

#### 4.1.2 Standard Practice

**DDL (Schema Changes)**:
```
V{version}__{description}.sql

Examples:
V6__add_user_roles_table.sql
V7__add_audit_columns_to_directory_entries.sql
V8__create_indexes_for_directory_search.sql
```

**Seed Data**:
```
V{version}__seed_{description}.sql

Examples:
V9__seed_default_user_roles.sql
V10__seed_initial_directory_entries.sql
V11__seed_cape_verde_towns.sql
```

#### 4.1.3 File Organization

```
backend/src/main/resources/db/migration/
├── V1__create_directory_entries_table.sql          # DDL
├── V2__create_towns_table.sql                      # DDL
├── V3__create_users_table.sql                      # DDL
├── V4__add_audit_columns.sql                       # DDL
├── V5__create_search_indexes.sql                   # DDL
├── V6__seed_default_towns.sql                      # Seed Data
├── V7__seed_initial_directory_entries.sql          # Seed Data
└── V8__seed_user_roles.sql                         # Seed Data
```

### 4.2 Migration Best Practices

#### 4.2.1 DDL Migration Template

```sql
-- V6__add_audit_columns_to_directory_entries.sql
-- Add auditing columns to directory_entries table

-- Add audit columns
ALTER TABLE directory_entries 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_directory_entries_created_by 
ON directory_entries(created_by);

CREATE INDEX IF NOT EXISTS idx_directory_entries_updated_by 
ON directory_entries(updated_by);

-- Add constraints if needed
ALTER TABLE directory_entries 
ADD CONSTRAINT chk_audit_fields_not_null 
CHECK (created_at IS NOT NULL AND updated_at IS NOT NULL);
```

#### 4.2.2 Seed Data Migration Template

```sql
-- V7__seed_cape_verde_towns.sql
-- Seed initial town data for Cape Verde - Brava Island

INSERT INTO towns (
    id, name, slug, description, latitude, longitude, 
    population, elevation, founded, created_at, updated_at
) VALUES 
(
    gen_random_uuid(),
    'Nova Sintra',
    'nova-sintra',
    'The capital and largest town of Brava Island, situated in the interior mountains.',
    14.8719, -24.7145,
    '1,500',
    '500m',
    '1462',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    gen_random_uuid(),
    'Fajã d''Água',
    'faja-dagua',
    'A picturesque coastal village known for its black sand beach and natural beauty.',
    14.8588, -24.7578,
    '300',
    '50m',
    '1500s',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

### 4.3 Environment-Specific Considerations

#### 4.3.1 Development vs Production Data

**Development Seed Data** (`V*__seed_dev_*.sql`):
```sql
-- V8__seed_dev_test_entries.sql
-- Development-only test data (conditionally applied)

-- Only apply in development environment
-- This can be controlled via Flyway placeholders or profiles
```

#### 4.3.2 Rollback Strategies

- **DDL Changes**: Create corresponding `U{version}__{description}.sql` for complex rollbacks
- **Data Changes**: Include rollback instructions in comments
- **Testing**: Always test migrations on database copy first

### 4.4 Migration Validation

```kotlin
// Integration test for migration validation
@TestMethodOrder(OrderAnnotation::class)
class DatabaseMigrationTest {
    
    @Test
    @Order(1)
    fun `should apply all migrations successfully`() {
        // Verify all migrations execute without errors
    }
    
    @Test
    @Order(2)
    fun `should have correct table structure after migration`() {
        // Verify expected columns, indexes, and constraints exist
    }
    
    @Test
    @Order(3)
    fun `should have seed data in correct format`() {
        // Verify seed data is properly inserted and valid
    }
}
```

---

## 5. API Design Standards

### 5.1 RESTful Conventions

#### 5.1.1 HTTP Methods and Status Codes

| Operation | HTTP Method | Success Status | Error Status |
|-----------|-------------|----------------|--------------|
| Create    | POST        | 201 Created    | 400, 409, 422 |
| Read (Single) | GET     | 200 OK         | 404 |
| Read (List) | GET       | 200 OK         | 400 |
| Update    | PUT         | 200 OK         | 400, 404, 409, 422 |
| Delete    | DELETE      | 204 No Content | 404 |

#### 5.1.2 Resource Naming Patterns

```
✅ Good:
GET  /api/v1/directory/entries
POST /api/v1/directory/entries
GET  /api/v1/directory/entries/{id}
PUT  /api/v1/directory/entries/{id}
DELETE /api/v1/directory/entries/{id}
GET  /api/v1/directory/slug/{slug}

❌ Avoid:
GET /api/v1/getEntries
POST /api/v1/createEntry
GET /api/v1/entries/getById/{id}
```

### 5.2 Response Consistency

#### 5.2.1 Single Item Responses

```kotlin
// Standard successful response
ApiResponse<DirectoryEntryDto>(
    data = entryDto,
    timestamp = LocalDateTime.now(),
    status = 200
)

// JSON output:
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Casa do Bacalhau",
    "category": "Restaurant",
    // ... other fields
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 200
}
```

#### 5.2.2 Paginated Responses

```kotlin
// Standard paginated response
PagedApiResponse<DirectoryEntryDto>(
    data = listOf(entryDto1, entryDto2),
    pageable = PageableInfo(
        page = 0,
        size = 20,
        totalElements = 50,
        totalPages = 3,
        first = true,
        last = false
    ),
    timestamp = LocalDateTime.now(),
    status = 200
)
```

### 5.3 Query Parameter Standards

#### 5.3.1 Filtering

```
GET /api/v1/directory/entries?category=Restaurant&town=Nova%20Sintra
GET /api/v1/directory/entries?category=Hotel
```

#### 5.3.2 Pagination

```
GET /api/v1/directory/entries?page=0&size=20
GET /api/v1/directory/entries?page=1&size=10&sort=name,asc
```

#### 5.3.3 Search

```
GET /api/v1/directory/entries?search=seafood
GET /api/v1/directory/entries?name=Casa&description=traditional
```

---

## 6. Database & Persistence Standards

### 6.1 Entity Design Standards

#### 6.1.1 Base Entity Pattern

```kotlin
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseEntity {
    @Id
    @GeneratedValue
    var id: UUID? = null
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    lateinit var createdAt: LocalDateTime
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    lateinit var updatedAt: LocalDateTime
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: String? = null
    
    @LastModifiedBy
    @Column(name = "updated_by")
    var lastModifiedBy: String? = null
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as BaseEntity
        return id != null && id == other.id
    }
    
    override fun hashCode(): Int {
        return id?.hashCode() ?: 31
    }
}
```

#### 6.1.2 Entity Implementation

```kotlin
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry : BaseEntity() {
    
    @Column(nullable = false)
    @Size(min = 2, max = 100)
    lateinit var name: String
    
    @Column(unique = true, nullable = false)
    lateinit var slug: String
    
    @Column(length = 2048)
    lateinit var description: String
    
    // Additional fields...
}
```

### 6.2 Repository Standards

#### 6.2.1 Repository Interface Design

```kotlin
@Repository
interface DirectoryEntryRepository : JpaRepository<DirectoryEntry, UUID> {
    
    // Query method naming conventions
    fun findByCategoryIgnoreCase(category: String): List<DirectoryEntry>
    fun findByCategoryIgnoreCase(category: String, pageable: Pageable): Page<DirectoryEntry>
    fun findByTownIgnoreCase(town: String, pageable: Pageable): Page<DirectoryEntry>
    fun findByCategoryIgnoreCaseAndTownIgnoreCase(
        category: String, 
        town: String, 
        pageable: Pageable
    ): Page<DirectoryEntry>
    
    // Custom query for complex searches
    @Query("""
        SELECT de FROM DirectoryEntry de 
        WHERE (:category IS NULL OR LOWER(de.category) = LOWER(:category))
        AND (:town IS NULL OR LOWER(de.town) = LOWER(:town))
        AND (:search IS NULL OR LOWER(de.name) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(de.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    fun findByFilters(
        @Param("category") category: String?,
        @Param("town") town: String?,
        @Param("search") search: String?,
        pageable: Pageable
    ): Page<DirectoryEntry>
    
    // Existence checks
    fun existsBySlug(slug: String): Boolean
    fun findBySlug(slug: String): DirectoryEntry?
}
```

### 6.3 Transaction Management

#### 6.3.1 Service Layer Transactions

```kotlin
@Service
@Transactional(readOnly = true) // Default to read-only
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository
) {
    
    // Read operations (inherited read-only transaction)
    fun getEntryById(id: UUID): DirectoryEntryDto {
        return repository.findById(id)
            .map { it.toDto() }
            .orElseThrow { ResourceNotFoundException("Entry not found: $id") }
    }
    
    // Write operations (override with read-write transaction)
    @Transactional(readOnly = false)
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        // Validation and business logic
        val entity = createEntityFromRequest(request)
        val savedEntity = repository.save(entity)
        return savedEntity.toDto()
    }
    
    @Transactional(readOnly = false)
    fun updateEntry(id: UUID, request: CreateEntryRequestDto): DirectoryEntryDto {
        val existingEntity = repository.findById(id)
            .orElseThrow { ResourceNotFoundException("Entry not found: $id") }
            
        // Update logic with business validation
        updateEntityFromRequest(existingEntity, request)
        val savedEntity = repository.save(existingEntity)
        return savedEntity.toDto()
    }
    
    @Transactional(readOnly = false)
    fun deleteEntry(id: UUID) {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException("Entry not found: $id")
        }
        repository.deleteById(id)
    }
}
```

---

## 7. DTO & Mapping Standards

### 7.1 DTO Design Patterns

#### 7.1.1 Response DTOs (Polymorphic)

```kotlin
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME, 
    include = JsonTypeInfo.As.PROPERTY, 
    property = "category", 
    visible = true
)
@JsonSubTypes(
    JsonSubTypes.Type(value = RestaurantDto::class, name = "Restaurant"),
    JsonSubTypes.Type(value = HotelDto::class, name = "Hotel"),
    JsonSubTypes.Type(value = BeachDto::class, name = "Beach"),
    JsonSubTypes.Type(value = LandmarkDto::class, name = "Landmark")
)
abstract class DirectoryEntryDto {
    abstract val id: UUID
    abstract val name: String
    abstract val slug: String
    abstract val description: String
    abstract val category: String
    abstract val town: String
    abstract val latitude: Double
    abstract val longitude: Double
    abstract val imageUrl: String?
    abstract val rating: Double?
    abstract val reviewCount: Int
    
    @get:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    abstract val createdAt: LocalDateTime
    
    @get:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    abstract val updatedAt: LocalDateTime
    
    // Audit fields (when user tracking is implemented)
    abstract val createdBy: String?
    abstract val lastModifiedBy: String?
}
```

#### 7.1.2 Request DTOs (Validated)

```kotlin
data class CreateEntryRequestDto(
    @field:NotBlank(message = "{field.required}")
    @field:Size(min = 2, max = 100, message = "{field.size.min.max}")
    val name: String,
    
    @field:NotBlank(message = "{field.required}")
    @field:Size(max = 2048, message = "{field.size.max}")
    val description: String,
    
    @field:NotBlank(message = "{field.required}")
    @field:Pattern(
        regexp = "^(Restaurant|Hotel|Beach|Landmark)$",
        message = "{business.category.invalid}"
    )
    val category: String,
    
    @field:NotBlank(message = "{field.required}")
    val town: String,
    
    @field:DecimalMin(value = "-90.0", message = "{business.coordinates.invalid}")
    @field:DecimalMax(value = "90.0", message = "{business.coordinates.invalid}")
    val latitude: Double,
    
    @field:DecimalMin(value = "-180.0", message = "{business.coordinates.invalid}")
    @field:DecimalMax(value = "180.0", message = "{business.coordinates.invalid}")
    val longitude: Double,
    
    @field:URL(message = "{field.url.invalid}")
    val imageUrl: String?,
    
    @field:Valid
    val details: DetailsDto?
)
```

### 7.2 Mapping Standards

#### 7.2.1 Entity to DTO Mapping

```kotlin
/**
 * Extension function to map DirectoryEntry entities to DTOs.
 * Handles polymorphic mapping based on discriminator value.
 */
fun DirectoryEntry.toDto(): DirectoryEntryDto {
    val entityId = this.id 
        ?: throw IllegalStateException("Cannot map entity with null ID to DTO")
    
    return when (this) {
        is Restaurant -> RestaurantDto(
            id = entityId,
            name = this.name,
            slug = this.slug,
            description = this.description,
            town = this.town,
            latitude = this.latitude,
            longitude = this.longitude,
            imageUrl = this.imageUrl,
            rating = this.rating,
            reviewCount = this.reviewCount,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt,
            createdBy = this.createdBy,
            lastModifiedBy = this.lastModifiedBy,
            details = RestaurantDetailsDto(
                phoneNumber = this.phoneNumber.orEmpty(),
                openingHours = this.openingHours.orEmpty(),
                cuisine = this.cuisine?.split(',')
                    ?.map { it.trim() }
                    ?.filter { it.isNotBlank() }
                    ?: emptyList()
            ),
            category = "Restaurant"
        )
        
        is Hotel -> HotelDto(
            // Similar mapping for Hotel...
        )
        
        // Handle other types...
        else -> throw IllegalStateException(
            "Unsupported DirectoryEntry type: ${this::class.simpleName}"
        )
    }
}
```

#### 7.2.2 Request DTO to Entity Mapping

```kotlin
/**
 * Service method to create entity from request DTO.
 * Includes business logic and validation.
 */
private fun createEntityFromRequest(request: CreateEntryRequestDto): DirectoryEntry {
    val entity = when (request.category) {
        "Restaurant" -> {
            val details = request.details as? CreateRestaurantDetailsDto
            Restaurant().apply {
                this.phoneNumber = details?.phoneNumber
                this.openingHours = details?.openingHours
                this.cuisine = details?.cuisine?.joinToString(",")
            }
        }
        "Hotel" -> {
            val details = request.details as? CreateHotelDetailsDto
            Hotel().apply {
                this.phoneNumber = details?.phoneNumber
                this.amenities = details?.amenities?.joinToString(",")
            }
        }
        "Beach" -> Beach()
        "Landmark" -> Landmark()
        else -> throw IllegalArgumentException("Invalid category: ${request.category}")
    }
    
    // Set common fields
    entity.apply {
        name = request.name
        description = request.description
        town = request.town
        latitude = request.latitude
        longitude = request.longitude
        imageUrl = request.imageUrl
        slug = generateSlug(request.name)
    }
    
    return entity
}

/**
 * Generate URL-friendly slug from name.
 */
private fun generateSlug(name: String): String {
    return name.lowercase()
        .replace(Regex("\\s+"), "-")
        .replace(Regex("[^a-z0-9-]"), "")
        .replace(Regex("-+"), "-")
        .trim('-')
}
```

---

## 8. Controller & Service Layer Standards

### 8.1 Controller Standards

#### 8.1.1 Controller Structure

```kotlin
@RestController
@RequestMapping("/api/v1/directory")
@Validated // Enable method-level validation
class DirectoryEntryController(
    private val service: DirectoryEntryService
) {
    
    companion object {
        private val logger = LoggerFactory.getLogger(DirectoryEntryController::class.java)
    }
    
    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    fun createEntry(
        @Valid @RequestBody request: CreateEntryRequestDto
    ): ApiResponse<DirectoryEntryDto> {
        logger.info("Creating new directory entry: ${request.name}")
        
        val createdEntry = service.createEntry(request)
        
        logger.info("Successfully created directory entry with ID: ${createdEntry.id}")
        return ApiResponse(
            data = createdEntry, 
            status = HttpStatus.CREATED.value()
        )
    }
    
    @GetMapping("/entries")
    fun getEntries(
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) town: String?,
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "0") @Min(0) page: Int,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) size: Int,
        @RequestParam(defaultValue = "createdAt") sort: String,
        @RequestParam(defaultValue = "desc") direction: String
    ): PagedApiResponse<DirectoryEntryDto> {
        
        val sortDirection = if (direction.lowercase() == "asc") {
            Sort.Direction.ASC
        } else {
            Sort.Direction.DESC
        }
        
        val pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort))
        val resultPage = service.getEntries(category, town, search, pageable)
        
        return PagedApiResponse.from(resultPage)
    }
    
    @GetMapping("/entries/{id}")
    fun getEntryById(
        @PathVariable id: UUID
    ): ApiResponse<DirectoryEntryDto> {
        val entry = service.getEntryById(id)
        return ApiResponse(data = entry)
    }
    
    @PutMapping("/entries/{id}")
    fun updateEntry(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CreateEntryRequestDto
    ): ApiResponse<DirectoryEntryDto> {
        logger.info("Updating directory entry: $id")
        
        val updatedEntry = service.updateEntry(id, request)
        
        logger.info("Successfully updated directory entry: $id")
        return ApiResponse(data = updatedEntry)
    }
    
    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntry(@PathVariable id: UUID) {
        logger.info("Deleting directory entry: $id")
        
        service.deleteEntry(id)
        
        logger.info("Successfully deleted directory entry: $id")
    }
}
```

#### 8.1.2 Controller Best Practices

- **Validation**: Always use `@Valid` on request bodies
- **Logging**: Log entry and exit points for write operations
- **Parameters**: Validate query parameters with constraints
- **Response Wrapping**: Always return `ApiResponse` or `PagedApiResponse`
- **Status Codes**: Use `@ResponseStatus` for non-200 responses
- **Documentation**: Include clear method documentation

#### 8.1.3 Standard Response Envelopes

All controllers **must** return the shared response envelopes defined in [`com/nosilha/core/shared/api/ApiResponse.kt`](../backend/src/main/kotlin/com/nosilha/core/shared/api/ApiResponse.kt):

- Successful single-resource responses: `ApiResponse<T>`
- Paginated list responses: `PagedApiResponse<T>` (prefer `PagedApiResponse.from(page)`)
- Error responses: `ErrorResponse` for general failures, `ValidationErrorResponse` (with `FieldError` entries) for bean validation issues

This guarantees consistent `data`, `status`, and `timestamp` fields across the API and lets clients rely on a single contract. Controllers should never return bare DTOs/maps; convert service results into the envelopes inside the controller boundary and allow the global `RestExceptionHandler` to produce the corresponding error wrapper:

```kotlin
@ExceptionHandler(MethodArgumentNotValidException::class)
fun handleValidation(ex: MethodArgumentNotValidException, request: HttpServletRequest): ResponseEntity<ValidationErrorResponse> {
    val details = ex.bindingResult.fieldErrors.map {
        ValidationErrorResponse.FieldError(field = it.field, rejectedValue = it.rejectedValue, message = it.defaultMessage ?: "Invalid value")
    }

    return ResponseEntity.badRequest().body(
        ValidationErrorResponse(
            error = "Validation failed",
            details = details,
            path = request.requestURI
        )
    )
}
```

If a controller needs to override the HTTP status (e.g., `201 Created`), set it via `@ResponseStatus` and pass the same numeric value to the `status` property of the response wrapper for parity with the serialized payload.

### 8.2 Service Layer Standards

#### 8.2.1 Service Structure

```kotlin
@Service
@Transactional(readOnly = true)
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository
) {
    
    companion object {
        private val logger = LoggerFactory.getLogger(DirectoryEntryService::class.java)
    }
    
    @Transactional(readOnly = false)
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        logger.info("Creating directory entry: ${request.name}")
        
        // Business validation
        validateBusinessRules(request)
        
        // Create and save entity
        val entity = createEntityFromRequest(request)
        val savedEntity = repository.save(entity)
        
        logger.info("Created directory entry with ID: ${savedEntity.id}")
        return savedEntity.toDto()
    }
    
    fun getEntries(
        category: String?,
        town: String?,
        search: String?,
        pageable: Pageable
    ): Page<DirectoryEntryDto> {
        logger.debug("Fetching entries with filters - category: $category, town: $town, search: $search")
        
        val entityPage = repository.findByFilters(category, town, search, pageable)
        
        logger.debug("Found ${entityPage.totalElements} entries")
        return entityPage.map { it.toDto() }
    }
    
    fun getEntryById(id: UUID): DirectoryEntryDto {
        logger.debug("Fetching entry by ID: $id")
        
        return repository.findById(id)
            .map { it.toDto() }
            .orElseThrow { 
                ResourceNotFoundException("Directory entry with ID '$id' not found")
            }
    }
    
    @Transactional(readOnly = false)
    fun updateEntry(id: UUID, request: CreateEntryRequestDto): DirectoryEntryDto {
        logger.info("Updating entry: $id")
        
        val existingEntity = repository.findById(id)
            .orElseThrow { ResourceNotFoundException("Entry not found: $id") }
        
        // Business validation
        validateBusinessRules(request, existingEntity)
        
        // Update entity
        updateEntityFromRequest(existingEntity, request)
        val savedEntity = repository.save(existingEntity)
        
        logger.info("Updated entry: $id")
        return savedEntity.toDto()
    }
    
    @Transactional(readOnly = false)
    fun deleteEntry(id: UUID) {
        logger.info("Deleting entry: $id")
        
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException("Entry not found: $id")
        }
        
        repository.deleteById(id)
        logger.info("Deleted entry: $id")
    }
    
    /**
     * Validates business rules for entry creation/update.
     */
    private fun validateBusinessRules(
        request: CreateEntryRequestDto, 
        existingEntity: DirectoryEntry? = null
    ) {
        // Check for duplicate slug
        val newSlug = generateSlug(request.name)
        if (existingEntity?.slug != newSlug && repository.existsBySlug(newSlug)) {
            throw BusinessException("An entry with name '${request.name}' already exists")
        }
        
        // Validate category-specific business rules
        when (request.category) {
            "Restaurant" -> validateRestaurantDetails(request.details)
            "Hotel" -> validateHotelDetails(request.details)
            // Add other category validations...
        }
    }
    
    private fun validateRestaurantDetails(details: DetailsDto?) {
        if (details !is CreateRestaurantDetailsDto?) return
        
        // Business rule: Restaurants should have at least one cuisine type
        if (details?.cuisine.isNullOrEmpty()) {
            throw BusinessException("Restaurant must specify at least one cuisine type")
        }
    }
}
```

#### 8.2.2 Service Layer Best Practices

- **Transaction Boundaries**: Default to `readOnly = true`, override for write operations
- **Business Logic**: Keep business rules in service layer, not controllers
- **Exception Handling**: Throw domain-specific exceptions, let GlobalExceptionHandler handle them
- **Logging**: Use appropriate log levels (debug for queries, info for operations)
- **Validation**: Implement business rule validation separate from Bean Validation
- **DTO Mapping**: Service layer responsible for entity-to-DTO conversion

---

## 9. Error Handling Standards

### 9.1 Exception Hierarchy

```kotlin
// Base exception for business logic violations
open class BusinessException(message: String) : RuntimeException(message)

// Specific business exceptions
class ResourceNotFoundException(message: String) : BusinessException(message)
class DuplicateResourceException(message: String) : BusinessException(message)
class InvalidOperationException(message: String) : BusinessException(message)

// Validation exceptions (handled by Bean Validation)
// These are automatically handled by Spring's validation framework
```

### 9.2 Global Exception Handler Enhancement

```kotlin
@ControllerAdvice
class GlobalExceptionHandler {
    
    companion object {
        private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
    }
    
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn("Resource not found: ${ex.message}", ex)
        
        val errorResponse = ErrorResponse(
            error = "Resource Not Found",
            message = ex.message ?: "The requested resource was not found",
            path = request.requestURI,
            status = HttpStatus.NOT_FOUND.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }
    
    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn("Business rule violation: ${ex.message}", ex)
        
        val errorResponse = ErrorResponse(
            error = "Business Rule Violation",
            message = ex.message ?: "A business rule was violated",
            path = request.requestURI,
            status = HttpStatus.UNPROCESSABLE_ENTITY.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
    }
    
    @ExceptionHandler(MethodArgumentNotValidException::class, BindException::class)
    fun handleValidationErrors(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ValidationErrorResponse> {
        logger.warn("Validation failed: ${ex.message}")
        
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
    
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ValidationErrorResponse> {
        logger.warn("Constraint violation: ${ex.message}")
        
        val validationErrors = ex.constraintViolations.map { violation ->
            ValidationErrorResponse.FieldError(
                field = violation.propertyPath.toString(),
                rejectedValue = violation.invalidValue,
                message = violation.message
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
}
```

### 9.3 Error Response Standards

#### 9.3.1 Standard Error Response

```json
{
  "error": "Resource Not Found",
  "message": "Directory entry with ID '123e4567-e89b-12d3-a456-426614174000' not found",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/directory/entries/123e4567-e89b-12d3-a456-426614174000",
  "status": 404
}
```

#### 9.3.2 Validation Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "rejectedValue": "",
      "message": "Name is required"
    },
    {
      "field": "latitude",
      "rejectedValue": 95.0,
      "message": "Latitude must be between -90 and 90"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/directory/entries",
  "status": 400
}
```

---

## 10. Future-Ready Standards

### 10.1 Role-Based Access Control (RBAC) Preparation

#### 10.1.1 Security Configuration Placeholder

```kotlin
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig {
    
    // Current JWT-based security will be enhanced with RBAC
    
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/v1/directory/entries").permitAll() // Read access
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/directory/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/directory/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            }
            .build()
    }
}
```

#### 10.1.2 Method-Level Security

```kotlin
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
    private val service: DirectoryEntryService
) {
    
    // Future: Add role-based security annotations
    @PostMapping("/entries")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    fun createEntry(@Valid @RequestBody request: CreateEntryRequestDto): ApiResponse<DirectoryEntryDto> {
        // Implementation...
    }
    
    @PutMapping("/entries/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('EDITOR') and @securityService.canEdit(#id))")
    fun updateEntry(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CreateEntryRequestDto
    ): ApiResponse<DirectoryEntryDto> {
        // Implementation...
    }
}
```

### 10.2 Internationalization (i18n) Preparation

#### 10.2.1 Message Source Configuration

```kotlin
@Configuration
class InternationalizationConfig {
    
    @Bean
    fun messageSource(): MessageSource {
        val messageSource = ReloadableResourceBundleMessageSource()
        messageSource.setBasename("classpath:messages")
        messageSource.setDefaultEncoding("UTF-8")
        messageSource.setCacheSeconds(3600)
        return messageSource
    }
    
    @Bean
    fun localeResolver(): LocaleResolver {
        val localeResolver = SessionLocaleResolver()
        localeResolver.setDefaultLocale(Locale.ENGLISH) // Default to English
        return localeResolver
    }
    
    @Bean
    fun localeChangeInterceptor(): LocaleChangeInterceptor {
        val interceptor = LocaleChangeInterceptor()
        interceptor.paramName = "lang" // ?lang=pt for Portuguese
        return interceptor
    }
}
```

#### 10.2.2 Validation Messages (i18n Ready)

**src/main/resources/messages.properties** (English - default):
```properties
# Field validation messages
field.required=This field is required
field.size.min=Must be at least {0} characters
field.size.max=Must not exceed {0} characters
field.email.invalid=Must be a valid email address
field.url.invalid=Must be a valid URL

# Business validation messages
business.slug.duplicate=An entry with this name already exists
business.category.invalid=Invalid category specified
business.coordinates.invalid=Coordinates must be within valid geographic bounds

# Entity names
entity.restaurant=Restaurant
entity.hotel=Hotel
entity.beach=Beach
entity.landmark=Landmark
```

**src/main/resources/messages_pt.properties** (Portuguese):
```properties
# Field validation messages
field.required=Este campo é obrigatório
field.size.min=Deve ter pelo menos {0} caracteres
field.size.max=Não deve exceder {0} caracteres
field.email.invalid=Deve ser um endereço de email válido
field.url.invalid=Deve ser uma URL válida

# Business validation messages
business.slug.duplicate=Já existe uma entrada com este nome
business.category.invalid=Categoria inválida especificada
business.coordinates.invalid=As coordenadas devem estar dentro dos limites geográficos válidos

# Entity names
entity.restaurant=Restaurante
entity.hotel=Hotel
entity.beach=Praia
entity.landmark=Marco
```

#### 10.2.3 Localized Error Responses

```kotlin
@ControllerAdvice
class GlobalExceptionHandler(
    private val messageSource: MessageSource
) {
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(
        ex: MethodArgumentNotValidException,
        request: HttpServletRequest,
        locale: Locale
    ): ResponseEntity<ValidationErrorResponse> {
        
        val fieldErrors = ex.bindingResult.fieldErrors
        val validationErrors = fieldErrors.map { fieldError ->
            ValidationErrorResponse.FieldError(
                field = fieldError.field,
                rejectedValue = fieldError.rejectedValue,
                message = messageSource.getMessage(
                    fieldError.defaultMessage ?: "field.invalid",
                    fieldError.arguments,
                    fieldError.defaultMessage ?: "Invalid value",
                    locale
                )
            )
        }
        
        val errorResponse = ValidationErrorResponse(
            error = messageSource.getMessage("error.validation.failed", null, "Validation failed", locale),
            details = validationErrors,
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }
}
```

---

## 11. Code Organization & Development Guidelines

### 11.1 Package Structure (Spring Modulith Architecture)

**Note**: This project follows Spring Modulith modular architecture with enforced module boundaries. See [`SPRING_MODULITH.md`](SPRING_MODULITH.md) for comprehensive module documentation.

```
com.nosilha.core/
├── shared/                              # Shared Kernel Module
│   ├── PackageInfo.kt                  # Module API declaration
│   ├── domain/                         # Shared domain infrastructure
│   │   ├── PackageInfo.kt             # Public API marker
│   │   └── AuditableEntity.kt         # Base entity with audit fields
│   ├── events/                         # Event infrastructure
│   │   ├── PackageInfo.kt             # Public API marker
│   │   ├── DomainEvent.kt             # Base domain event interface
│   │   └── ApplicationModuleEvent.kt  # Module event base
│   ├── api/                            # Shared API components
│   │   └── PackageInfo.kt             # Public API marker
│   ├── config/                         # Shared configuration
│   │   └── PackageInfo.kt             # Public API marker
│   └── exception/                      # Global exception handling
│       ├── PackageInfo.kt             # Public API marker
│       ├── GlobalExceptionHandler.kt
│       ├── ResourceNotFoundException.kt
│       └── BusinessException.kt
│
├── auth/                                # Authentication Module
│   ├── PackageInfo.kt                  # Module API declaration
│   ├── api/                            # Public REST endpoints
│   │   └── AuthController.kt          # Login, logout, token refresh
│   ├── security/                       # Security components (internal)
│   │   ├── JwtAuthenticationFilter.kt
│   │   └── SecurityConfig.kt
│   ├── domain/                         # Auth business logic (internal)
│   │   ├── JwtAuthenticationService.kt
│   │   └── UserService.kt
│   └── events/                         # Auth domain events (public)
│       ├── UserLoggedInEvent.kt
│       └── UserLoggedOutEvent.kt
│
├── directory/                           # Directory Management Module
│   ├── PackageInfo.kt                  # Module API declaration
│   ├── api/                            # Public REST endpoints
│   │   └── DirectoryController.kt     # /api/v1/directory/* endpoints
│   ├── domain/                         # Directory business logic (internal)
│   │   ├── DirectoryEntry.kt          # Base entity (STI pattern)
│   │   ├── Restaurant.kt              # Restaurant subclass
│   │   ├── Hotel.kt                   # Hotel subclass
│   │   ├── Landmark.kt                # Landmark subclass
│   │   ├── Beach.kt                   # Beach subclass
│   │   └── DirectoryService.kt        # Business logic & event publishing
│   ├── repository/                     # Data access layer (internal)
│   │   └── DirectoryEntryRepository.kt # JPA repository
│   └── events/                         # Directory domain events (public)
│       ├── DirectoryEntryCreatedEvent.kt
│       ├── DirectoryEntryUpdatedEvent.kt
│       └── DirectoryEntryDeletedEvent.kt
│
├── media/                               # Media Processing Module
│   ├── PackageInfo.kt                  # Module API declaration
│   ├── api/                            # Public REST endpoints
│   │   └── MediaController.kt          # File upload endpoints
│   ├── config/                         # Media-specific configuration (internal)
│   ├── domain/                         # Media business logic (internal)
│   │   └── MediaService.kt             # GCS, Vision API, event listeners
│   ├── repository/                     # Data access layer (internal)
│   │   └── FirestoreMediaRepository.kt # Metadata storage
│   └── events/                         # Media domain events (public)
│       ├── MediaUploadedEvent.kt
│       └── MediaProcessedEvent.kt
│
└── contentactions/                      # Content Actions Module
    ├── PackageInfo.kt                  # Module API declaration
    ├── api/                            # Public REST endpoints
    │   └── ContentActionsController.kt # Reactions, suggestions endpoints
    ├── domain/                         # Content actions business logic (internal)
    │   ├── ContentActionService.kt     # Reaction & suggestion logic
    │   └── Reaction.kt                 # Reaction entity
    ├── repository/                     # Data access layer (internal)
    │   └── ReactionRepository.kt       # JPA repository
    └── events/                         # Content actions domain events (public)
        └── ReactionCreatedEvent.kt
```

**Key Module Rules:**
- ✅ **Shared Kernel**: Foundation layer providing common infrastructure (events, audit, exceptions)
- ✅ **Module Independence**: Each module (`auth`, `directory`, `media`) has isolated domain/repository layers
- ✅ **Event-Driven Communication**: Modules communicate via `@ApplicationModuleListener` without direct dependencies
- ✅ **Public API**: Only `api/` (controllers) and `events/` are public; domain/repository/config are internal
- ✅ **Verification**: `ModularityTests.kt` enforces zero circular dependencies in CI/CD

### 11.2 Naming Conventions

#### 11.2.1 Classes

- **Entities**: Singular noun (e.g., `DirectoryEntry`, `Restaurant`)
- **DTOs**: Entity name + purpose (e.g., `DirectoryEntryDto`, `CreateEntryRequestDto`)
- **Services**: Entity name + Service (e.g., `DirectoryEntryService`)
- **Controllers**: Entity name + Controller (e.g., `DirectoryEntryController`)
- **Repositories**: Entity name + Repository (e.g., `DirectoryEntryRepository`)

#### 11.2.2 Methods

- **Repository queries**: `findBy*`, `existsBy*`, `countBy*`
- **Service methods**: Business-focused verbs (`createEntry`, `updateEntry`, `getEntry`)
- **Controller methods**: HTTP action-focused (`createEntry`, `getEntries`, `updateEntry`)

#### 11.2.3 Properties and Variables

- **Entity fields**: camelCase (`phoneNumber`, `openingHours`)
- **DTO fields**: match entity fields for consistency
- **Database columns**: snake_case (`phone_number`, `opening_hours`)

### 11.3 Documentation Standards

#### 11.3.1 KDoc Standards

```kotlin
/**
 * Service for managing directory entries on the Nosilha platform.
 *
 * This service handles the business logic for creating, reading, updating,
 * and deleting directory entries such as restaurants, hotels, beaches, and landmarks.
 * It integrates with the repository layer for data persistence and provides
 * DTO mapping for API responses.
 *
 * @property repository The JPA repository for directory entry data access
 * @author Nos Ilha Development Team
 * @since 1.0.0
 */
@Service
@Transactional(readOnly = true)
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository
) {
    
    /**
     * Creates a new directory entry from the provided request data.
     *
     * This method performs business validation, creates the appropriate entity
     * type based on the category, generates a unique slug, and persists the
     * entity to the database.
     *
     * @param request The DTO containing all necessary data for the new entry
     * @return The DTO representation of the newly created and saved entry
     * @throws BusinessException if business rules are violated (e.g., duplicate slug)
     * @throws IllegalArgumentException if the category is not supported
     */
    @Transactional(readOnly = false)
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        // Implementation...
    }
}
```

#### 11.3.2 Inline Comments

```kotlin
private fun validateBusinessRules(request: CreateEntryRequestDto, existingEntity: DirectoryEntry? = null) {
    // Generate slug and check for duplicates
    val newSlug = generateSlug(request.name)
    if (existingEntity?.slug != newSlug && repository.existsBySlug(newSlug)) {
        throw BusinessException("An entry with name '${request.name}' already exists")
    }
    
    // Validate coordinates are within reasonable bounds for Cape Verde
    if (request.latitude < 14.0 || request.latitude > 17.5) {
        throw BusinessException("Latitude must be within Cape Verde's geographic bounds")
    }
    
    if (request.longitude < -25.5 || request.longitude > -22.0) {
        throw BusinessException("Longitude must be within Cape Verde's geographic bounds")
    }
}
```

### 11.4 Testing Standards

#### 11.4.1 Test Organization

```
src/test/kotlin/
├── integration/               # Integration tests
│   ├── DirectoryEntryControllerIT.kt
│   └── DatabaseMigrationIT.kt
├── unit/                      # Unit tests
│   ├── service/
│   │   └── DirectoryEntryServiceTest.kt
│   ├── controller/
│   │   └── DirectoryEntryControllerTest.kt
│   └── validation/
│       └── CreateEntryRequestDtoTest.kt
└── testcontainers/           # Testcontainers configuration
    └── PostgreSQLTestContainer.kt
```

#### 11.4.2 Test Naming

```kotlin
class DirectoryEntryServiceTest {
    
    @Test
    fun `createEntry should create restaurant with valid details`() {
        // Test implementation
    }
    
    @Test
    fun `createEntry should throw BusinessException when slug already exists`() {
        // Test implementation
    }
    
    @Test
    fun `getEntryById should return correct DTO when entry exists`() {
        // Test implementation
    }
    
    @Test
    fun `getEntryById should throw ResourceNotFoundException when entry does not exist`() {
        // Test implementation
    }
}
```

---

## 🔄 Migration Guide

### Phase 1: Auditing Migration
1. Create `BaseEntity` with Spring Data JPA auditing
2. Configure `@EnableJpaAuditing` and `AuditorAware`
3. Update existing entities to extend `BaseEntity`
4. Create migration script to add audit columns
5. Remove manual `@PrePersist`/`@PreUpdate` callbacks

### Phase 2: Validation Implementation
1. Add Bean Validation annotations to existing DTOs
2. Update controllers to use `@Valid`
3. Enhance `GlobalExceptionHandler` for validation errors
4. Create validation message properties files
5. Test validation with integration tests

### Phase 3: Database Migration Standards
1. Reorganize existing migration files by type (DDL vs seed)
2. Establish naming conventions for new migrations
3. Create template files for DDL and seed migrations
4. Document migration best practices

### Phase 4: Future Enhancements
1. Implement RBAC when user management is ready
2. Add i18n support for multi-language content
3. Enhance error messages with localization
4. Implement content localization for DTOs

---

## 📚 Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Bean Validation Specification](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
- [Spring Data JPA Auditing](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#auditing)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Jackson Polymorphism](https://www.baeldung.com/jackson-inheritance)
- [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: March 2024
