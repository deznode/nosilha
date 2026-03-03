-- V6: Feedback Tables (suggestions, contact_messages)
-- Community feedback channels.

-- ============================================================
-- Suggestions: Community contributions to content improvement
-- ============================================================
CREATE TABLE suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    suggestion_type VARCHAR(20) NOT NULL,
    message         TEXT NOT NULL,
    ip_address      VARCHAR(45),
    page_url        TEXT,
    page_title      TEXT,
    content_type    VARCHAR(100),
    media_id        UUID,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_notes     TEXT,
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),

    CONSTRAINT chk_suggestion_type CHECK (suggestion_type IN ('CORRECTION', 'ADDITION', 'FEEDBACK', 'PHOTO_IDENTIFICATION')),
    CONSTRAINT chk_message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 5000),
    CONSTRAINT chk_suggestion_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_suggestions_created ON suggestions(created_at DESC);
CREATE INDEX idx_suggestions_content ON suggestions(content_id);
CREATE INDEX idx_suggestions_ip ON suggestions(ip_address, created_at);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_status_created ON suggestions(status, created_at DESC);
CREATE INDEX idx_suggestions_media_id ON suggestions(media_id);

-- ============================================================
-- Contact Messages: Visitor contact form submissions
-- ============================================================
CREATE TABLE contact_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    subject_category    VARCHAR(50) NOT NULL,
    message             TEXT NOT NULL,
    ip_address          VARCHAR(45) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),

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
