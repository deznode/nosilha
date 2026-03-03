-- Create directory_submissions table for community-submitted directory entries
-- Follows the same pattern as story_submissions for moderation workflow

CREATE TABLE IF NOT EXISTS directory_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('RESTAURANT', 'LANDMARK', 'NATURE', 'CULTURE')),
    town VARCHAR(100) NOT NULL,
    custom_town VARCHAR(100),
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    price_level VARCHAR(5),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_by VARCHAR(255) NOT NULL,
    submitted_by_email VARCHAR(255),
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tags collection table for directory submissions
CREATE TABLE IF NOT EXISTS directory_submission_tags (
    submission_id UUID NOT NULL REFERENCES directory_submissions(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (submission_id, tag)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_directory_submissions_status ON directory_submissions(status);
CREATE INDEX IF NOT EXISTS idx_directory_submissions_category ON directory_submissions(category);
CREATE INDEX IF NOT EXISTS idx_directory_submissions_created ON directory_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_directory_submissions_ip ON directory_submissions(ip_address, created_at);

-- Add comments for documentation
COMMENT ON TABLE directory_submissions IS 'Community-submitted directory entries pending moderation';
COMMENT ON COLUMN directory_submissions.category IS 'Type of directory entry: RESTAURANT, LANDMARK, NATURE, or CULTURE';
COMMENT ON COLUMN directory_submissions.status IS 'Moderation status: PENDING (awaiting review), APPROVED (accepted), REJECTED (declined)';
COMMENT ON COLUMN directory_submissions.ip_address IS 'Submitter IP address for rate limiting (IPv4 or IPv6)';
COMMENT ON COLUMN directory_submissions.admin_notes IS 'Optional notes from admin explaining approval or rejection';
