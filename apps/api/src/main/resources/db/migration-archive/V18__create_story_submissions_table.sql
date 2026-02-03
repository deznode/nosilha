CREATE TABLE story_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    story_type VARCHAR(20) NOT NULL,
    template_type VARCHAR(20),
    author_id VARCHAR(255) NOT NULL,
    related_place_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    publication_slug VARCHAR(255) UNIQUE,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_story_type CHECK (story_type IN ('QUICK', 'FULL', 'GUIDED')),
    CONSTRAINT chk_template_type CHECK (template_type IS NULL OR template_type IN ('FAMILY', 'CHILDHOOD', 'DIASPORA', 'TRADITIONS', 'FOOD')),
    CONSTRAINT chk_story_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PUBLISHED')),
    CONSTRAINT chk_story_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT chk_story_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),
    CONSTRAINT chk_guided_requires_template CHECK (
        (story_type != 'GUIDED') OR (template_type IS NOT NULL)
    ),
    CONSTRAINT fk_story_related_place FOREIGN KEY (related_place_id)
        REFERENCES directory_entries(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_story_submissions_status ON story_submissions(status);
CREATE INDEX idx_story_submissions_author ON story_submissions(author_id);
CREATE INDEX idx_story_submissions_created ON story_submissions(created_at DESC);
CREATE INDEX idx_story_submissions_featured ON story_submissions(is_featured, status);
CREATE INDEX idx_story_submissions_ip ON story_submissions(ip_address, created_at);
