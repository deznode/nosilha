-- V16: VARCHAR->UUID conversions for user reference columns + column renames
-- Deferred from original V14 (Wave 1) to Wave 2

-- ============================================================
-- Part 1: VARCHAR -> UUID conversions (11 columns)
-- ============================================================

-- Gallery Media
ALTER TABLE gallery_media ALTER COLUMN uploaded_by TYPE UUID USING uploaded_by::uuid;
ALTER TABLE gallery_media ALTER COLUMN curated_by TYPE UUID USING curated_by::uuid;

-- Directory Entries
ALTER TABLE directory_entries ALTER COLUMN submitted_by TYPE UUID USING submitted_by::uuid;
ALTER TABLE directory_entries ALTER COLUMN reviewed_by TYPE UUID USING reviewed_by::uuid;

-- Story Submissions
ALTER TABLE story_submissions ALTER COLUMN author_id TYPE UUID USING author_id::uuid;
ALTER TABLE story_submissions ALTER COLUMN reviewed_by TYPE UUID USING reviewed_by::uuid;
ALTER TABLE story_submissions ALTER COLUMN archived_by TYPE UUID USING archived_by::uuid;

-- Suggestions
ALTER TABLE suggestions ALTER COLUMN reviewed_by TYPE UUID USING reviewed_by::uuid;

-- User Profiles
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Bookmarks
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- ============================================================
-- Part 2: Column renames (former standalone entities -> CreatableEntity)
-- ============================================================

-- MDX Archives: committedAt/committedBy -> createdAt/createdBy
ALTER TABLE mdx_archives RENAME COLUMN committed_at TO created_at;
ALTER TABLE mdx_archives RENAME COLUMN committed_by TO created_by;
ALTER TABLE mdx_archives ALTER COLUMN created_by TYPE UUID USING created_by::uuid;

-- Media Moderation Audit: performedAt/performedBy -> createdAt/createdBy
ALTER TABLE media_moderation_audit RENAME COLUMN performed_at TO created_at;
ALTER TABLE media_moderation_audit RENAME COLUMN performed_by TO created_by;

-- ============================================================
-- Part 3: Fix indexes referencing renamed columns
-- ============================================================

-- mdx_archives: drop old index, create new one with renamed column
DROP INDEX IF EXISTS idx_mdx_archives_committed_at;
CREATE INDEX idx_mdx_archives_created_at ON mdx_archives (created_at);
