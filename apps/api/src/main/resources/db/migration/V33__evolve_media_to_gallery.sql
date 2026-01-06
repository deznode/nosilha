-- ============================================================================
-- V33: Evolve media to gallery_media with Single Table Inheritance
-- ============================================================================
-- Gallery Module Migration: Consolidates media and curated_media into a single
-- gallery_media table using Single Table Inheritance pattern.
--
-- Migration Strategy:
-- 1. Rename media table to gallery_media
-- 2. Add discriminator column for STI (USER_UPLOAD vs EXTERNAL)
-- 3. Unify status enums (AVAILABLE→ACTIVE, DELETED→ARCHIVED)
-- 4. Add columns for external media (nullable for USER_UPLOAD)
-- 5. Migrate curated_media data into gallery_media
-- 6. Create necessary indexes
--
-- Safety: curated_media table is preserved for rollback capability
-- ============================================================================

-- Step 1: Rename media table to gallery_media
ALTER TABLE media RENAME TO gallery_media;

-- Step 2: Add discriminator column for Single Table Inheritance
-- All existing rows are USER_UPLOAD media
ALTER TABLE gallery_media ADD COLUMN media_source VARCHAR(20) NOT NULL DEFAULT 'USER_UPLOAD';

-- Step 3: Create unified gallery_media_status enum
-- Maps: AVAILABLE→ACTIVE, DELETED→ARCHIVED, keeps PENDING, PROCESSING, PENDING_REVIEW, FLAGGED
CREATE TYPE gallery_media_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'PENDING_REVIEW',
    'ACTIVE',
    'ARCHIVED',
    'FLAGGED',
    'REJECTED'
);

-- Step 4: Migrate status values from media_status to gallery_media_status
-- Add temporary column for new status
ALTER TABLE gallery_media ADD COLUMN new_status gallery_media_status;

-- Map old status values to new unified values
UPDATE gallery_media SET new_status =
    CASE status::text
        WHEN 'AVAILABLE' THEN 'ACTIVE'::gallery_media_status
        WHEN 'DELETED' THEN 'ARCHIVED'::gallery_media_status
        WHEN 'PENDING' THEN 'PENDING'::gallery_media_status
        WHEN 'PROCESSING' THEN 'PROCESSING'::gallery_media_status
        WHEN 'PENDING_REVIEW' THEN 'PENDING_REVIEW'::gallery_media_status
        WHEN 'FLAGGED' THEN 'FLAGGED'::gallery_media_status
        ELSE 'PENDING'::gallery_media_status
    END;

-- Drop old status column and rename new one
ALTER TABLE gallery_media DROP COLUMN status;
ALTER TABLE gallery_media RENAME COLUMN new_status TO status;
ALTER TABLE gallery_media ALTER COLUMN status SET NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN status SET DEFAULT 'PENDING'::gallery_media_status;

