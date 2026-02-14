-- V12: Standardize all TIMESTAMP columns to TIMESTAMPTZ
-- PostgreSQL TIMESTAMP -> TIMESTAMPTZ is metadata-only (no table rewrite)
-- This ensures timezone awareness across all audit and business timestamp columns

-- Towns
ALTER TABLE towns ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE towns ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Directory Entries
ALTER TABLE directory_entries ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE directory_entries ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Gallery Media
ALTER TABLE gallery_media ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE gallery_media ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- User Profiles
ALTER TABLE user_profiles ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE user_profiles ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Reactions
ALTER TABLE reactions ALTER COLUMN created_at TYPE TIMESTAMPTZ;

-- Bookmarks
ALTER TABLE bookmarks ALTER COLUMN created_at TYPE TIMESTAMPTZ;

-- Suggestions
ALTER TABLE suggestions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE suggestions ALTER COLUMN reviewed_at TYPE TIMESTAMPTZ;

-- Contact Messages
ALTER TABLE contact_messages ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE contact_messages ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Story Submissions
ALTER TABLE story_submissions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN reviewed_at TYPE TIMESTAMPTZ;
ALTER TABLE story_submissions ALTER COLUMN archived_at TYPE TIMESTAMPTZ;

-- AI Analysis Log
ALTER TABLE ai_analysis_log ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE ai_analysis_log ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- AI Analysis Batch
ALTER TABLE ai_analysis_batch ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE ai_analysis_batch ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- AI API Usage
ALTER TABLE ai_api_usage ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE ai_api_usage ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
