# Audit: Empty User ID Fields in Database

**Date**: 2026-02-12
**Branch**: `fix/013-gallery-display-names`
**Database**: Local development (nosilha_db)

## 1. Summary Table

| Table | Column | Type | Total Rows | Populated | NULL | Classification |
|-------|--------|------|-----------|-----------|------|----------------|
| `gallery_media` | `created_by` | varchar | 14 | 0 | 14 | **Orphaned column** |
| `gallery_media` | `updated_by` | varchar | 14 | 0 | 14 | **Orphaned column** |
| `gallery_media` | `submitted_by` | varchar | 14 | 0 | 14 | **Orphaned column** |
| `gallery_media` | `uploaded_by` | varchar | 14 | 13 | 1 | **Potential bug** (1 record) |
| `gallery_media` | `curated_by` | varchar | 14 | 0 | 14 | By design (no EXTERNAL media) |
| `gallery_media` | `reviewed_by` | uuid | 14 | 6 | 8 | By design (8 unreviewed) |
| `directory_entries` | `submitted_by` | varchar | 8 | 0 | 8 | Seed data |
| `directory_entries` | `reviewed_by` | varchar | 8 | 0 | 8 | Seed data |
| `directory_entries` | `submitted_by_email` | varchar | 8 | 0 | 8 | Seed data |
| `ai_analysis_log` | `requested_by` | uuid | 8 | 8 | 0 | All populated |
| `ai_analysis_log` | `moderated_by` | uuid | 8 | 6 | 2 | By design (2 not yet moderated) |
| `ai_analysis_batch` | `requested_by` | uuid | 0 | — | — | No data |
| `media_moderation_audit` | `performed_by` | uuid | 6 | 6 | 0 | All populated |
| `suggestions` | `reviewed_by` | varchar | 0 | — | — | No data |
| `contact_messages` | *(none)* | — | 0 | — | — | No user ID columns (by design) |
| `story_submissions` | `author_id` | varchar | 0 | — | — | No data |
| `story_submissions` | `reviewed_by` | varchar | 0 | — | — | No data |
| `story_submissions` | `archived_by` | varchar | 0 | — | — | No data |
| `reactions` | `user_id` | uuid | 0 | — | — | No data |
| `bookmarks` | `user_id` | varchar | 0 | — | — | No data |
| `users` | `full_name` | varchar | 1 | 1 | 0 | All populated |
| `user_profiles` | `display_name` | varchar | 1 | 0 | 1 | **Potential gap** |

## 2. Orphaned Columns

Three columns in `gallery_media` exist in the database (added by V4 migration) but **no Kotlin entity maps to them**. They are always NULL and will never be populated by the application.

| Column | Migration | Line | Why Orphaned |
|--------|-----------|------|-------------|
| `gallery_media.created_by` | V4 | 52 | No entity field maps to this column. `AuditableEntity` tracks timestamps only (`created_at`/`updated_at`), not user IDs. No `@CreatedBy`/`AuditorAware` exists. |
| `gallery_media.updated_by` | V4 | 53 | Same as above — no `@LastModifiedBy` auditing configured. |
| `gallery_media.submitted_by` | V4 | 29 | Superseded by STI-specific fields: `UserUploadedMedia.uploaded_by` and `ExternalMedia.curated_by`. The generic `submitted_by` is never used. |

**Impact**: No functional impact. These columns waste storage and create confusion during audits.

## 3. Potential Bugs

### 3a. USER_UPLOAD without `uploaded_by`

**Record**: `c96a39e9-b3b9-4d42-9dfe-c06d07d7400b`

| Field | Value |
|-------|-------|
| `media_source` | USER_UPLOAD |
| `status` | ACTIVE |
| `uploaded_by` | NULL |
| `reviewed_by` | NULL |
| `file_name` | NULL |
| `original_name` | NULL |
| `public_url` | `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800` |
| `created_at` | 2026-02-10 02:42:13 |

**Analysis**: This record has `media_source = USER_UPLOAD` but behaves like EXTERNAL media — it has an external Unsplash URL, no local file, and no `uploaded_by` user. It was likely created through a non-standard code path (direct DB insert or testing). It reached ACTIVE status without review (`reviewed_by` is NULL), bypassing the normal moderation workflow.

**Severity**: Low — likely test data, not a code-path bug. The `GalleryService.uploadMedia()` method does set `uploaded_by` from the authenticated user (line 286). However, the lack of a NOT NULL constraint on `uploaded_by` for USER_UPLOAD records means the database doesn't enforce this invariant.

### 3b. `user_profiles.display_name` is NULL

The single user profile (`911fe84f-5c4a-4383-bc50-24ec50072e59`) has `display_name = NULL`. The corresponding `users` record has `full_name = 'Joaquim Costa'`.

**Impact**: Low — the gallery display names PR (`fix/013-gallery-display-names`) already resolves display by falling back to `users.full_name` when `display_name` is NULL.

## 4. Seed Data (Expected NULLs)

All 8 `directory_entries` records were inserted by the V9 migration (`V9__seed_reference_data.sql`) with fixed UUIDs (`11111111-...` through `88888888-...`). These were INSERTed directly without user context, so `submitted_by`, `reviewed_by`, and `submitted_by_email` are all NULL.

