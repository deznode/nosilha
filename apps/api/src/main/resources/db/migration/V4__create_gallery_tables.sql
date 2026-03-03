-- V4: Gallery Tables (gallery_media, media_moderation_audit)
-- Gallery module: user uploads, external media, and moderation audit trail.

-- ============================================================
-- Gallery Media: STI for USER_UPLOAD and EXTERNAL media
-- ============================================================
CREATE TABLE gallery_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    media_source    VARCHAR(20) NOT NULL DEFAULT 'USER_UPLOAD',
    status          gallery_media_status NOT NULL DEFAULT 'PENDING',

    -- User upload fields (nullable for EXTERNAL)
    file_name       VARCHAR(255),
    original_name   VARCHAR(255),
    content_type    VARCHAR(100),
    file_size       BIGINT,
    storage_key     VARCHAR(512),
    public_url      VARCHAR(1024),
    upload_source   media_source,
    source_id       VARCHAR(512),

    -- External media fields (nullable for USER_UPLOAD)
    title           VARCHAR(255),
    media_type      VARCHAR(20),
    platform        VARCHAR(30),
    external_id     VARCHAR(255),
    url             VARCHAR(1000),
    thumbnail_url   VARCHAR(1000),
    author          VARCHAR(255),
    curated_by      UUID REFERENCES users(id),

    -- Shared fields
    category        VARCHAR(100),
    description     VARCHAR(2048),
    display_order   INTEGER NOT NULL DEFAULT 0,
    entry_id        UUID REFERENCES directory_entries(id) ON DELETE SET NULL,
    show_in_gallery BOOLEAN NOT NULL DEFAULT TRUE,
    alt_text        VARCHAR(1024),

    -- AI metadata
    ai_tags         TEXT[],
    ai_labels       JSONB,
    ai_alt_text     VARCHAR(1024),
    ai_description  VARCHAR(2048),
    ai_title        VARCHAR(256),
    ai_processed_at TIMESTAMPTZ,

    -- EXIF metadata
    latitude        DECIMAL(10, 7),
    longitude       DECIMAL(10, 7),
    altitude        DECIMAL(8, 2),
    date_taken      TIMESTAMPTZ,
    camera_make     VARCHAR(100),
    camera_model    VARCHAR(100),
    orientation     INTEGER DEFAULT 1,
    photo_type      VARCHAR(20),
    gps_privacy_level VARCHAR(20),

    -- Manual metadata (historical photos without EXIF)
    approximate_date    VARCHAR(100),
    location_name       VARCHAR(255),
    photographer_credit VARCHAR(255),
    archive_source      VARCHAR(255),

    -- Smart credits
    credit_platform VARCHAR(30),
    credit_handle   VARCHAR(100),

    -- Moderation
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    rejection_reason VARCHAR(1024),
    severity        INT DEFAULT 0,

    -- Audit
    uploaded_by     UUID REFERENCES users(id),
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Full-text search (generated stored column)
    search_vector   tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(location_name, '')), 'C')
    ) STORED
);

-- Standard indexes
CREATE INDEX idx_gallery_media_entry_id ON gallery_media(entry_id);
CREATE INDEX idx_gallery_media_category ON gallery_media(category);
CREATE INDEX idx_gallery_media_created_at ON gallery_media(created_at DESC);
CREATE INDEX idx_gallery_media_content_type ON gallery_media(content_type);
CREATE INDEX idx_gallery_media_ai_tags ON gallery_media USING GIN(ai_tags);
CREATE INDEX idx_gallery_media_severity ON gallery_media(severity);
CREATE INDEX idx_gallery_media_source ON gallery_media(media_source);
CREATE INDEX idx_gallery_media_status ON gallery_media(status);

-- Composite indexes
CREATE INDEX idx_gallery_media_status_source ON gallery_media(status, media_source);
CREATE INDEX idx_gallery_media_category_status ON gallery_media(category, status);

