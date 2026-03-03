---
paths: apps/api/**
---

# Kotlin Conventions

## Jackson 3.x Imports

Use the `tools.jackson` package for Kotlin module imports (NOT `com.fasterxml.jackson.module`):

```kotlin
import tools.jackson.module.kotlin.jacksonObjectMapper
import tools.jackson.module.kotlin.readValue

private val objectMapper = jacksonObjectMapper()

// Deserialize
val result: MyType = objectMapper.readValue<MyType>(jsonString)

// Serialize
val json = objectMapper.writeValueAsString(myObject)
```

**DON'T**: `import com.fasterxml.jackson.module.kotlin.*` — this is the old Jackson 2.x path.

**Note**: Jackson annotations still use `com.fasterxml.jackson.annotation.*` (e.g., `@JsonFormat`, `@JsonTypeName`). Only the Kotlin module imports changed to `tools.jackson`.

**Note**: For test classes and Spring-injected serialization, use `JsonMapper` (not `ObjectMapper`):
```kotlin
@Autowired
private lateinit var jsonMapper: JsonMapper
```

## Logging

Use kotlin-logging (`io.github.oshai.kotlinlogging`) at **file level**, not in a companion object:

```kotlin
import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

@Service
class MyService {
    fun doWork() {
        logger.info { "Processing item: $itemId" }
        logger.warn { "Slow query detected: ${duration}ms" }
        logger.error(ex) { "Failed to process: $itemId" }
    }
}
```

**DON'T**: Use SLF4J directly (`LoggerFactory.getLogger(...)`) or companion object loggers.

## Transaction Annotations

```kotlin
@Service
@Transactional                        // Class-level for write services
class MyWriteService { ... }

@Service
@Transactional(readOnly = true)       // Class-level for read-only services
class MyReadService { ... }

// Override at method level when needed:
@Transactional(readOnly = true)
fun findById(id: UUID): Entity = ...
```

## DTO Mapping

Use extension functions in a `Mapper.kt` file within the module's `domain/` package:

```kotlin
// places/domain/Mapper.kt
fun DirectoryEntry.toDto(): DirectoryEntryDto {
    val entityId = this.id ?: throw IllegalStateException("Cannot map entity with null ID")
    return when (this) {
        is Restaurant -> RestaurantDto(id = entityId, name = name, ...)
        is Hotel -> HotelDto(id = entityId, name = name, ...)
        else -> throw IllegalArgumentException("Unknown entry type")
    }
}
```

Usage in services and controllers:
```kotlin
service.getEntriesPage(pageable).map { it.toDto() }
```

## ktlint Rules

1. **No blank first line in class body**:
   ```kotlin
   // GOOD
   class Foo {
       val x = 1
   }

   // BAD
   class Foo {

       val x = 1
   }
   ```

2. **Newline before `=` when params span multiple lines**:
   ```kotlin
   // GOOD
   fun createEntry(
       request: CreateEntryRequestDto,
   ): ApiResult<DirectoryEntryDto> =
       ApiResult(data = service.create(request))

   // BAD
   fun createEntry(
       request: CreateEntryRequestDto,
   ): ApiResult<DirectoryEntryDto> = ApiResult(data = service.create(request))
   ```

3. **MockMvc chain dots on same line as closing paren**:
   ```kotlin
   // GOOD
   mockMvc
       .perform(
           post("/api/v1/entries")
               .contentType(MediaType.APPLICATION_JSON)
               .content(json),
       ).andExpect(status().isCreated)
       .andExpect(jsonPath("$.status").value(201))

   // BAD — dot on new line after closing paren
   mockMvc
       .perform(...)
       .andExpect(...)
   ```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controller | `{Resource}Controller` | `DirectoryEntryController` |
| Service | `{Domain}Service` | `DirectoryEntryService` |
| Repository | `{Entity}Repository` | `DirectoryEntryRepository` |
| Entity | Singular noun | `DirectoryEntry`, `Restaurant` |
| DTO | `{Name}Dto` | `DirectoryEntryDto` |
| Request DTO | `{Action}{Resource}Request` or `{Resource}CreateDto` | `CreateEntryRequestDto` |
| Event | `{Entity}{Action}Event` (past tense) | `DirectoryEntryCreatedEvent` |
| DB table | `snake_case` plural | `directory_entries` |
| DB column | `snake_case` | `created_at` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_UPDATES_PER_MINUTE` |

## Reference

- See `docs/api-coding-standards.md` for comprehensive standards
