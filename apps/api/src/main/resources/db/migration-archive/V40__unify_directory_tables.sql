-- V40__unify_directory_tables.sql
-- Unify directory_submissions into directory_entries following DDD aggregate pattern.
-- A directory entry is a single aggregate that transitions through lifecycle states.
--
-- Status workflow: DRAFT → PENDING → APPROVED → PUBLISHED → ARCHIVED
-- - DRAFT: User is still editing (future use)
-- - PENDING: Awaiting admin review (default for submissions)
-- - APPROVED: Admin approved, ready to publish
-- - PUBLISHED: Live on site (default for seeded entries)
-- - ARCHIVED: Soft-deleted
--
-- This migration:
-- 1. Adds moderation/workflow columns to directory_entries
-- 2. Migrates existing submissions data
-- 3. Drops the old directory_submissions tables

-- =====================================================
-- STEP 1: Add moderation/workflow columns to directory_entries
-- =====================================================

-- Add status column with default PUBLISHED (for existing seeded entries)
ALTER TABLE directory_entries
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED';

-- Add moderation metadata columns
ALTER TABLE directory_entries
    ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS submitted_by_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
    ADD COLUMN IF NOT EXISTS admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add submission-specific fields that exist in directory_submissions
ALTER TABLE directory_entries
    ADD COLUMN IF NOT EXISTS price_level VARCHAR(5),
    ADD COLUMN IF NOT EXISTS custom_town VARCHAR(100);

-- =====================================================
-- STEP 2: Add status constraint
-- =====================================================

ALTER TABLE directory_entries
    ADD CONSTRAINT chk_directory_entries_status
    CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'ARCHIVED'));

-- =====================================================
-- STEP 3: Create index for status filtering (admin queue)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_directory_entries_status ON directory_entries(status);
CREATE INDEX IF NOT EXISTS idx_directory_entries_status_created ON directory_entries(status, created_at DESC);

-- =====================================================
-- STEP 4: Migrate existing submissions to directory_entries
-- =====================================================

-- Insert directory_submissions into directory_entries
-- Map category enum values to STI discriminator values:
-- RESTAURANT → Restaurant, HOTEL → Hotel, BEACH → Beach, HERITAGE → Heritage, NATURE → Nature
INSERT INTO directory_entries (
    id,
    name,
    slug,
    description,
    category,
    town,
    latitude,
    longitude,
    image_url,
    tags,
    status,
    submitted_by,
    submitted_by_email,
    ip_address,
    admin_notes,
    reviewed_by,
    reviewed_at,
    price_level,
    custom_town,
    created_at,
    updated_at
)
SELECT
    ds.id,
    ds.name,
    -- Generate slug from name: lowercase, replace non-alphanumeric with hyphens, append UUID prefix for uniqueness
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(ds.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || SUBSTRING(ds.id::text, 1, 8),
    ds.description,
    -- Map category enum to STI discriminator values (capitalized first letter)
    CASE ds.category
        WHEN 'RESTAURANT' THEN 'Restaurant'
        WHEN 'HOTEL' THEN 'Hotel'
        WHEN 'BEACH' THEN 'Beach'
        WHEN 'HERITAGE' THEN 'Heritage'
        WHEN 'NATURE' THEN 'Nature'
    END,
    -- Use custom_town if provided, otherwise use town
    COALESCE(ds.custom_town, ds.town),
    -- Convert DECIMAL to DOUBLE PRECISION, default to 0 if null
    COALESCE(ds.latitude::double precision, 0),
    COALESCE(ds.longitude::double precision, 0),
    ds.image_url,
    NULL, -- tags will be migrated separately from directory_submission_tags
    ds.status::VARCHAR,
    ds.submitted_by,
    ds.submitted_by_email,
    ds.ip_address,
    ds.admin_notes,
    ds.reviewed_by,
    ds.reviewed_at,
    ds.price_level,
    ds.custom_town,
    ds.created_at,
    ds.updated_at
FROM directory_submissions ds
WHERE NOT EXISTS (
    -- Skip if already exists (idempotent migration)
    SELECT 1 FROM directory_entries de WHERE de.id = ds.id
);

-- =====================================================
-- STEP 5: Migrate tags from directory_submission_tags
-- =====================================================

-- Update tags column with comma-separated tags from the collection table
UPDATE directory_entries de
SET tags = (
    SELECT STRING_AGG(dst.tag, ',')
    FROM directory_submission_tags dst
    WHERE dst.submission_id = de.id
)
WHERE de.submitted_by IS NOT NULL
  AND EXISTS (SELECT 1 FROM directory_submission_tags WHERE submission_id = de.id);

-- =====================================================
-- STEP 6: Drop old tables
-- =====================================================

-- Drop directory_submission_tags first (has FK to directory_submissions)
DROP TABLE IF EXISTS directory_submission_tags;

-- Drop directory_submissions table
DROP TABLE IF EXISTS directory_submissions;

-- =====================================================
-- STEP 7: Add comments for documentation
-- =====================================================

COMMENT ON COLUMN directory_entries.status IS 'Lifecycle status: DRAFT, PENDING, APPROVED, PUBLISHED, ARCHIVED';
COMMENT ON COLUMN directory_entries.submitted_by IS 'User ID of the community member who submitted (null for seeded entries)';
COMMENT ON COLUMN directory_entries.submitted_by_email IS 'Email of the submitter (optional, for contact)';
COMMENT ON COLUMN directory_entries.ip_address IS 'Submitter IP address for rate limiting (IPv4 or IPv6)';
COMMENT ON COLUMN directory_entries.admin_notes IS 'Admin notes for moderation decisions';
COMMENT ON COLUMN directory_entries.reviewed_by IS 'User ID of admin who reviewed the submission';
COMMENT ON COLUMN directory_entries.reviewed_at IS 'Timestamp when submission was reviewed';
COMMENT ON COLUMN directory_entries.price_level IS 'Price level indicator: $, $$, or $$$';
COMMENT ON COLUMN directory_entries.custom_town IS 'Custom town name if not in predefined list';
