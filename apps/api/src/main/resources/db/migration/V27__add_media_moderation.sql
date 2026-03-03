-- ============================================================================
-- V27: Add media moderation enhancements
-- ============================================================================
-- Adds severity column for queue priority (0=normal, 1=low, 2=medium, 3=high)
-- Creates media_moderation_audit table for audit trail of all moderation actions
-- Note: FLAGGED enum value was added in V26 (must be in separate transaction)
-- ============================================================================

-- Add severity column for queue priority (0=normal, 1=low, 2=medium, 3=high)
ALTER TABLE media ADD COLUMN IF NOT EXISTS severity INT DEFAULT 0;

-- Create audit trail table for moderation actions
CREATE TABLE media_moderation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  reason VARCHAR(1024),
  performed_by UUID NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_media_severity ON media(severity);
CREATE INDEX idx_media_moderation_audit_media_id ON media_moderation_audit(media_id);
CREATE INDEX idx_media_flagged ON media(status) WHERE status = 'FLAGGED';

-- Comments
COMMENT ON COLUMN media.severity IS 'Queue priority: 0=normal, 1=low, 2=medium, 3=high';
COMMENT ON TABLE media_moderation_audit IS 'Audit trail for all media moderation actions';
COMMENT ON COLUMN media_moderation_audit.action IS 'Moderation action: APPROVE, FLAG, REJECT';
COMMENT ON COLUMN media_moderation_audit.previous_status IS 'Media status before action';
COMMENT ON COLUMN media_moderation_audit.new_status IS 'Media status after action';
COMMENT ON COLUMN media_moderation_audit.reason IS 'Admin-provided reason for action';
COMMENT ON COLUMN media_moderation_audit.performed_by IS 'UUID of admin who performed action';
