-- V4: Gallery Media Table
-- Single Table Inheritance for user uploads (USER_UPLOAD) and external media (EXTERNAL).

CREATE TABLE gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    media_source VARCHAR(20) NOT NULL DEFAULT 'USER_UPLOAD',
    status gallery_media_status NOT NULL DEFAULT 'PENDING',

    -- User upload fields (nullable for EXTERNAL)
    file_name VARCHAR(255),
    original_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size BIGINT,
    storage_key VARCHAR(512),
    public_url VARCHAR(1024),
    upload_source media_source,
    source_id VARCHAR(512),

    -- External media fields (nullable for USER_UPLOAD)
    title VARCHAR(255),
    media_type VARCHAR(20),
    platform VARCHAR(30),
    external_id VARCHAR(255),
    url VARCHAR(1000),
    thumbnail_url VARCHAR(1000),
    author VARCHAR(255),
    curated_by VARCHAR(255),
    submitted_by VARCHAR(100),

    -- Shared fields
    category VARCHAR(100),
    description VARCHAR(2048),
    display_order INTEGER NOT NULL DEFAULT 0,
    entry_id UUID REFERENCES directory_entries(id) ON DELETE SET NULL,

    -- AI metadata (future integration)
    ai_tags TEXT[],
    ai_labels JSONB,
    ai_alt_text VARCHAR(1024),
    ai_description VARCHAR(2048),
    ai_processed_at TIMESTAMP WITH TIME ZONE,

    -- Moderation
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(1024),
    severity INT DEFAULT 0,

    -- Audit
    uploaded_by VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_media_entry_id ON gallery_media(entry_id);
CREATE INDEX idx_gallery_media_category ON gallery_media(category);
CREATE INDEX idx_gallery_media_created_at ON gallery_media(created_at DESC);
CREATE INDEX idx_gallery_media_content_type ON gallery_media(content_type);
CREATE INDEX idx_gallery_media_ai_tags ON gallery_media USING GIN(ai_tags);
CREATE INDEX idx_gallery_media_severity ON gallery_media(severity);
CREATE INDEX idx_gallery_media_source ON gallery_media(media_source);
CREATE INDEX idx_gallery_media_status ON gallery_media(status);
CREATE INDEX idx_gallery_media_status_source ON gallery_media(status, media_source);
CREATE INDEX idx_gallery_media_category_status ON gallery_media(category, status);
CREATE INDEX idx_gallery_media_media_type ON gallery_media(media_type) WHERE media_source = 'EXTERNAL';
CREATE INDEX idx_gallery_media_platform ON gallery_media(platform) WHERE media_source = 'EXTERNAL';
CREATE INDEX idx_gallery_media_flagged ON gallery_media(status) WHERE status = 'FLAGGED';

COMMENT ON COLUMN gallery_media.media_source IS 'STI discriminator: USER_UPLOAD or EXTERNAL';
COMMENT ON COLUMN gallery_media.status IS 'PENDING, PROCESSING, PENDING_REVIEW, ACTIVE, ARCHIVED, FLAGGED, REJECTED';
COMMENT ON COLUMN gallery_media.upload_source IS 'For USER_UPLOAD: LOCAL, GOOGLE_PHOTOS, ADOBE_LIGHTROOM';
COMMENT ON COLUMN gallery_media.media_type IS 'For EXTERNAL: IMAGE, VIDEO, AUDIO';
COMMENT ON COLUMN gallery_media.platform IS 'For EXTERNAL: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED';
COMMENT ON COLUMN gallery_media.severity IS 'Queue priority: 0=normal, 1=low, 2=medium, 3=high';
