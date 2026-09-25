---
paths: apps/api/**
---

# Testing Patterns

## Integration Test Setup

Every MockMvc integration test uses this annotation trio (`AutoConfigureMockMvc` is imported from `org.springframework.boot.webmvc.test.autoconfigure` in Spring Boot 4):

```kotlin
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class MyControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper  // NOT ObjectMapper

    @Autowired
    private lateinit var myRepository: MyRepository
}
```

**Note**: Use `JsonMapper` (Jackson 3.x) not `ObjectMapper` for serialization in tests.

## Test Class Structure

```kotlin
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class SuggestionControllerTest {
    @Autowired private lateinit var mockMvc: MockMvc
    @Autowired private lateinit var jsonMapper: JsonMapper
    @Autowired private lateinit var suggestionRepository: SuggestionRepository

    @BeforeEach
    fun setup() {
        suggestionRepository.deleteAll()
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Valid suggestion should return 201 Created")
    fun `submitSuggestion with valid data should create suggestion and return 201`() {
        // ...
    }
}
```

## MockMvc Pattern

**Chain dots must be on the same line as the closing paren** (ktlint rule):

```kotlin
mockMvc
    .perform(
        post("/api/v1/suggestions")
            .contentType(MediaType.APPLICATION_JSON)
            .content(jsonMapper.writeValueAsString(dto))
            .header("X-Forwarded-For", "192.168.1.100"),
    ).andExpect(status().isCreated)
    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    .andExpect(jsonPath("$.status").value(201))
    .andExpect(jsonPath("$.data.id").isNotEmpty)
```

## FK-Safe Cleanup

When tests touch multiple tables, delete in FK-safe order in `@BeforeEach`:

```kotlin
@Autowired private lateinit var jdbcTemplate: JdbcTemplate

@BeforeEach
fun cleanup() {
    // Child tables first
    jdbcTemplate.execute("DELETE FROM ai_analysis_log")
    jdbcTemplate.execute("DELETE FROM reactions")
    // Event publication table
    jdbcTemplate.execute("DELETE FROM event_publication")
}

@AfterEach
fun removeCreatedRows() {
    // Seeded tables (directory_entries, gallery_media, towns) hold shared seed rows:
    // delete only what this test created, never the whole table.
    created.forEach { jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", it) }
}
```

## Auth in Tests

Use Spring Security's mock authentication:

```kotlin
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication

// The principal must be a UUID string: controllers call UUID.fromString(authentication.name).
private fun auth(
    id: UUID,
    role: String,
) = authentication(UsernamePasswordAuthenticationToken(id.toString(), null, listOf(SimpleGrantedAuthority(role))))

// Usage:
mockMvc
    .perform(
        post("/api/v1/directory/submissions")
            .with(auth(UUID.randomUUID(), "ROLE_USER"))
            .contentType(MediaType.APPLICATION_JSON)
            .content(jsonMapper.writeValueAsString(dto)),
    ).andExpect(status().isCreated)
```

## Testcontainers

Connection string in `application-test.yml`:

```yaml
spring:
  datasource:
    url: jdbc:tc:postgresql:16.0:///?TC_DAEMON=true
```

No additional setup needed — Spring Boot auto-configures Testcontainers from the `jdbc:tc:` prefix.

## MockitoBean

`@MockitoBean` replaces all matching beans in the context:

```kotlin
// ai/AiModuleIntegrationTest.kt
@MockitoBean
private lateinit var mockProvider: ImageAnalysisProvider  // injected into List<ImageAnalysisProvider> as a single element

// gallery tests
@MockitoBean
private lateinit var r2StorageService: R2StorageService
```

## Event Testing

`@ApplicationModuleListener` events run **AFTER** the publishing transaction commits (AFTER_COMMIT phase). In `@SpringBootTest`, events process asynchronously — poll for results:

```kotlin
// ai/AiModuleIntegrationTest.kt
private fun awaitAnalysisRun(
    mediaId: UUID,
    timeoutMs: Long = 5000,
): List<AnalysisRun> {
    val start = System.currentTimeMillis()
    while (System.currentTimeMillis() - start < timeoutMs) {
        val runs = analysisRunRepository.findByMediaId(mediaId)
        if (runs.isNotEmpty()) return runs
        Thread.sleep(100)
    }
    return analysisRunRepository.findByMediaId(mediaId)
}
```

## Reference

- See `docs/20-architecture/testing.md` for comprehensive testing guide
- See `docs/20-architecture/api-coding-standards.md` for coding standards
