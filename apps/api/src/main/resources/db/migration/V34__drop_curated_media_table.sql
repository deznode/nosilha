-- ============================================================================
-- V34: Drop deprecated curated_media table
-- ============================================================================
-- The curated_media table was migrated to gallery_media in V33.
-- All external media data is now stored in gallery_media with media_source='EXTERNAL'.
-- This migration removes the deprecated table after verifying the migration was successful.
-- ============================================================================

-- Drop the deprecated curated_media table
DROP TABLE IF EXISTS curated_media;

-- Drop the deprecated curated_media_status enum type
DROP TYPE IF EXISTS curated_media_status;
