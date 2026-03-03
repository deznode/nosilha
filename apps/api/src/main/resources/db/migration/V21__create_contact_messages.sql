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

    -- Constraints
    CONSTRAINT chk_subject_category CHECK (
        subject_category IN ('GENERAL_INQUIRY', 'CONTENT_SUGGESTION', 'TECHNICAL_ISSUE', 'PARTNERSHIP')
    ),
    CONSTRAINT chk_status CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED')),
    CONSTRAINT chk_message_length CHECK (char_length(message) BETWEEN 10 AND 5000),
    CONSTRAINT chk_name_length CHECK (char_length(name) BETWEEN 2 AND 100)
);

-- Indexes
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_ip_address ON contact_messages(ip_address, created_at);

-- Table comment
COMMENT ON TABLE contact_messages IS 'Visitor contact form submissions, retained for 1 year';