-- Step 5: Rename media_source enum column to avoid conflict (it's LOCAL, GOOGLE_PHOTOS, ADOBE_LIGHTROOM)
-- This is the upload source, not the STI discriminator
ALTER TABLE gallery_media RENAME COLUMN source TO upload_source;

-- Step 6: Add columns for external media (nullable for USER_UPLOAD rows)
ALTER TABLE gallery_media ADD COLUMN title VARCHAR(255);
ALTER TABLE gallery_media ADD COLUMN media_type VARCHAR(20);  -- IMAGE, VIDEO, AUDIO
ALTER TABLE gallery_media ADD COLUMN platform VARCHAR(30);              -- YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED
ALTER TABLE gallery_media ADD COLUMN external_id VARCHAR(255);          -- Platform-specific ID
ALTER TABLE gallery_media ADD COLUMN url VARCHAR(1000);                 -- Direct URL (for EXTERNAL media)
ALTER TABLE gallery_media ADD COLUMN thumbnail_url VARCHAR(1000);       -- Thumbnail URL
ALTER TABLE gallery_media ADD COLUMN author VARCHAR(255);               -- Content author
ALTER TABLE gallery_media ADD COLUMN submitted_by VARCHAR(100);         -- Community submitter
ALTER TABLE gallery_media ADD COLUMN curated_by VARCHAR(255);           -- Admin who curated (for EXTERNAL)

-- Step 7: Add audit fields that curated_media has but media doesn't
-- Note: media has uploaded_by, created_at, updated_at already
-- We'll use uploaded_by as created_by for consistency
ALTER TABLE gallery_media ADD COLUMN created_by VARCHAR(255);
ALTER TABLE gallery_media ADD COLUMN updated_by VARCHAR(255);

-- Migrate uploaded_by to created_by for existing records
UPDATE gallery_media SET created_by = uploaded_by WHERE uploaded_by IS NOT NULL;

-- Step 7b: Make user-upload-specific columns nullable for STI
-- These columns only apply to USER_UPLOAD media, not EXTERNAL media
-- EXTERNAL media will have NULL values for these fields
ALTER TABLE gallery_media ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN original_name DROP NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN content_type DROP NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN file_size DROP NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN storage_key DROP NOT NULL;
ALTER TABLE gallery_media ALTER COLUMN upload_source DROP NOT NULL;

-- Step 8: Migrate curated_media data into gallery_media
-- Note: curated_media doesn't have submitted_by, reviewed_by, reviewed_at, rejection_reason columns
-- These will be NULL for migrated external media (can be set later during moderation)
INSERT INTO gallery_media (
    id,
    media_source,
    title,
    description,
    category,
    display_order,
    status,
    media_type,
    platform,
    external_id,
    url,
    thumbnail_url,
    author,
    curated_by,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT
    id,
    'EXTERNAL'::VARCHAR(20),
    title,
    description,
    category,
    display_order,
    -- Map curated_media status to gallery_media_status
    CASE status::text
        WHEN 'ACTIVE' THEN 'ACTIVE'::gallery_media_status
        WHEN 'ARCHIVED' THEN 'ARCHIVED'::gallery_media_status
        WHEN 'PENDING_REVIEW' THEN 'PENDING_REVIEW'::gallery_media_status
        WHEN 'FLAGGED' THEN 'FLAGGED'::gallery_media_status
        WHEN 'REJECTED' THEN 'REJECTED'::gallery_media_status
        ELSE 'ACTIVE'::gallery_media_status
    END,
    media_type,
    platform,
    external_id,
    url,
    thumbnail_url,
    author,
    curated_by,
    created_at,
    updated_at,
    curated_by,          -- Use curated_by as created_by for external media
    curated_by           -- Use curated_by as updated_by for external media
FROM curated_media;

-- Step 9: Drop old indexes that need replacement
-- Note: PostgreSQL does NOT auto-rename indexes when a table is renamed.
-- All original indexes still have their idx_media_* names.
-- Indexes to keep (no action needed): idx_media_entry_id, idx_media_created_at,
-- idx_media_content_type, idx_media_ai_tags, idx_media_severity
DROP INDEX IF EXISTS idx_media_category;        -- Replace with idx_gallery_media_category_status
DROP INDEX IF EXISTS idx_media_status;          -- Replace with new status index using gallery_media_status enum
DROP INDEX IF EXISTS idx_media_pending_review;  -- Covered by new status index
DROP INDEX IF EXISTS idx_media_source;          -- Column renamed to upload_source, new discriminator uses media_source
DROP INDEX IF EXISTS idx_media_flagged;         -- Replace with idx_gallery_media_status_source

-- Step 10: Create indexes on new structure
CREATE INDEX idx_gallery_media_source ON gallery_media(media_source);
CREATE INDEX idx_gallery_media_status ON gallery_media(status);
CREATE INDEX idx_gallery_media_status_source ON gallery_media(status, media_source);
CREATE INDEX idx_gallery_media_category_status ON gallery_media(category, status);
CREATE INDEX idx_gallery_media_media_type ON gallery_media(media_type) WHERE media_source = 'EXTERNAL';
CREATE INDEX idx_gallery_media_platform ON gallery_media(platform) WHERE media_source = 'EXTERNAL';

-- Step 11: Add table and column comments
COMMENT ON TABLE gallery_media IS 'Unified gallery media table supporting both user uploads (USER_UPLOAD) and admin-curated external content (EXTERNAL) using Single Table Inheritance';
COMMENT ON COLUMN gallery_media.media_source IS 'STI discriminator: USER_UPLOAD (user-uploaded files) or EXTERNAL (admin-curated external content)';
COMMENT ON COLUMN gallery_media.status IS 'Publication status: PENDING, PROCESSING, PENDING_REVIEW, ACTIVE, ARCHIVED, FLAGGED, REJECTED';
COMMENT ON COLUMN gallery_media.upload_source IS 'Upload source for USER_UPLOAD media: LOCAL, GOOGLE_PHOTOS, ADOBE_LIGHTROOM (null for EXTERNAL)';
COMMENT ON COLUMN gallery_media.title IS 'Media title (required for EXTERNAL, optional for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.media_type IS 'Media type for EXTERNAL media: IMAGE, VIDEO, AUDIO (null for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.platform IS 'Platform for EXTERNAL media: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED (null for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.external_id IS 'Platform-specific ID for EXTERNAL media (e.g., YouTube video ID) (null for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.url IS 'Direct URL for EXTERNAL media or public URL for USER_UPLOAD';
COMMENT ON COLUMN gallery_media.thumbnail_url IS 'Thumbnail URL (for EXTERNAL media previews or USER_UPLOAD thumbnails)';
COMMENT ON COLUMN gallery_media.author IS 'Content author/creator (for EXTERNAL media) (null for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.submitted_by IS 'Community member who submitted (for both USER_UPLOAD and community-submitted EXTERNAL)';
COMMENT ON COLUMN gallery_media.curated_by IS 'Admin who curated EXTERNAL media (null for USER_UPLOAD)';
COMMENT ON COLUMN gallery_media.created_by IS 'User who created the record (maps to uploaded_by for USER_UPLOAD, curated_by for EXTERNAL)';
COMMENT ON COLUMN gallery_media.updated_by IS 'User who last updated the record';

-- Step 12: Note about cleanup
-- The curated_media table is preserved for rollback safety
-- After verifying the migration in production, manually run:
-- DROP TABLE curated_media;
-- DROP TYPE curated_media_status;

COMMENT ON TABLE curated_media IS '[DEPRECATED - kept for rollback] Migrated to gallery_media in V33. Can be dropped after verification.';
