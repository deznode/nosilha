---
paths: apps/api/**
---

# Database Patterns

## Flyway Migration Structure

Three-directory convention separating schema DDL from seed/reference data:

```
apps/api/src/main/resources/db/
├── migration/    # Schema DDL only (V__ versioned) — all environments
├── seed/         # Reference/seed data (R__ repeatable) — all environments
└── devdata/      # Dev-only sample data — local profile only
```

### Directory Rules

| Directory | Purpose | Migration Types | Environments |
|-----------|---------|----------------|--------------|
| `db/migration/` | Schema DDL (CREATE, ALTER, DROP, indexes, constraints) | `V__` only | All |
| `db/seed/` | Reference data and one-time data imports | `R__` (evolving) + `V__` (one-time) | All |
| `db/devdata/` | Dev-only sample data for local testing | `R__` or `V__` | Local only |

### Naming Conventions

**Versioned migrations** (`V__`): `V{N}__{snake_case_description}.sql`
- Single global version sequence across ALL directories
- **Always check both `db/migration/` and `db/seed/` before assigning a version number**
- DDL goes in `db/migration/`, one-time data imports go in `db/seed/`

**Repeatable migrations** (`R__`): `R__{snake_case_description}.sql`
- No version number; ordered alphabetically by description
- Run after all `V__` migrations; re-run when file checksum changes
- Use for reference data that evolves (towns, config domains)
- Must be idempotent (use upsert patterns)

### Upsert Patterns

**Evolving reference data** (edits should propagate on deploy):
```sql
INSERT INTO towns (...) VALUES (...)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;
```

**Config/content seed data** (preserve runtime state):
```sql
INSERT INTO ai_feature_config (domain, enabled)
VALUES ('gallery', false)
ON CONFLICT (domain) DO NOTHING;
```

### Profile Configuration

Flyway locations are configured per Spring profile:
- **Production** (`application.yml`): `classpath:db/migration,classpath:db/seed`
- **Local dev** (`application-local.yml`): `classpath:db/migration,classpath:db/seed,classpath:db/devdata`
- **Test** (`application-test.yml`): `classpath:db/migration,classpath:db/seed`

### Consolidated Migrations (V1-V9)

Migrations are domain-grouped with final-form CREATE TABLE statements:

| Migration | Domain | Tables |
|-----------|--------|--------|
| V1 | Enums | `gallery_media_status`, `media_source` |
| V2 | Auth | `users` |
| V3 | Places | `towns`, `directory_entries` |
| V4 | Gallery | `gallery_media`, `media_moderation_audit` |
| V5 | Engagement | `user_profiles`, `reactions`, `bookmarks`, `content` |
| V6 | Feedback | `suggestions`, `contact_messages` |
| V7 | Stories | `story_submissions`, `mdx_archives` |
| V8 | AI | `ai_analysis_log`, `ai_analysis_batch`, `ai_api_usage`, `ai_feature_config` |
| V9 | Infrastructure | `event_publication` |

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
- Schema migrations: `apps/api/src/main/resources/db/migration/`
- Seed data: `apps/api/src/main/resources/db/seed/`