-- Partial indexes
CREATE INDEX idx_gallery_media_media_type ON gallery_media(media_type) WHERE media_source = 'EXTERNAL';
CREATE INDEX idx_gallery_media_platform ON gallery_media(platform) WHERE media_source = 'EXTERNAL';
CREATE INDEX idx_gallery_media_flagged ON gallery_media(status) WHERE status = 'FLAGGED';
CREATE INDEX idx_gallery_media_location ON gallery_media(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_gallery_media_date_taken ON gallery_media(date_taken) WHERE date_taken IS NOT NULL;
CREATE INDEX idx_gallery_media_gallery_visible ON gallery_media(status, show_in_gallery, display_order) WHERE show_in_gallery = TRUE;
CREATE INDEX idx_gallery_media_search ON gallery_media USING GIN(search_vector) WHERE status = 'ACTIVE' AND show_in_gallery = true;

-- Unique partial index
CREATE UNIQUE INDEX uq_gallery_media_storage_key ON gallery_media(storage_key) WHERE storage_key IS NOT NULL;

COMMENT ON COLUMN gallery_media.media_source IS 'STI discriminator: USER_UPLOAD or EXTERNAL';
COMMENT ON COLUMN gallery_media.status IS 'PENDING, PROCESSING, PENDING_REVIEW, ACTIVE, ARCHIVED, FLAGGED, REJECTED';
COMMENT ON COLUMN gallery_media.upload_source IS 'For USER_UPLOAD: LOCAL, GOOGLE_PHOTOS, ADOBE_LIGHTROOM';
COMMENT ON COLUMN gallery_media.media_type IS 'For EXTERNAL: IMAGE, VIDEO, AUDIO';
COMMENT ON COLUMN gallery_media.platform IS 'For EXTERNAL: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED';
COMMENT ON COLUMN gallery_media.severity IS 'Queue priority: 0=normal, 1=low, 2=medium, 3=high';
COMMENT ON COLUMN gallery_media.latitude IS 'GPS latitude from EXIF (privacy-processed based on photo_type)';
COMMENT ON COLUMN gallery_media.longitude IS 'GPS longitude from EXIF (privacy-processed based on photo_type)';
COMMENT ON COLUMN gallery_media.altitude IS 'GPS altitude in meters from EXIF';
COMMENT ON COLUMN gallery_media.date_taken IS 'Original capture date from EXIF DateTimeOriginal';
COMMENT ON COLUMN gallery_media.camera_make IS 'Camera manufacturer from EXIF (e.g., Apple, Canon)';
COMMENT ON COLUMN gallery_media.camera_model IS 'Camera model from EXIF (e.g., iPhone 13 Pro)';
COMMENT ON COLUMN gallery_media.orientation IS 'EXIF orientation (1-8) for display rotation';
COMMENT ON COLUMN gallery_media.photo_type IS 'CULTURAL_SITE, COMMUNITY_EVENT, or PERSONAL - determines GPS privacy';
COMMENT ON COLUMN gallery_media.gps_privacy_level IS 'FULL, APPROXIMATE, STRIPPED, or NONE - actual privacy applied';
COMMENT ON COLUMN gallery_media.approximate_date IS 'Manual date entry for historical photos (e.g., circa 1960s)';
COMMENT ON COLUMN gallery_media.location_name IS 'Manual location name for historical photos (e.g., Vila Nova Sintra)';
COMMENT ON COLUMN gallery_media.photographer_credit IS 'Photographer name if known';
COMMENT ON COLUMN gallery_media.archive_source IS 'Source of historical photo (e.g., Family collection)';
COMMENT ON COLUMN gallery_media.credit_platform IS 'Detected social platform: YOUTUBE, INSTAGRAM, FACEBOOK, TWITTER, TIKTOK';
COMMENT ON COLUMN gallery_media.credit_handle IS 'Normalized social media handle (without @ prefix)';

-- ============================================================
-- Media Moderation Audit: audit trail for moderation actions
-- ============================================================
CREATE TABLE media_moderation_audit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id        UUID NOT NULL REFERENCES gallery_media(id) ON DELETE CASCADE,
    action          VARCHAR(20) NOT NULL,
    previous_status VARCHAR(20),
    new_status      VARCHAR(20),
    reason          VARCHAR(1024),
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_moderation_audit_media_id ON media_moderation_audit(media_id);

COMMENT ON COLUMN media_moderation_audit.action IS 'Moderation action: APPROVE, FLAG, REJECT';
COMMENT ON COLUMN media_moderation_audit.created_by IS 'References users.id; SET NULL on deletion to preserve audit trail';
