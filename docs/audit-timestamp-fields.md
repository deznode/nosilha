# Audit: Timestamp & Date Fields in Database

**Date**: 2026-02-12
**Branch**: `fix/013-gallery-display-names`
**Database**: Local development (nosilha_db)

## 1. Summary Table

41 timestamp columns across 17 tables (excluding `flyway_schema_history`).

| Table | Column | DB Type | Nullable | DB Default | Kotlin Type | Management Pattern | Total Rows | Populated | NULL | Classification |
|-------|--------|---------|----------|------------|-------------|-------------------|-----------|-----------|------|----------------|
| `users` | `created_at` | TIMESTAMPTZ | YES | `now()` | `Instant` | Manual (constructor default) | 1 | 1 | 0 | Match |
| `towns` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 16 | 16 | 0 | Match |
| `towns` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 16 | 16 | 0 | Match |
| `directory_entries` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | AuditableEntity | 8 | 8 | 0 | Match |
| `directory_entries` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | AuditableEntity | 8 | 8 | 0 | Match |
| `directory_entries` | `reviewed_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 8 | 0 | 8 | By design (seed data) |
| `gallery_media` | `created_at` | TIMESTAMP | NO | `now()` | `LocalDateTime` | AuditableEntity | 14 | 14 | 0 | Match |
| `gallery_media` | `updated_at` | TIMESTAMP | NO | `now()` | `LocalDateTime` | AuditableEntity | 14 | 14 | 0 | Match |
| `gallery_media` | `reviewed_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 14 | 6 | 8 | By design (8 unreviewed) |
| `gallery_media` | `ai_processed_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (set by AI module) | 14 | 3 | 11 | By design (not all processed) |
| `gallery_media` | `date_taken` | TIMESTAMPTZ | YES | — | `Instant` | Manual (EXIF extraction) | 14 | 1 | 13 | By design (EXIF not always present) |
| `media_moderation_audit` | `performed_at` | TIMESTAMPTZ | YES | `now()` | `Instant` | Manual (constructor default) | 6 | 6 | 0 | Match |
| `user_profiles` | `created_at` | TIMESTAMP | NO | — | `LocalDateTime` | AuditableEntity | 1 | 1 | 0 | **Missing default** |
| `user_profiles` | `updated_at` | TIMESTAMP | NO | — | `LocalDateTime` | AuditableEntity | 1 | 1 | 0 | **Missing default** |
| `reactions` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `Instant` | `@CreationTimestamp` | 0 | — | — | **Type mismatch** |
| `bookmarks` | `created_at` | TIMESTAMP | NO | — | `Instant` | `@CreationTimestamp` | 0 | — | — | **Type mismatch** + **Missing default** |
| `content` | `created_at` | TIMESTAMPTZ | NO | `CURRENT_TIMESTAMP` | `Instant` | `@CreationTimestamp` | 0 | — | — | Match |
| `content` | `updated_at` | TIMESTAMPTZ | NO | `CURRENT_TIMESTAMP` | `Instant` | `@UpdateTimestamp` | 0 | — | — | Match |
| `suggestions` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `Instant` | `@CreationTimestamp` | 0 | — | — | **Type mismatch** |
| `suggestions` | `reviewed_at` | TIMESTAMP | YES | — | `Instant` | Manual (field set in service) | 0 | — | — | **Type mismatch** |
| `contact_messages` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | AuditableEntity | 0 | — | — | Match |
| `contact_messages` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | AuditableEntity | 0 | — | — | Match |
| `story_submissions` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `Instant` | `@CreationTimestamp` | 0 | — | — | **Type mismatch** |
| `story_submissions` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `Instant` | `@UpdateTimestamp` | 0 | — | — | **Type mismatch** |
| `story_submissions` | `reviewed_at` | TIMESTAMP | YES | — | `Instant` | Manual (field set in service) | 0 | — | — | **Type mismatch** |
| `story_submissions` | `archived_at` | TIMESTAMP | YES | — | `Instant` | Manual (field set in service) | 0 | — | — | **Type mismatch** |
| `mdx_archives` | `committed_at` | TIMESTAMPTZ | YES | `now()` | `Instant` | `@CreationTimestamp` | 0 | — | — | Match |
| `ai_analysis_log` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 8 | 8 | 0 | Match |
| `ai_analysis_log` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 8 | 8 | 0 | Match |
| `ai_analysis_log` | `moderated_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 8 | 6 | 2 | By design (2 not moderated) |
| `ai_analysis_log` | `started_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 8 | 8 | 0 | Match |
| `ai_analysis_log` | `completed_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 8 | 8 | 0 | Match |
| `ai_analysis_batch` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 0 | — | — | Match |
| `ai_analysis_batch` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 0 | — | — | Match |
| `ai_analysis_batch` | `started_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 0 | — | — | Match |
| `ai_analysis_batch` | `completed_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 0 | — | — | Match |
| `ai_api_usage` | `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 2 | 2 | 0 | Match |
| `ai_api_usage` | `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` | `LocalDateTime` | Manual lifecycle | 2 | 2 | 0 | Match |
| `ai_api_usage` | `last_request_at` | TIMESTAMPTZ | YES | — | `Instant` | Manual (field set in service) | 2 | 2 | 0 | Match |
| `event_publication` | `publication_date` | TIMESTAMP | NO | — | — | Spring Modulith framework | 20 | 20 | 0 | Framework-managed |
| `event_publication` | `completion_date` | TIMESTAMP | YES | — | — | Spring Modulith framework | 20 | 20 | 0 | Framework-managed |
| `event_publication` | `last_resubmission_date` | TIMESTAMPTZ | YES | — | — | Spring Modulith framework | 20 | 20 | 0 | Framework-managed |

## 2. Type Mismatches

**8 columns** where the Kotlin entity uses `Instant` (timezone-aware) but the DB column is `TIMESTAMP` (timezone-unaware):

| Entity | Field | Kotlin Type | DB Column | DB Type | Risk |
|--------|-------|-------------|-----------|---------|------|
| `Reaction` | `createdAt` | `Instant` | `reactions.created_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `Bookmark` | `createdAt` | `Instant` | `bookmarks.created_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `Suggestion` | `createdAt` | `Instant` | `suggestions.created_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `Suggestion` | `reviewedAt` | `Instant` | `suggestions.reviewed_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `StorySubmission` | `createdAt` | `Instant` | `story_submissions.created_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `StorySubmission` | `updatedAt` | `Instant` | `story_submissions.updated_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `StorySubmission` | `reviewedAt` | `Instant` | `story_submissions.reviewed_at` | `TIMESTAMP` | Timezone silently stripped on write |
| `StorySubmission` | `archivedAt` | `Instant` | `story_submissions.archived_at` | `TIMESTAMP` | Timezone silently stripped on write |

**How this manifests**: Hibernate converts `Instant` (which represents a point-in-time in UTC) to the JVM's default timezone before storing in a `TIMESTAMP` column. Since no `hibernate.jdbc.time_zone` is configured, the JVM's system timezone is used. If the server timezone changes (e.g., deploying to a different Cloud Run region, or local dev vs. production), timestamps could silently shift.

**Correctly matched columns** (for comparison): `content.created_at`, `content.updated_at`, `mdx_archives.committed_at` — these use `Instant` with `TIMESTAMPTZ`, which is the correct pairing.

## 3. Pattern Inconsistencies

### Three Distinct Timestamp Management Patterns

| Pattern | Mechanism | Kotlin Type | Entities |
|---------|-----------|-------------|----------|
| **AuditableEntity** | `@PrePersist`/`@PreUpdate` in shared base class | `LocalDateTime` | DirectoryEntry, GalleryMedia (+ subtypes), UserProfile, ContactMessage |
| **Manual lifecycle** | Own `@PrePersist`/`@PreUpdate` (duplicates AuditableEntity logic) | `LocalDateTime` | Town, AnalysisRun, AnalysisBatch, ApiUsageRecord |
| **Hibernate annotations** | `@CreationTimestamp`/`@UpdateTimestamp` | `Instant` | Reaction, Bookmark, Content, Suggestion, StorySubmission, MdxArchive |

**Issue**: The manual lifecycle pattern in Town, AnalysisRun, AnalysisBatch, and ApiUsageRecord duplicates `AuditableEntity`'s exact logic. These entities could extend `AuditableEntity` instead of reimplementing the same `@PrePersist`/`@PreUpdate` callbacks.

**Issue**: The AuditableEntity pattern uses `LocalDateTime` (no timezone) while the Hibernate annotation pattern uses `Instant` (timezone-aware). This means:
- Entities managed by AuditableEntity store timestamps without timezone context
- Entities using `@CreationTimestamp`/`@UpdateTimestamp` attempt to store timezone-aware `Instant` values, but most of their DB columns are `TIMESTAMP` (not `TIMESTAMPTZ`), losing the timezone information

### Special Cases

| Entity | Column | Pattern | Notes |
|--------|--------|---------|-------|
| `User` | `created_at` | Constructor default `Instant.now()` | Only entity with no lifecycle callback or Hibernate annotation for timestamps. Relies on Kotlin default + DB default. |
| `MediaModerationAudit` | `performed_at` | Constructor default `Instant.now()` | Immutable audit entity, no update timestamp needed. Correctly uses `Instant` + `TIMESTAMPTZ`. |
| `event_publication` | all | Spring Modulith framework | Framework-managed, no entity mapping. Mixed TIMESTAMP/TIMESTAMPTZ. |

## 4. Temporal Integrity

### 4a. NULL created_at Violations

**None found.** All rows across all tables have populated `created_at` values.

### 4b. NULL updated_at Violations

**None found.** All rows in tables with `updated_at` columns have populated values.

### 4c. updated_at < created_at Violations

**None found.** All rows maintain correct temporal ordering.

### 4d. Paired Field Consistency (timestamp + user ID)

All paired timestamp/user ID columns are consistent — no orphaned timestamps without corresponding user IDs or vice versa:

| Table | Timestamp | User ID | Mismatches |
|-------|-----------|---------|------------|
| `directory_entries` | `reviewed_at` | `reviewed_by` | 0 |
| `gallery_media` | `reviewed_at` | `reviewed_by` | 0 |
| `suggestions` | `reviewed_at` | `reviewed_by` | 0 |
| `story_submissions` | `reviewed_at` | `reviewed_by` | 0 |
| `ai_analysis_log` | `moderated_at` | `moderated_by` | 0 |

## 5. Missing DB Defaults

3 columns are `NOT NULL` in the database but have **no DB-level default**. They rely entirely on JPA lifecycle callbacks to provide values:

| Table | Column | Nullable | DB Default | Entity Pattern | Risk |
|-------|--------|----------|------------|---------------|------|
| `user_profiles` | `created_at` | NO | — | AuditableEntity `@PrePersist` | Direct SQL INSERT would fail |
| `user_profiles` | `updated_at` | NO | — | AuditableEntity `@PrePersist` | Direct SQL INSERT would fail |
| `bookmarks` | `created_at` | NO | — | `@CreationTimestamp` | Direct SQL INSERT would fail |

**Impact**: Low for normal application operation (JPA always sets these). But any direct SQL operations (data migrations, manual fixes, admin scripts) would fail with a NOT NULL constraint violation.

## 6. Nullable Audit Column

| Table | Column | DB Nullable | DB Default | Current Data |
|-------|--------|-------------|------------|-------------|
| `users` | `created_at` | YES | `now()` | 0 NULL (1 row) |

The `users.created_at` column is the only audit timestamp that is **nullable** in the database. While the DB default `now()` and Kotlin default `Instant.now()` prevent NULLs in practice, the schema does not enforce this. A direct SQL `INSERT` omitting `created_at` would use the default, but an explicit `INSERT ... VALUES (NULL)` would succeed.

## 7. No JPA Auditing Infrastructure

Confirmed absent:
- No `@EnableJpaAuditing` annotation
- No `@CreatedDate`/`@LastModifiedDate` annotations
- No `AuditorAware` bean implementation
- No `hibernate.jdbc.time_zone` configuration
- No JVM timezone configuration (`-Duser.timezone`)

## 8. Recommendations

### Priority 1: Fix Type Mismatches (High Impact, Medium Risk)

Migrate the 8 mismatched columns from `TIMESTAMP` to `TIMESTAMPTZ`:

```sql
-- V12: Standardize timestamp columns to TIMESTAMPTZ for Instant-mapped fields
ALTER TABLE reactions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE bookmarks ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE suggestions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE suggestions ALTER COLUMN reviewed_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN reviewed_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN archived_at TYPE TIMESTAMPTZ;
```

PostgreSQL handles `TIMESTAMP → TIMESTAMPTZ` conversion automatically using the server's timezone setting, so existing data is preserved. This eliminates silent timezone stripping.

### Priority 2: Add Hibernate Timezone Configuration (High Impact, Low Risk)

Add to `application.yml`:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
```

