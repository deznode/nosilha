-- V5: Engagement Tables (user_profiles, reactions, bookmarks, content)
-- User interaction tables for the engagement module.

-- ============================================================
-- User Profiles: Platform preferences linked to Supabase user ID
-- ============================================================
CREATE TABLE user_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id),
    display_name            VARCHAR(100),
    location                VARCHAR(255),
    preferred_language      VARCHAR(3) NOT NULL DEFAULT 'EN',
    notification_preferences JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID REFERENCES users(id),
    updated_by              UUID REFERENCES users(id),

    CONSTRAINT chk_preferred_language CHECK (preferred_language IN ('EN', 'PT', 'KEA')),
    CONSTRAINT chk_display_name_length CHECK (
        display_name IS NULL OR (LENGTH(display_name) >= 2 AND LENGTH(display_name) <= 100)
    )
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

COMMENT ON COLUMN user_profiles.preferred_language IS 'EN=English, PT=Portuguese, KEA=Kriolu';

-- ============================================================
-- Reactions: User emotional responses to content
-- ============================================================
CREATE TABLE reactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    content_id      UUID NOT NULL,
    reaction_type   VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),

    CONSTRAINT chk_reaction_type CHECK (reaction_type IN ('LOVE', 'CELEBRATE', 'INSIGHTFUL', 'SUPPORT')),
    CONSTRAINT uq_user_content UNIQUE (user_id, content_id)
);

CREATE INDEX idx_reactions_content ON reactions(content_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_created ON reactions(created_at DESC);

-- ============================================================
-- Bookmarks: User-saved directory entries
-- ============================================================
CREATE TABLE bookmarks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    entry_id    UUID NOT NULL REFERENCES directory_entries(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),

    CONSTRAINT uq_bookmark_user_entry UNIQUE (user_id, entry_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_entry_id ON bookmarks(entry_id);

-- ============================================================
-- Content: Registration for reaction tracking in MDX platform
-- ============================================================
CREATE TABLE content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) NOT NULL,
    content_type    VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),

    CONSTRAINT uq_content_slug_type UNIQUE (slug, content_type),
    CONSTRAINT chk_content_type CHECK (content_type IN ('ARTICLE', 'PAGE', 'DIRECTORY_ENTRY'))
);

CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_type ON content(content_type);
