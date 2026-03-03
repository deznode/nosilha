---
paths: apps/api/**
---

# Testing Patterns

## Integration Test Setup

Every integration test uses this annotation trio:

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
    jdbcTemplate.execute("DELETE FROM analysis_runs")
    jdbcTemplate.execute("DELETE FROM reactions")
    // Event publication table
    jdbcTemplate.execute("DELETE FROM event_publication")
    // Parent tables last
    jdbcTemplate.execute("DELETE FROM gallery_media")
    jdbcTemplate.execute("DELETE FROM directory_entries")
}
```

## Auth in Tests

Use Spring Security's mock authentication:

```kotlin
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken

private fun authAs(userId: String) =
    authentication(
        UsernamePasswordAuthenticationToken(userId, null, emptyList())
    )

// Usage:
mockMvc
    .perform(
        post("/api/v1/directory/submissions")
            .with(authAs("user-123"))
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
@MockitoBean
private lateinit var aiProvider: AiImageAnalysisProvider

// For List<Provider> injections, the mock becomes a single-element list
@MockitoBean
private lateinit var culturalProvider: CulturalContextProvider
```

## Event Testing

`@ApplicationModuleListener` events run **AFTER** the publishing transaction commits (AFTER_COMMIT phase). In `@SpringBootTest`, events process asynchronously — poll for results:

```kotlin
private fun awaitAnalysisRun(mediaId: UUID, timeout: Duration = Duration.ofSeconds(10)): AnalysisRun {
    val deadline = Instant.now().plus(timeout)
    while (Instant.now().isBefore(deadline)) {
        val run = analysisRunRepository.findTopByMediaIdOrderByCreatedAtDesc(mediaId)
        if (run != null) return run
        Thread.sleep(100)
    }
    throw AssertionError("AnalysisRun not found within $timeout for media $mediaId")
}
```

## Reference

- See `docs/testing.md` for comprehensive testing guide
- See `docs/api-coding-standards.md` for coding standards
