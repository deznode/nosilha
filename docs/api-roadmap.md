# API Roadmap

Planned backend improvements and migrations. For current standards, see [api-coding-standards.md](api-coding-standards.md).

---

## 1. Spring Data JPA Auditing Migration

### Current State

Manual audit timestamps using JPA lifecycle callbacks (`@PrePersist`, `@PreUpdate`) in `AuditableEntity`.

### Target State

Spring Data JPA Auditing with `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`.

### Migration Steps

1. **Add configuration**:
   ```kotlin
   @Configuration
   @EnableJpaAuditing(auditorAwareRef = "auditorProvider")
   class JpaAuditingConfiguration {
       @Bean
       fun auditorProvider(): AuditorAware<String> = AuditorAware {
           Optional.ofNullable(SecurityContextHolder.getContext().authentication?.name ?: "system")
       }
   }
   ```

2. **Update AuditableEntity**:
   ```kotlin
   @MappedSuperclass
   @EntityListeners(AuditingEntityListener::class)
   abstract class AuditableEntity {
       @CreatedDate
       @Column(name = "created_at", nullable = false, updatable = false)
       lateinit var createdAt: LocalDateTime

       @LastModifiedDate
       @Column(name = "updated_at", nullable = false)
       lateinit var updatedAt: LocalDateTime

       @CreatedBy
       @Column(name = "created_by", updatable = false)
       var createdBy: String? = null

       @LastModifiedBy
       @Column(name = "updated_by")
       var lastModifiedBy: String? = null
   }
   ```

3. **Database migration**: Add `created_by` and `updated_by` columns to existing tables

4. **Remove manual callbacks**: Delete `@PrePersist`/`@PreUpdate` methods

### Benefits

- Automatic user tracking from security context
- Consistent audit trail across all entities
- Reduced boilerplate in entity classes

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

- [api-coding-standards.md](api-coding-standards.md) - Current standards
- [spring-modulith.md](spring-modulith.md) - Module architecture
- [architecture.md](architecture.md) - System overview