| Entry | UUID | Status |
|-------|------|--------|
| Djabraba's Eco-Lodge | `11111111-...` | PUBLISHED |
| Faja d'Agua | `22222222-...` | PUBLISHED |
| Igreja Nossa Senhora do Monte | `33333333-...` | PUBLISHED |
| Casa Eugenio Tavares | `44444444-...` | PUBLISHED |
| Praca Eugenio Tavares | `55555555-...` | PUBLISHED |
| Pousada Nova Sintra | `66666666-...` | PUBLISHED |
| Pensao Paulo | `77777777-...` | PUBLISHED |
| Nos Raiz | `88888888-...` | PUBLISHED |

**Impact**: None — seed data is expected to lack user attribution. No action needed.

## 5. By-Design NULLs

| Table.Column | NULL Count | Reason |
|-------------|-----------|--------|
| `gallery_media.curated_by` | 14 | No EXTERNAL media records exist yet — only USER_UPLOAD. Will be populated when external media is curated. |
| `gallery_media.reviewed_by` | 8 | 7 records are PENDING_REVIEW (not yet reviewed) + 1 anomalous ACTIVE record (see bug 3a). |
| `ai_analysis_log.moderated_by` | 2 | AI analysis completed but moderation not yet performed — expected workflow state. |

## 6. Integrity Gaps

### 6a. Cross-Reference Results (All Clean)

All user IDs stored in the database reference valid `user_profiles` records:

| Check | Orphaned IDs Found |
|-------|-------------------|
| `gallery_media.uploaded_by` → `user_profiles.user_id` | 0 |
| `gallery_media.reviewed_by` → `user_profiles.user_id` | 0 |
| `directory_entries.submitted_by` → `user_profiles.user_id` | 0 |
| `ai_analysis_log.requested_by` → `user_profiles.user_id` | 0 |
| `ai_analysis_log.moderated_by` → `user_profiles.user_id` | 0 |
| `media_moderation_audit.performed_by` → `user_profiles.user_id` | 0 |

### 6b. Missing FK Constraints

Only **2 of 17** user reference columns have foreign key constraints:

| Column | FK Target | Has FK? |
|--------|-----------|---------|
| `gallery_media.reviewed_by` | `users.id` | Yes |
| `media_moderation_audit.performed_by` | `users.id` | Yes |
| All other 15 user reference columns | — | **No** |

This means the database does not enforce referential integrity for most user references. If a user were deleted, orphaned IDs would silently remain.

### 6c. Data Type Inconsistency

User reference columns use **mixed types** across tables:

| Type | Columns |
|------|---------|
| **UUID** | `reactions.user_id`, `gallery_media.reviewed_by`, `ai_analysis_log.requested_by`, `ai_analysis_log.moderated_by`, `ai_analysis_batch.requested_by`, `media_moderation_audit.performed_by` |
| **VARCHAR** | `bookmarks.user_id`, `gallery_media.uploaded_by`, `gallery_media.curated_by`, `gallery_media.submitted_by`, `directory_entries.submitted_by`, `directory_entries.reviewed_by`, `story_submissions.author_id`, `story_submissions.reviewed_by`, `story_submissions.archived_by`, `suggestions.reviewed_by`, `user_profiles.user_id` |

All store Supabase Auth UUIDs, but the storage types differ. This prevents uniform FK constraints and requires type casting in cross-table queries.

## 7. Recommendations

### Priority 1: Clean Up Orphaned Columns (Low Risk)

Create a Flyway migration to drop the 3 orphaned `gallery_media` columns:

```sql
ALTER TABLE gallery_media DROP COLUMN created_by;
ALTER TABLE gallery_media DROP COLUMN updated_by;
ALTER TABLE gallery_media DROP COLUMN submitted_by;
```

These columns are never populated by the application and serve no purpose.

### Priority 2: Clean Up Anomalous Record (Low Risk)

Investigate and either fix or delete the record `c96a39e9-b3b9-4d42-9dfe-c06d07d7400b` — a USER_UPLOAD with no `uploaded_by`, no local file, and an external Unsplash URL.

### Priority 3: Standardize User ID Column Types (Medium Risk)

Consider a migration to standardize all user reference columns to UUID type. This would enable uniform FK constraints and eliminate type casting in queries. Affected: 11 VARCHAR columns storing UUIDs.

### Priority 4: Add FK Constraints (Medium Risk)

After type standardization, add FK constraints on key user reference columns:
- `gallery_media.uploaded_by` → `users.id`
- `gallery_media.curated_by` → `users.id`
- `directory_entries.submitted_by` → `users.id`
- `story_submissions.author_id` → `users.id`
- `bookmarks.user_id` → `users.id`

### Priority 5: Consider Generic Auditing (Low Priority)

The `AuditableEntity` base class tracks only timestamps. Adding `@CreatedBy`/`@LastModifiedBy` with an `AuditorAware<String>` bean would automatically populate creator/modifier on all entities. However, this is a larger architectural decision — the current per-module approach with domain-specific fields (`uploaded_by`, `curated_by`, `author_id`) is more expressive and intentional. Generic auditing would be complementary, not a replacement.
