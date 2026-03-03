-- ============================================================================
-- V15: Add media status and source enums for moderation workflow
-- ============================================================================
-- Adds status lifecycle (PENDING -> PROCESSING -> PENDING_REVIEW -> AVAILABLE/DELETED)
-- Adds source tracking for upload origin (LOCAL, GOOGLE_PHOTOS, ADOBE_LIGHTROOM)
-- Renames storage_path to storage_key for R2 object key compatibility
-- ============================================================================

-- Add media status enum type
-- NOTE: Values are UPPERCASE to match Kotlin enum names for Hibernate NAMED_ENUM mapping
CREATE TYPE media_status AS ENUM ('PENDING', 'PROCESSING', 'PENDING_REVIEW', 'AVAILABLE', 'DELETED');

-- Add media source enum type
CREATE TYPE media_source AS ENUM ('LOCAL', 'GOOGLE_PHOTOS', 'ADOBE_LIGHTROOM');

-- Add new columns to media table
ALTER TABLE media ADD COLUMN status media_status NOT NULL DEFAULT 'PENDING';
ALTER TABLE media ADD COLUMN source media_source NOT NULL DEFAULT 'LOCAL';
ALTER TABLE media ADD COLUMN source_id VARCHAR(512);
ALTER TABLE media ADD COLUMN reviewed_by UUID REFERENCES users(id);
ALTER TABLE media ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE media ADD COLUMN rejection_reason VARCHAR(1024);

-- Rename storage_path to storage_key for R2 compatibility
ALTER TABLE media RENAME COLUMN storage_path TO storage_key;
ALTER TABLE media ALTER COLUMN storage_key TYPE VARCHAR(512);

-- Indexes for status queries
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_pending_review ON media(status) WHERE status = 'PENDING_REVIEW';
CREATE INDEX idx_media_source ON media(source);

-- Comments
COMMENT ON COLUMN media.status IS 'Media lifecycle state: PENDING, PROCESSING, PENDING_REVIEW, AVAILABLE, DELETED';
COMMENT ON COLUMN media.source IS 'Upload origin: LOCAL (device), GOOGLE_PHOTOS, or ADOBE_LIGHTROOM';
COMMENT ON COLUMN media.source_id IS 'External identifier for cloud-imported media';
COMMENT ON COLUMN media.reviewed_by IS 'Admin user who approved or rejected the media';
COMMENT ON COLUMN media.reviewed_at IS 'Timestamp of approval or rejection';
COMMENT ON COLUMN media.rejection_reason IS 'Reason provided when media is rejected';
