# API Roadmap

Planned backend improvements and migrations. For current standards, see [api-coding-standards.md](../20-architecture/api-coding-standards.md).

---

## ~~1. Spring Data JPA Auditing Migration~~ (Completed)

Shipped via migrations V12-V17. `AuditableEntity` and `CreatableEntity` now use Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`) with `Instant`/`TIMESTAMPTZ`. All manual `@PrePersist`/`@PreUpdate` callbacks removed. See `api-coding-standards.md` for current patterns.

---

## 2. Role-Based Access Control (RBAC)

### Target Architecture

Method-level security with Spring Security `@PreAuthorize`.

### Planned Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full access (CRUD all resources) |
| `EDITOR` | Create/update content, moderate submissions |
| `MODERATOR` | Review and approve user submissions |
| `USER` | Read public content, submit suggestions |

### Implementation Plan

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
| API documentation | Manual | OpenAPI/Swagger |

### Integration Test Organization

```
src/test/kotlin/
├── integration/           # Integration tests
│   ├── DirectoryEntryControllerIT.kt
│   └── DatabaseMigrationIT.kt
├── unit/                  # Unit tests
│   └── service/
└── testcontainers/        # Container configuration
```

---

## Related Documentation

- [api-coding-standards.md](../20-architecture/api-coding-standards.md) - Current standards
- [spring-modulith.md](../20-architecture/spring-modulith.md) - Module architecture
- [architecture.md](../20-architecture/architecture.md) - System overview
