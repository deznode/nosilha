---
paths: apps/api/**
---

# Security & Authentication

## Exception Hierarchy

| Exception | HTTP Status | Package |
|-----------|------------|---------|
| `ResourceNotFoundException` | 404 Not Found | `shared.exception` |
| Validation errors (Jakarta) | 400 Bad Request | handled by `GlobalExceptionHandler` |
| `BusinessException` | 422 Unprocessable Entity | `shared.exception` |
| `RateLimitExceededException` | 429 Too Many Requests | `shared.exception` |

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

Uses Bucket4j token bucket with Caffeine per-user cache:

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
): ApiResult<ConfirmationDto> {
    val userId = authentication.name  // Supabase user ID from JWT
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
| `GET /api/v1/directory/**` | Public |
| `GET /api/v1/towns/**` | Public |
| `GET /api/v1/gallery/**` | Public |
| `POST /api/v1/suggestions` | Public |
| `POST /api/v1/contact` | Public |
| `POST /api/v1/directory/submissions` | `USER`, `ADMIN`, `authenticated` |
| `POST /api/v1/gallery/upload/**` | `USER`, `ADMIN`, `authenticated` |
| `/api/v1/users/me/**` | `USER`, `ADMIN`, `authenticated` |
| `/api/v1/bookmarks/**` | `USER`, `ADMIN`, `authenticated` |
| `/api/v1/admin/**` | `ADMIN` only |

## Reference

- See `docs/20-architecture/api-coding-standards.md` for comprehensive standards
- Security config: `apps/api/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt`
