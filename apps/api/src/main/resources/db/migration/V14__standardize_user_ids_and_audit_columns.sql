-- V14: Add created_by/updated_by audit columns to all entity tables
-- VARCHAR->UUID conversion and column renames are deferred to V16 (Wave 2)

-- ============================================================
-- Part 1: New audit columns for AuditableEntity tables (created_by + updated_by)
-- ============================================================

ALTER TABLE towns ADD COLUMN created_by UUID;
ALTER TABLE towns ADD COLUMN updated_by UUID;

ALTER TABLE directory_entries ADD COLUMN created_by UUID;
ALTER TABLE directory_entries ADD COLUMN updated_by UUID;

ALTER TABLE gallery_media ADD COLUMN created_by UUID;
ALTER TABLE gallery_media ADD COLUMN updated_by UUID;

ALTER TABLE user_profiles ADD COLUMN created_by UUID;
ALTER TABLE user_profiles ADD COLUMN updated_by UUID;

ALTER TABLE contact_messages ADD COLUMN created_by UUID;
ALTER TABLE contact_messages ADD COLUMN updated_by UUID;

ALTER TABLE ai_analysis_log ADD COLUMN created_by UUID;
ALTER TABLE ai_analysis_log ADD COLUMN updated_by UUID;

ALTER TABLE ai_analysis_batch ADD COLUMN created_by UUID;
ALTER TABLE ai_analysis_batch ADD COLUMN updated_by UUID;

ALTER TABLE ai_api_usage ADD COLUMN created_by UUID;
ALTER TABLE ai_api_usage ADD COLUMN updated_by UUID;

ALTER TABLE content ADD COLUMN created_by UUID;
ALTER TABLE content ADD COLUMN updated_by UUID;

ALTER TABLE story_submissions ADD COLUMN created_by UUID;
ALTER TABLE story_submissions ADD COLUMN updated_by UUID;

-- ============================================================
-- Part 2: New audit columns for CreatableEntity tables (created_by only)
-- ============================================================

ALTER TABLE reactions ADD COLUMN created_by UUID;
ALTER TABLE bookmarks ADD COLUMN created_by UUID;
ALTER TABLE suggestions ADD COLUMN created_by UUID;

-- ============================================================
-- Part 3: Users table audit column
-- ============================================================

ALTER TABLE users ADD COLUMN created_by UUID;
