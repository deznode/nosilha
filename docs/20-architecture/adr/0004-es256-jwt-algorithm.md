# ADR 0004: Configure ES256 Algorithm for Supabase JWT Validation

## Status

Accepted

## Date

2026-01-08

## Context

After migrating from Supabase's legacy anon key to the new publishable key format (`sb_publishable_...`), JWT authentication began failing with the error:

```
Signed JWT rejected: Another algorithm expected, or no matching key(s) found
```

Users could log in successfully (Supabase Auth worked), but all authenticated API requests to the Spring Boot backend returned 401 Unauthorized, causing immediate logout.

### Investigation Findings

- JWT header specified `"alg": "ES256"` (ECDSA with P-256 curve)
- JWKS endpoint returned correct key with matching `kid` and algorithm
- Supabase Dashboard confirmed ECC (P-256) asymmetric keys were active
- Spring Security's `NimbusJwtDecoder` defaults to **RS256** (RSA) when using JWKS

### Root Cause

Spring Security's default JWKS-based JWT decoder only supports RS256 unless explicitly configured otherwise. Supabase uses ES256 for asymmetric JWT signing, causing a signature algorithm mismatch.

## Decision

Configure a custom `JwtDecoder` bean that explicitly specifies ES256 as the signature algorithm.

### Implementation

```kotlin
@Bean
fun jwtDecoder(): JwtDecoder {
    val jwksUrl = "$supabaseProjectUrl/auth/v1/.well-known/jwks.json"
    return NimbusJwtDecoder
        .withJwkSetUri(jwksUrl)
        .jwsAlgorithm(SignatureAlgorithm.ES256)
        .build()
}
```

**File**: `apps/api/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt`

## Alternatives Considered

### 1. Revert to HS256 Symmetric Keys

- **Pros**: Simpler configuration, Spring Security handles it natively
- **Cons**: Requires sharing secret between Supabase and backend; less secure than asymmetric keys; Supabase recommends asymmetric keys for production
- **Rejected**: Goes against Supabase security recommendations

### 2. Use Spring Boot Auto-Configuration Only

- **Pros**: Zero custom code, relies on `spring.security.oauth2.resourceserver.jwt.jwk-set-uri`
- **Cons**: Auto-configuration defaults to RS256; no way to specify algorithm via properties alone
- **Rejected**: Does not support ES256 without custom bean

### 3. Custom JwtDecoder with Multiple Algorithms

- **Pros**: Supports both RS256 and ES256 for flexibility
- **Cons**: Unnecessary complexity; Supabase only uses ES256
- **Rejected**: Over-engineering for current requirements

## Consequences

### Positive

- JWT validation works correctly with Supabase's ES256-signed tokens
- Uses JWKS endpoint for automatic key rotation support
- Aligns with Supabase's recommended asymmetric key configuration
- No secret sharing required between services (public key verification)

### Negative

- Requires custom `JwtDecoder` bean instead of pure auto-configuration
- Must update if Supabase changes signing algorithm (unlikely)

### Neutral

- JWKS endpoint is cached by NimbusJwtDecoder; key rotation handled automatically

## References

- [Supabase JWT Signing Keys Documentation](https://supabase.com/docs/guides/auth/signing-keys)
- [Spring Security OAuth2 Resource Server - JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [ADR 0003: Supabase as External Authentication Provider](0003-supabase-auth.md)
- `/apps/api/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt`
