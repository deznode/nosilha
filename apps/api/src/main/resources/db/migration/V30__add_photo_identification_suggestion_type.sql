-- V30: Add PHOTO_IDENTIFICATION suggestion type and media_id column
-- Supports the "Help Identify This" feature for gallery photos with incomplete metadata.

-- 1. Add nullable media_id column for linking suggestions to gallery media
ALTER TABLE suggestions ADD COLUMN media_id UUID;

-- 2. Update suggestion_type CHECK constraint to include PHOTO_IDENTIFICATION
ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS chk_suggestion_type;
ALTER TABLE suggestions ADD CONSTRAINT chk_suggestion_type
    CHECK (suggestion_type IN ('CORRECTION', 'ADDITION', 'FEEDBACK', 'PHOTO_IDENTIFICATION'));

-- 3. Index for querying suggestions by media item
CREATE INDEX idx_suggestions_media_id ON suggestions(media_id);
