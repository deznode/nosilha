-- Reactions table for user emotional responses to cultural heritage content
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_reaction_type CHECK (reaction_type IN ('LOVE', 'HELPFUL', 'INTERESTING', 'THANKYOU')),
  CONSTRAINT uq_user_content UNIQUE (user_id, content_id)
);

-- Indexes for performance
CREATE INDEX idx_reactions_content ON reactions(content_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_created ON reactions(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE reactions IS 'User emotional responses to cultural heritage content';
COMMENT ON COLUMN reactions.user_id IS 'Reference to authenticated user (foreign key added when users table exists)';
COMMENT ON COLUMN reactions.content_id IS 'Reference to heritage page/content UUID';
COMMENT ON COLUMN reactions.reaction_type IS 'Type of emotional response: LOVE, HELPFUL, INTERESTING, THANKYOU';

-- TODO: Add foreign key constraint when users table is created
-- ALTER TABLE reactions ADD CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
