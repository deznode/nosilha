# Nos Ilha API Coding Standards

Quick reference for backend patterns. For module architecture, see [spring-modulith.md](spring-modulith.md).

---

## 1. Entity Design

### Base Patterns

- **UUID primary keys** for all entities
- **Extend `AuditableEntity`** for automatic `createdAt`/`updatedAt` timestamps
- **Single Table Inheritance (STI)** for polymorphic entities (DirectoryEntry hierarchy)

### Reference Files

| Pattern | File |
|---------|------|
| Base entity | `apps/api/src/main/kotlin/com/nosilha/core/shared/domain/AuditableEntity.kt` |
| STI base | `apps/api/src/main/kotlin/com/nosilha/core/places/domain/DirectoryEntry.kt` |
| STI subclass | `apps/api/src/main/kotlin/com/nosilha/core/places/domain/Restaurant.kt` |

### STI Pattern

```kotlin
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category")
abstract class DirectoryEntry : AuditableEntity()

@Entity
@DiscriminatorValue("Restaurant")
class Restaurant : DirectoryEntry()
```

---

## 2. Input Validation

### Bean Validation Annotations

| Annotation | Purpose |
|------------|---------|
| `@NotBlank` | Non-null, non-empty string |
| `@Size(min, max)` | String/collection length bounds |
| `@DecimalMin` / `@DecimalMax` | Numeric bounds |
| `@Pattern` | Regex validation |
| `@URL` | Valid URL format |
| `@Valid` | Cascade validation to nested objects |

### Controller Integration

```kotlin
@PostMapping("/entries")
@ResponseStatus(HttpStatus.CREATED)
fun createEntry(@Valid @RequestBody request: CreateEntryRequestDto): ApiResult<DirectoryEntryDto>
```

### Reference Files

| Type | File |
|------|------|
| Request DTO | `apps/api/src/main/kotlin/com/nosilha/core/shared/api/CreateEntryRequestDto.kt` |
| Details DTO | `apps/api/src/main/kotlin/com/nosilha/core/shared/api/RestaurantDetailsDto.kt` |

---

## 3. Flyway Migrations

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| DDL (schema) | `V{n}__{description}.sql` | `V1__create_directory_entries_table.sql` |
| Reference/seed data | `R__{description}.sql` (repeatable, idempotent upserts) in `db/seed/` | `R__seed_towns.sql` |
| One-time data import | `V{n}__{description}.sql` in `db/seed/` | `V18__copy_entry_images_into_gallery_heroes.sql` |

### Location

```
apps/api/src/main/resources/db/
├── migration/   # V__ schema DDL (+ schema-coupled data fixes)
├── seed/        # R__ reference data, V__ one-time imports
└── devdata/     # local profile only
```

Version numbers are one global sequence across `migration/` and `seed/`; check both before picking the next one.

### Best Practices

- Use `IF NOT EXISTS` for idempotent migrations
- Add indexes for frequently queried columns
- Include rollback instructions in comments for complex changes
- Test migrations on database copy before production

---

## 4. API Design

### HTTP Methods and Status Codes

| Operation | Method | Success | Common Errors |
|-----------|--------|---------|---------------|
| Create | POST | 201 Created | 400, 409, 422 |
| Read (single) | GET | 200 OK | 404 |
| Read (list) | GET | 200 OK | 400 |
| Update | PUT | 200 OK | 400, 404, 422 |
| Delete | DELETE | 204 No Content | 404 |

### Resource Naming

```
✅ /api/v1/directory/entries
✅ /api/v1/directory/entries/{id}
✅ /api/v1/directory/slug/{slug}

❌ /api/v1/getEntries
❌ /api/v1/entries/getById/{id}
```

### Query Parameters

| Purpose | Example |
|---------|---------|
| Filtering | `?category=Restaurant&town=Nova%20Sintra` |
| Pagination | `?page=0&size=20&sort=created_at_desc` |
| Search | `?q=seafood` |

---

## 5. Response Envelopes

