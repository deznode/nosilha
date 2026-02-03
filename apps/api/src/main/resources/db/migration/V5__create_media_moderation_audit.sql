-- V5: Media Moderation Audit Table
-- Audit trail for all media moderation actions.

CREATE TABLE media_moderation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES gallery_media(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    reason VARCHAR(1024),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_moderation_audit_media_id ON media_moderation_audit(media_id);
CREATE INDEX idx_media_moderation_audit_performed_by ON media_moderation_audit(performed_by);

COMMENT ON COLUMN media_moderation_audit.action IS 'Moderation action: APPROVE, FLAG, REJECT';
COMMENT ON COLUMN media_moderation_audit.performed_by IS 'References users.id; SET NULL on deletion to preserve audit trail';