This ensures all `Instant` values are stored/read as UTC regardless of JVM timezone. Critical for Cloud Run deployments where server timezone may vary.

### Priority 3: Consolidate Manual Lifecycle Entities (Low Risk)

Refactor Town, AnalysisRun, AnalysisBatch, and ApiUsageRecord to extend `AuditableEntity` instead of duplicating `@PrePersist`/`@PreUpdate` callbacks. This reduces code duplication and ensures consistent behavior.

**Note**: AnalysisRun and AnalysisBatch also generate their own UUID in `@PrePersist` (`if (id == null) id = UUID.randomUUID()`). This can coexist with `AuditableEntity` by overriding `onCreate()` and calling `super.onCreate()`.

### Priority 4: Add Missing DB Defaults (Low Risk)

```sql
ALTER TABLE user_profiles ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_profiles ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookmarks ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
```

### Priority 5: Standardize on Instant/TIMESTAMPTZ (Strategic)

Long-term, consider migrating `AuditableEntity` from `LocalDateTime` to `Instant` and all audit columns from `TIMESTAMP` to `TIMESTAMPTZ`. This would:
- Align all entities on a single type (`Instant`)
- Make timezone handling explicit everywhere
- Enable correct behavior across timezones

**Affected columns** (currently `LocalDateTime` + `TIMESTAMP`):
- `directory_entries.created_at`, `directory_entries.updated_at`
- `gallery_media.created_at`, `gallery_media.updated_at`
- `user_profiles.created_at`, `user_profiles.updated_at`
- `contact_messages.created_at`, `contact_messages.updated_at`
- `towns.created_at`, `towns.updated_at`
- `ai_analysis_log.created_at`, `ai_analysis_log.updated_at`
- `ai_analysis_batch.created_at`, `ai_analysis_batch.updated_at`
- `ai_api_usage.created_at`, `ai_api_usage.updated_at`

This is a larger change (16 columns + AuditableEntity base class + 4 manual lifecycle entities) and should be bundled with Priority 3.

### Priority 6: Unify Timestamp Management Pattern (Strategic)

Choose one pattern for all entities:
- **Option A**: `AuditableEntity` with `Instant` + `TIMESTAMPTZ` (recommended — explicit, consistent, works with JPA lifecycle)
- **Option B**: `@CreationTimestamp`/`@UpdateTimestamp` with `Instant` + `TIMESTAMPTZ` (less code, Hibernate-managed)
- **Option C**: Spring Data JPA auditing with `@CreatedDate`/`@LastModifiedDate` + `@EnableJpaAuditing` (most standard, enables `@CreatedBy`/`@LastModifiedBy` for free)

Option A is the lowest-friction path given the existing `AuditableEntity` base class. Option C is the most standard Spring approach but requires the most migration work.
