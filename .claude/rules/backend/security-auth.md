---
paths: apps/api/**
---

# Security & Authentication

## Exception Hierarchy

| Exception | HTTP Status | Where |
|-----------|------------|-------|
| `ResourceNotFoundException` | 404 Not Found | `shared/exception/ResourceNotFoundException.kt` |
| `ForbiddenException` | 403 Forbidden | `shared/exception/ForbiddenException.kt` (`@ResponseStatus`) |
| Validation errors (Jakarta), `IllegalArgumentException` | 400 Bad Request | handled by `GlobalExceptionHandler` |
| `BusinessException` | 422 Unprocessable Entity | defined in `GlobalExceptionHandler.kt` |
| `RateLimitExceededException` | 429 Too Many Requests | defined in `GlobalExceptionHandler.kt` |
| `YouTubeSyncDisabledException` | 503 Service Unavailable | defined in `GlobalExceptionHandler.kt` |

```kotlin
// Throwing exceptions
throw ResourceNotFoundException("Directory entry with ID '$id' not found.")
throw BusinessException("Cannot publish entry without description")
throw RateLimitExceededException("Rate limit exceeded. Please try again later.")
```

## Error Response Format

All errors are wrapped in `ErrorResponse` or `ValidationErrorResponse` (defined in `shared/api/ApiResult.kt`):

```kotlin
data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val path: String? = null,
    val status: Int,
)

data class ValidationErrorResponse(
    val error: String,
    val details: List<FieldError>,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val path: String? = null,
    val status: Int = 400,
) {
    data class FieldError(
        val field: String,
        val rejectedValue: Any?,
        val message: String,
    )
}
```

## Rate Limiting

Uses Bucket4j token buckets in a Caffeine cache, keyed per user (`ProfileService`) or per client IP (`DirectoryEntryService`, `SuggestionService`):

```kotlin
private val rateLimitBuckets: Cache<String, Bucket> = Caffeine
    .newBuilder()
    .maximumSize(10_000)
    .expireAfterAccess(1, TimeUnit.HOURS)
    .build()

fun checkRateLimit(key: String) {
    val bucket = rateLimitBuckets.get(key) { createBucket() }
    if (!bucket.tryConsume(1)) {
        throw RateLimitExceededException("Rate limit exceeded")
    }
}
```

## Auth Extraction in Controllers

Extract user ID from Spring Security `Authentication`:

```kotlin
@PostMapping("/submissions")
@ResponseStatus(HttpStatus.CREATED)
fun submitEntry(
    @Valid @RequestBody request: CreateDirectoryEntrySubmissionRequest,
    authentication: Authentication,
    httpRequest: HttpServletRequest,
): ApiResult<DirectoryEntrySubmissionConfirmationDto> {
    val userId = UUID.fromString(authentication.name)  // Supabase user ID from JWT
    val ipAddress = extractClientIp(httpRequest)  // shared/util/RequestUtils.kt
    // ...
}
```

IP extraction is centralized in `shared/util/RequestUtils.kt`:

```kotlin
import com.nosilha.core.shared.util.extractClientIp
```

## Security Config

Supabase JWT with ES256, stateless sessions:

```kotlin
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // required for @PreAuthorize
class SecurityConfig(
    private val supabaseJwtConverter: SupabaseJwtAuthenticationConverter,
) {
    @Bean
    fun jwtDecoder(): JwtDecoder {
        val jwtDecoder = NimbusJwtDecoder
            .withJwkSetUri("$supabaseProjectUrl/auth/v1/.well-known/jwks.json")
            .jwsAlgorithm(SignatureAlgorithm.ES256)
            .build()
        jwtDecoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuerUri))
        return jwtDecoder
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .authorizeHttpRequests { requests ->
                requests
                    .requestMatchers(HttpMethod.GET, "/api/v1/directory/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/suggestions").permitAll()
                    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(supabaseJwtConverter)
                }
            }
        return http.build()
    }
}
```

## Authorization Levels

| Endpoint Pattern | Access |
|-----------------|--------|
| `GET /api/v1/directory/**`, `GET /api/v1/towns/**` | Public |
| `GET /api/v1/gallery` and listed sub-paths: `{id}`, `facets`, `{id}/sequence`, `entry/{entryId}`, `categories`, `approved`, `random`, `featured`, `weekly`, `timeline`, `videos/featured` | Public |
| `GET /api/v1/reactions/content/**`, `GET /api/v1/stories`, `GET /api/v1/stories/slug/**` | Public |
| `POST /api/v1/suggestions`, `POST /api/v1/contact`, `POST /api/v1/content/register` | Public |
| `POST /api/v1/directory/submissions` | `USER`, `ADMIN`, `authenticated` |
| `POST /api/v1/gallery/upload/presign`, `/upload/confirm`, `/submit` | `USER`, `ADMIN`, `authenticated` |
| `POST /api/v1/stories`, `/api/v1/ai/**` | `USER`, `ADMIN`, `authenticated` |
| `/api/v1/users/me/**`, `/api/v1/bookmarks/**` | `USER`, `ADMIN`, `authenticated` |
| `POST /api/v1/directory/entries`, `PUT`/`DELETE /api/v1/directory/**` | `ADMIN` only |
| `/api/v1/admin/**` | `ADMIN` only |
| Anything else | Authenticated |

**There is no `/gallery/**` wildcard.** A new public GET endpoint returns 401 until it gets its own matcher in `SecurityConfig`.

## Reference

- See `docs/20-architecture/api-coding-standards.md` for comprehensive standards
- Security config: `apps/api/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt`
