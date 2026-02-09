---
paths: apps/api/**
---

# Backend API Patterns

## Response Wrappers

All API responses use wrappers from `shared/api/ApiResult.kt`:

```kotlin
// Single item
data class ApiResult<T>(
    val data: T,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200,
)

// Paginated list
data class PagedApiResult<T : Any>(
    val data: List<T>,
    val pageable: PageableInfo,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200,
) {
    companion object {
        fun <T : Any> from(page: Page<T>): PagedApiResult<T> = ...
    }
}
```

**DON'T**: Use `ResponseEntity<T>` directly — always wrap in `ApiResult` or `PagedApiResult`.

## Controller Structure

```kotlin
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
    private val service: DirectoryEntryService,
) {
    @GetMapping("/entries/{id}")
    fun getEntryById(@PathVariable id: UUID): ApiResult<DirectoryEntryDto> {
        val entry = service.getEntryById(id)
        return ApiResult(data = entry)
    }

    @GetMapping("/entries")
    fun getEntries(
        @RequestParam(name = "q", required = false) q: String?,
        @RequestParam(name = "category", required = false) category: String?,
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResult<DirectoryEntryDto> {
        val resultPage = service.getEntriesPage(PageRequest.of(page, size))
        return PagedApiResult.from(resultPage)
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    fun createEntry(
        @RequestBody request: CreateEntryRequestDto,
    ): ApiResult<DirectoryEntryDto> {
        val entry = service.createEntry(request)
        return ApiResult(data = entry, status = HttpStatus.CREATED.value())
    }

    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntry(@PathVariable id: UUID) {
        service.deleteEntry(id)
    }
}
```

Key patterns:
- `@ResponseStatus(HttpStatus.CREATED)` + `status = HttpStatus.CREATED.value()` on POST
- `@ResponseStatus(HttpStatus.NO_CONTENT)` with `Unit` return (no explicit return) on DELETE
- Constructor injection (no `@Autowired`)

## Controller Documentation

Use HTML JavaDoc tags and OpenAPI annotations:

```kotlin
/**
 * Submits a new directory entry for review.
 *
 * <p>Requires authentication. Validates the submission, checks rate limits,
 * and persists the entry with PENDING status for admin review.</p>
 *
 * @param request Directory submission data
 * @param authentication Spring Security authentication (contains user ID)
 * @return ApiResult with confirmation DTO (201 Created)
 */
@PostMapping("/submissions")
@ResponseStatus(HttpStatus.CREATED)
@Operation(summary = "Submit directory entry", description = "...")
@ApiResponses(value = [
    ApiResponse(responseCode = "201", description = "Submitted successfully"),
    ApiResponse(responseCode = "400", description = "Invalid request data"),
    ApiResponse(responseCode = "401", description = "Unauthorized"),
    ApiResponse(responseCode = "429", description = "Rate limit exceeded"),
])
fun submitDirectoryEntry(
    @Valid @RequestBody request: CreateDirectoryEntrySubmissionRequest,
    authentication: Authentication,
): ApiResult<ConfirmationDto> { ... }
```

## Module Sub-Package Layout

Every module follows this structure:

```
places/
├── api/              # Controllers, request/response DTOs
│   ├── DirectoryEntryController.kt
│   ├── AdminDirectoryEntryController.kt
│   ├── CreateDirectoryEntrySubmissionRequest.kt
│   └── DirectoryEntrySubmissionConfirmationDto.kt
├── domain/           # Entities, services, mapper extensions
│   ├── DirectoryEntry.kt
│   ├── Restaurant.kt
│   ├── DirectoryEntryService.kt
│   └── Mapper.kt
├── repository/       # JPA repositories
│   └── DirectoryEntryRepository.kt
└── services/         # Secondary/cross-cutting services
    └── SearchService.kt
```

- **api/**: HTTP layer — controllers, request DTOs, response DTOs
- **domain/**: Business logic — entities, services, extension function mappers
- **repository/**: Data access — Spring Data JPA interfaces
- **services/**: Additional services (search, caching, etc.)

## Request Parameter Patterns

```kotlin
// Path variable
@GetMapping("/entries/{id}")
fun getEntry(@PathVariable id: UUID): ApiResult<DirectoryEntryDto>

// Request params with defaults
@GetMapping("/entries")
fun getEntries(
    @RequestParam(name = "page", defaultValue = "0") page: Int,
    @RequestParam(name = "size", defaultValue = "20") size: Int,
    @RequestParam(name = "sort", defaultValue = "created_at_desc") sort: String,
): PagedApiResult<DirectoryEntryDto>

// Validated request body
@PostMapping("/entries")
fun createEntry(
    @Valid @RequestBody request: CreateEntryRequestDto,
): ApiResult<DirectoryEntryDto>

// Authentication parameter
fun submit(
    authentication: Authentication,
    httpRequest: HttpServletRequest,
)
```

## Reference

- See `docs/api-coding-standards.md` for comprehensive standards
- See `docs/api-reference.md` for API documentation with endpoints
