-- MDX Archives Table
-- Stores metadata for archived stories in MDX format
-- Content is stored in filesystem at content/stories/{slug}.mdx
CREATE TABLE mdx_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES story_submissions(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    mdx_path VARCHAR(500) NOT NULL,        -- Filesystem path: content/stories/{slug}.mdx
    frontmatter JSONB NOT NULL,            -- Parsed frontmatter for querying
    schema_valid BOOLEAN DEFAULT false,    -- Tracks Velite schema compliance
    committed_by VARCHAR(255),             -- Admin who committed the MDX
    committed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_mdx_archives_story_id ON mdx_archives(story_id);
CREATE INDEX idx_mdx_archives_slug ON mdx_archives(slug);
CREATE INDEX idx_mdx_archives_committed_at ON mdx_archives(committed_at DESC);
