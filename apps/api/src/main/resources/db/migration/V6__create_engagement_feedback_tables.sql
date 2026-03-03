-- V6: Engagement and Feedback Tables
-- Creates user_profiles, reactions, bookmarks, content, suggestions, contact_messages.

-- User Profiles: Platform preferences linked to Supabase user ID
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    location VARCHAR(255),
    preferred_language VARCHAR(3) NOT NULL DEFAULT 'EN',
    notification_preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT chk_preferred_language CHECK (preferred_language IN ('EN', 'PT', 'KEA')),
    CONSTRAINT chk_display_name_length CHECK (
        display_name IS NULL OR (LENGTH(display_name) >= 2 AND LENGTH(display_name) <= 100)
    )
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

COMMENT ON COLUMN user_profiles.preferred_language IS 'EN=English, PT=Portuguese, KEA=Kriolu';

-- Reactions: User emotional responses to content
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_reaction_type CHECK (reaction_type IN ('LOVE', 'CELEBRATE', 'INSIGHTFUL', 'SUPPORT')),
    CONSTRAINT uq_user_content UNIQUE (user_id, content_id)
);

CREATE INDEX idx_reactions_content ON reactions(content_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_created ON reactions(created_at DESC);

-- Bookmarks: User-saved directory entries
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    entry_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT uq_bookmark_user_entry UNIQUE (user_id, entry_id),
    CONSTRAINT fk_bookmarks_entry FOREIGN KEY (entry_id)
        REFERENCES directory_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_entry_id ON bookmarks(entry_id);

-- Content: Registration for reaction tracking in MDX platform
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_content_slug_type UNIQUE (slug, content_type),
    CONSTRAINT chk_content_type CHECK (content_type IN ('ARTICLE', 'PAGE', 'DIRECTORY_ENTRY'))
);

CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_type ON content(content_type);

-- Suggestions: Community contributions to content improvement
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    suggestion_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    page_url TEXT,
    page_title TEXT,
    content_type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_suggestion_type CHECK (suggestion_type IN ('CORRECTION', 'ADDITION', 'FEEDBACK')),
    CONSTRAINT chk_message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 5000),
    CONSTRAINT chk_suggestion_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_suggestions_created ON suggestions(created_at DESC);
CREATE INDEX idx_suggestions_content ON suggestions(content_id);
CREATE INDEX idx_suggestions_ip ON suggestions(ip_address, created_at);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_status_created ON suggestions(status, created_at DESC);

-- Contact Messages: Visitor contact form submissions
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject_category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_subject_category CHECK (
        subject_category IN ('GENERAL_INQUIRY', 'CONTENT_SUGGESTION', 'TECHNICAL_ISSUE', 'PARTNERSHIP')
    ),
    CONSTRAINT chk_status CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED')),
    CONSTRAINT chk_message_length CHECK (char_length(message) BETWEEN 10 AND 5000),
    CONSTRAINT chk_name_length CHECK (char_length(name) BETWEEN 2 AND 100)
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_ip_address ON contact_messages(ip_address, created_at);
