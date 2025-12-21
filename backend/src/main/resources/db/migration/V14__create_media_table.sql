-- ============================================================================
-- V14: Create media table
-- ============================================================================
-- Replaces Firestore-based ImageMetadata storage with PostgreSQL.
-- Provides local filesystem storage for development with placeholder columns
-- for future AI integration (Cloud Vision, etc.)
-- ============================================================================

CREATE TABLE media (
    -- Primary key (UUID, consistent with other entities)
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core media fields
    file_name       VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       BIGINT NOT NULL,

    -- Storage location
    storage_path    VARCHAR(1024) NOT NULL,
    public_url      VARCHAR(1024),

    -- Association with directory entry (optional)
    entry_id        UUID REFERENCES directory_entries(id) ON DELETE SET NULL,

    -- User-provided metadata
    category        VARCHAR(100),
    description     VARCHAR(2048),
    display_order   INTEGER NOT NULL DEFAULT 0,

    -- AI-generated metadata (nullable placeholders for future integration)
    ai_tags         TEXT[],
    ai_labels       JSONB,
    ai_alt_text     VARCHAR(1024),
    ai_description  VARCHAR(2048),
    ai_processed_at TIMESTAMP WITH TIME ZONE,

    -- Audit fields (consistent with AuditableEntity)
    uploaded_by     VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_media_entry_id ON media(entry_id);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_content_type ON media(content_type);

-- GIN index for efficient tag searching (future AI integration)
CREATE INDEX idx_media_ai_tags ON media USING GIN(ai_tags);

COMMENT ON TABLE media IS 'Stores media file metadata with optional AI-generated annotations';
COMMENT ON COLUMN media.ai_tags IS 'AI-generated tags for image classification (Cloud Vision labels)';
COMMENT ON COLUMN media.ai_labels IS 'Structured AI labels with confidence scores (JSONB)';
COMMENT ON COLUMN media.ai_alt_text IS 'AI-generated alt text for accessibility';
COMMENT ON COLUMN media.ai_description IS 'AI-generated description of the media content';
COMMENT ON COLUMN media.ai_processed_at IS 'Timestamp when AI processing was completed';
