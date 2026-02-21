---
paths: apps/api/**
---

# Database Patterns

## Flyway Migration Naming

Format: `V{N}__{snake_case_description}.sql` (double underscore after version number)

```
apps/api/src/main/resources/db/migration/
├── V1__create_enums_and_extensions.sql
├── V2__create_core_tables.sql
├── V3__create_directory_entries.sql
├── V4__create_gallery_media.sql
├── V5__create_media_moderation_audit.sql
├── V6__create_engagement_feedback_tables.sql
├── V7__create_stories_tables.sql
├── V8__create_event_publication.sql
├── V9__seed_reference_data.sql
├── V10__create_ai_analysis_tables.sql
├── V11__add_content_table.sql
├── V12__standardize_timestamps_to_timestamptz.sql
├── V13__cleanup_orphaned_columns_and_defaults.sql
├── V14__standardize_user_ids_and_audit_columns.sql
├── V15__add_user_reference_fk_constraints.sql
```

Sequential numbering — check existing files before creating a new one.

## Entity Base Classes

Two-level hierarchy with Spring Data JPA Auditing (`@EnableJpaAuditing` in `JpaAuditingConfig`):

**CreatableEntity** — for immutable entities (creation-only audit):

```kotlin
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class CreatableEntity {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: UUID? = null
}
```

**AuditableEntity** — for mutable entities (full audit trail):

```kotlin
@MappedSuperclass
abstract class AuditableEntity : CreatableEntity() {
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()

    @LastModifiedBy
    @Column(name = "updated_by")
    var updatedBy: UUID? = null
}
```

All timestamps use `Instant` (TIMESTAMPTZ in DB). `AuditorAware<UUID>` resolves from `SecurityContextHolder`.

## UUID Primary Keys

```kotlin
@Id
@GeneratedValue
var id: UUID? = null
```

## Single Table Inheritance

```kotlin
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "entry_type", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry : AuditableEntity() {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null
    // shared fields...
}

@Entity
@DiscriminatorValue("RESTAURANT")
class Restaurant : DirectoryEntry() {
    var cuisine: String? = null
    var openingHours: String? = null
}
```

## JSONB Columns

```kotlin
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

@Column(name = "content_actions", columnDefinition = "jsonb")
@JdbcTypeCode(SqlTypes.JSON)
var contentActions: String? = null

// For typed JSONB (data class):
@Column(name = "notification_preferences", columnDefinition = "jsonb")
@JdbcTypeCode(SqlTypes.JSON)
var notificationPreferences: NotificationPreferences = NotificationPreferences()
```

## PostgreSQL Arrays

```kotlin
@Column(name = "providers_used", columnDefinition = "TEXT[]")
@JdbcTypeCode(SqlTypes.ARRAY)
var providersUsed: Array<String>? = null
```

## Enum Mapping

```kotlin
@Enumerated(EnumType.STRING)
@Column(nullable = false)
var status: DirectoryEntryStatus = DirectoryEntryStatus.PUBLISHED
```

For PostgreSQL native enums, add `@JdbcTypeCode(SqlTypes.NAMED_ENUM)`:
```kotlin
@Enumerated(EnumType.STRING)
@Column(name = "status", nullable = false)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
var status: GalleryMediaStatus = GalleryMediaStatus.PENDING_REVIEW
```

Matching migration with `CHECK` constraint or CREATE TYPE:
```sql
CREATE TYPE gallery_media_status AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
```

## Full-Text Search

PostgreSQL `search_vector` with `plainto_tsquery`:

```kotlin
@Query(
    value = """
    SELECT * FROM directory_entries
    WHERE search_vector @@ plainto_tsquery('english', :query)
    AND status = 'PUBLISHED'
    ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC
    """,
    countQuery = """
    SELECT COUNT(*) FROM directory_entries
    WHERE search_vector @@ plainto_tsquery('english', :query)
    AND status = 'PUBLISHED'
    """,
    nativeQuery = true,
)
fun searchByQueryPublished(
    @Param("query") query: String,
    pageable: Pageable,
): Page<DirectoryEntry>
```

Migration to create the search vector:
```sql
ALTER TABLE directory_entries ADD COLUMN search_vector tsvector;
CREATE INDEX idx_directory_entries_search ON directory_entries USING GIN(search_vector);
```

## Reference

- See `docs/20-architecture/api-coding-standards.md` for comprehensive standards
- Migration files: `apps/api/src/main/resources/db/migration/`
