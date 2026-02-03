-- ============================================================================
-- V29: Add story archival tracking fields
-- ============================================================================
-- Adds archived_at, archived_slug, and archived_by columns to story_submissions
-- to track when stories are archived to MDX format for publication
-- ============================================================================

-- Add archived fields to story_submissions table for MDX archival tracking
ALTER TABLE story_submissions
ADD COLUMN archived_at TIMESTAMP,
ADD COLUMN archived_slug VARCHAR(255),
ADD COLUMN archived_by VARCHAR(255);

-- Add index for querying archived stories
CREATE INDEX idx_story_submissions_archived_at ON story_submissions(archived_at);

-- Add comments for documentation
COMMENT ON COLUMN story_submissions.archived_at IS 'Timestamp when story was archived to MDX';
COMMENT ON COLUMN story_submissions.archived_slug IS 'URL slug used for the archived MDX file';
COMMENT ON COLUMN story_submissions.archived_by IS 'User ID of admin who performed the archival';
