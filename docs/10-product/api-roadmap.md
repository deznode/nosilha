# API Roadmap

Planned backend improvements and migrations. For current standards, see [api-coding-standards.md](../20-architecture/api-coding-standards.md).

---

## ~~1. Spring Data JPA Auditing Migration~~ (Completed)

Shipped. `AuditableEntity` and `CreatableEntity` now use Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`) with `Instant`/`TIMESTAMPTZ`. All manual `@PrePersist`/`@PreUpdate` callbacks removed. See `api-coding-standards.md` for current patterns.

(The original migrations were folded into the V1-V13 baseline when the repo history was squashed on 2026-03-02, so there is no longer a distinct migration to point at.)

---

## 2. Role-Based Access Control (RBAC) — partially shipped

### Current State

Method-level security is **live**: `SecurityConfig` has `@EnableMethodSecurity`, and
`@PreAuthorize("hasRole('ADMIN')")` guards `AdminGalleryController`,
`AdminAiController` and `DirectoryEntryController`.

### Roles

| Role | Permissions | Status |
|------|-------------|--------|
| `ADMIN` | Full access (CRUD all resources) | **Implemented** |
| `USER` | Read public content, submit suggestions | **Implemented** |
| `EDITOR` | Create/update content, moderate submissions | Planned — not in `UserRole` |
| `MODERATOR` | Review and approve user submissions | Planned — not in `UserRole` |

`UserRole` (`auth/domain/User.kt`) currently defines only `USER` and `ADMIN`. The
remaining work is introducing `EDITOR`/`MODERATOR` and the finer-grained
permissions below — not the security plumbing, which already exists.

### Implementation Plan (for the remaining roles)

1. **Security configuration**:
   ```kotlin
   @Configuration
   @EnableWebSecurity
   @EnableMethodSecurity(prePostEnabled = true)
   class SecurityConfig {
       @Bean
       fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
           return http
               .authorizeHttpRequests { auth ->
                   auth
                       .requestMatchers("/api/v1/directory/entries").permitAll()
                       .requestMatchers(HttpMethod.POST, "/api/v1/admin/**").hasRole("ADMIN")
                       .anyRequest().authenticated()
               }
               .build()
       }
   }
   ```

2. **Method-level annotations**:
   ```kotlin
   @PostMapping("/entries")
   @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
   fun createEntry(@Valid @RequestBody request: CreateEntryRequestDto)
   ```

3. **Custom security expressions**:
   ```kotlin
   @PreAuthorize("hasRole('ADMIN') or (hasRole('EDITOR') and @securityService.canEdit(#id))")
   fun updateEntry(@PathVariable id: UUID, ...)
   ```

---

## 3. Internationalization (i18n)

### Target Languages

- English (default)
- Portuguese (`pt`)
- Cape Verdean Creole (`kea`) - future

### Implementation Plan

1. **Message source configuration**:
   ```kotlin
   @Configuration
   class InternationalizationConfig {
       @Bean
       fun messageSource(): MessageSource {
           return ReloadableResourceBundleMessageSource().apply {
               setBasename("classpath:messages")
               setDefaultEncoding("UTF-8")
           }
       }

       @Bean
       fun localeResolver(): LocaleResolver {
           return SessionLocaleResolver().apply {
               setDefaultLocale(Locale.ENGLISH)
           }
       }
   }
   ```

2. **Message files**:
   - `messages.properties` (English)
   - `messages_pt.properties` (Portuguese)

3. **Localized error responses**: Update `GlobalExceptionHandler` to use `MessageSource`

---

## 4. Enhanced Validation

### Planned Improvements

1. **Custom validation annotations**:
   ```kotlin
   @Target(AnnotationTarget.FIELD)
   @Constraint(validatedBy = [UniqueSlugValidator::class])
   annotation class UniqueSlug(
       val message: String = "Slug must be unique",
       val groups: Array<KClass<*>> = [],
       val payload: Array<KClass<out Payload>> = []
   )
   ```

2. **Geographic bounds validation**: Cape Verde coordinates validation
3. **Category-specific validation**: Different rules per DirectoryEntry subtype

---

## 5. Testing Improvements

### Planned Additions

| Area | Current | Target |
|------|---------|--------|
| Unit test coverage | Basic | 80%+ |
| Integration tests | Testcontainers | Contract tests |
| API documentation | **Shipped** — springdoc-openapi + `@Operation` annotations | — |

### Integration Test Organization

Tests are organized **by module**, mirroring the Spring Modulith package layout —
not by test type. An earlier `integration/` + `unit/` + `testcontainers/` split was
proposed but never adopted.

```
src/test/kotlin/com/nosilha/core/
├── places/
├── gallery/
├── ai/
├── feedback/
└── config/
```

Testcontainers is wired via the `jdbc:tc:postgresql://` URL in
`src/test/resources/application-test.yml`, so there is no separate container
configuration package.

---

## Related Documentation

- [api-coding-standards.md](../20-architecture/api-coding-standards.md) - Current standards
- [spring-modulith.md](../20-architecture/spring-modulith.md) - Module architecture
- [architecture.md](../20-architecture/architecture.md) - System overview
