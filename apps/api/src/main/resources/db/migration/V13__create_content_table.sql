-- Migration: Create content table for content registration
-- Purpose: Store content metadata for reaction tracking in MDX content platform

CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: one entry per slug/type combination
    CONSTRAINT uq_content_slug_type UNIQUE (slug, content_type),

    -- Content type must be valid enum value
    CONSTRAINT chk_content_type CHECK (content_type IN ('ARTICLE', 'PAGE', 'DIRECTORY_ENTRY'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_content_slug ON content (slug);
CREATE INDEX IF NOT EXISTS idx_content_type ON content (content_type);

-- Comment on table and columns
COMMENT ON TABLE content IS 'Registered content for reaction tracking';
COMMENT ON COLUMN content.id IS 'Unique identifier for the content';
COMMENT ON COLUMN content.slug IS 'URL-safe identifier matching the MDX file slug';
COMMENT ON COLUMN content.content_type IS 'Type of content: ARTICLE, PAGE, or DIRECTORY_ENTRY';
COMMENT ON COLUMN content.created_at IS 'Timestamp when content was first registered';
COMMENT ON COLUMN content.updated_at IS 'Timestamp of last update';
