-- Suggestions table for community contributions to content improvement
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  suggestion_type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_suggestion_type CHECK (suggestion_type IN ('CORRECTION', 'ADDITION', 'FEEDBACK')),
  CONSTRAINT chk_message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 5000)
);

-- Indexes for performance and rate limiting
CREATE INDEX idx_suggestions_created ON suggestions(created_at DESC);
CREATE INDEX idx_suggestions_content ON suggestions(content_id);
CREATE INDEX idx_suggestions_ip ON suggestions(ip_address, created_at);

-- Comments for documentation
COMMENT ON TABLE suggestions IS 'Community contributions for content improvement (corrections, additions, feedback)';
COMMENT ON COLUMN suggestions.content_id IS 'Reference to heritage page/content UUID';
COMMENT ON COLUMN suggestions.ip_address IS 'IPv4 or IPv6 address for rate limiting (nullable for privacy)';
COMMENT ON COLUMN suggestions.suggestion_type IS 'Type of suggestion: CORRECTION, ADDITION, FEEDBACK';
