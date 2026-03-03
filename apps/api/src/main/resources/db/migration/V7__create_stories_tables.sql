-- V7: Stories Tables (story_submissions, mdx_archives)
-- Community narratives with moderation workflow and MDX archiving.

-- ============================================================
-- Story Submissions: Community stories with moderation workflow
-- ============================================================
CREATE TABLE story_submissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    story_type          VARCHAR(20) NOT NULL,
    template_type       VARCHAR(20),
    author_id           UUID NOT NULL REFERENCES users(id),
    related_place_id    UUID REFERENCES directory_entries(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_featured         BOOLEAN NOT NULL DEFAULT false,
    publication_slug    VARCHAR(255) UNIQUE,
    ip_address          VARCHAR(45),

    admin_notes         TEXT,
    reviewed_by         UUID REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,

    archived_at         TIMESTAMPTZ,
    archived_slug       VARCHAR(255),
    archived_by         UUID REFERENCES users(id),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),

    CONSTRAINT chk_story_type CHECK (story_type IN ('QUICK', 'FULL', 'GUIDED')),
    CONSTRAINT chk_template_type CHECK (template_type IS NULL OR template_type IN ('FAMILY', 'CHILDHOOD', 'DIASPORA', 'TRADITIONS', 'FOOD')),
    CONSTRAINT chk_story_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PUBLISHED')),
    CONSTRAINT chk_story_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_story_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),
    CONSTRAINT chk_guided_requires_template CHECK (
        (story_type != 'GUIDED') OR (template_type IS NOT NULL)
    )
);

CREATE INDEX idx_story_submissions_status ON story_submissions(status);
CREATE INDEX idx_story_submissions_author ON story_submissions(author_id);
CREATE INDEX idx_story_submissions_created ON story_submissions(created_at DESC);
CREATE INDEX idx_story_submissions_featured ON story_submissions(is_featured, status);
CREATE INDEX idx_story_submissions_ip ON story_submissions(ip_address, created_at);
CREATE INDEX idx_story_submissions_archived_at ON story_submissions(archived_at);

COMMENT ON COLUMN story_submissions.story_type IS 'QUICK, FULL, or GUIDED';
COMMENT ON COLUMN story_submissions.template_type IS 'For GUIDED stories: FAMILY, CHILDHOOD, DIASPORA, TRADITIONS, FOOD';

-- ============================================================
-- MDX Archives: Metadata for stories archived in MDX format
-- ============================================================
CREATE TABLE mdx_archives (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id        UUID NOT NULL REFERENCES story_submissions(id) ON DELETE CASCADE,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    mdx_path        VARCHAR(500) NOT NULL,
    frontmatter     JSONB NOT NULL,
    schema_valid    BOOLEAN DEFAULT false,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mdx_archives_story_id ON mdx_archives(story_id);
CREATE INDEX idx_mdx_archives_slug ON mdx_archives(slug);
CREATE INDEX idx_mdx_archives_created_at ON mdx_archives(created_at DESC);

COMMENT ON COLUMN mdx_archives.mdx_path IS 'Filesystem path: content/stories/{slug}.mdx';
COMMENT ON COLUMN mdx_archives.schema_valid IS 'Tracks Velite schema compliance';