All controllers use standardized response wrappers from `shared/api/ApiResult.kt`.

### Response Types

| Type | Use Case |
|------|----------|
| `ApiResult<T>` | Single item responses |
| `PagedApiResult<T>` | Paginated list responses |
| `ErrorResponse` | General error responses |
| `ValidationErrorResponse` | Bean validation errors |

### Reference

`apps/api/src/main/kotlin/com/nosilha/core/shared/api/ApiResult.kt`

### Usage

```kotlin
// Single item
return ApiResult(data = entryDto, status = 200)

// Paginated list
return PagedApiResult.from(page)
```

---

## 6. Error Handling

### Exception Mapping

| Exception | HTTP Status | Use Case |
|-----------|-------------|----------|
| `ResourceNotFoundException` | 404 | Entity not found |
| `BusinessException` | 422 | Business rule violation |
| `RateLimitExceededException` | 429 | Rate limit exceeded |
| `MethodArgumentNotValidException` | 400 | Validation failure |
| `IllegalArgumentException` | 400 | Invalid parameter |

### Reference

`apps/api/src/main/kotlin/com/nosilha/core/shared/exception/GlobalExceptionHandler.kt`

### Pattern

Throw domain-specific exceptions in services; `GlobalExceptionHandler` converts them to consistent error responses:

```kotlin
// Service layer
if (!repository.existsById(id)) {
    throw ResourceNotFoundException("Entry not found: $id")
}
```

---

## 7. Logging

### Library

**kotlin-logging** (`io.github.oshai.kotlinlogging`)

### Declaration

Declare at **file level** (outside class):

```kotlin
import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

class MyService {
    fun process() {
        logger.info { "Processing item $itemId" }
    }
}
```

### Log Levels

| Level | Use Case |
|-------|----------|
| `debug` | Query operations, detailed flow |
| `info` | Write operations, significant events |
| `warn` | Recoverable errors, rate limits |
| `error` | Unhandled exceptions, critical failures |

### Lambda Syntax

Always use lambda syntax for lazy evaluation:

```kotlin
logger.debug { "Processing item $itemId" }           // ✅
logger.error(exception) { "Operation failed" }       // ✅

logger.info("Processing {}", item)                   // ❌ Don't use placeholder syntax
```

---

## 8. Naming Conventions

### Classes

| Type | Pattern | Example |
|------|---------|---------|
| Entity | Singular noun | `DirectoryEntry`, `Restaurant` |
| DTO (response) | Entity + Dto | `DirectoryEntryDto`, `RestaurantDto` |
| DTO (request) | Create/Update + Entity + RequestDto | `CreateEntryRequestDto` |
| Service | Entity + Service | `DirectoryEntryService` |
| Controller | Entity + Controller | `DirectoryEntryController` |
| Repository | Entity + Repository | `DirectoryEntryRepository` |

### Methods

| Context | Pattern | Example |
|---------|---------|---------|
| Repository | `findBy*`, `existsBy*`, `countBy*` | `findBySlug()` |
| Service | Business verbs | `createEntry()`, `updateEntry()` |
| Controller | HTTP action verbs | `getEntry()`, `createEntry()` |

### Properties

| Context | Convention | Example |
|---------|------------|---------|
| Kotlin/Java | camelCase | `phoneNumber`, `openingHours` |
| Database | snake_case | `phone_number`, `opening_hours` |

---

## 9. Transaction Management

### Service Layer Pattern

```kotlin
@Service
class DirectoryEntryService {
    // Services that mix reads and writes annotate each method
    @Transactional(readOnly = true)
    fun getEntry(id: UUID) = repository.findById(id)

    @Transactional
    fun createEntry(request: CreateEntryRequestDto) = repository.save(entity)
}
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [spring-modulith.md](spring-modulith.md) | Module architecture and boundaries |
| [api-reference.md](api-reference.md) | API endpoints and examples |
| [testing.md](testing.md) | Testing strategy and tools |
| [api-roadmap.md](../10-product/api-roadmap.md) | Planned improvements |
