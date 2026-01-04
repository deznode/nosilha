-- V30__add_media_moderation_fk.sql
-- Add missing foreign key constraint for audit trail integrity
-- Fixes: Code review issue - media_moderation_audit.performed_by lacks FK constraint

-- For audit immutability, we use SET NULL on delete to preserve audit records
-- while handling user deletion gracefully
ALTER TABLE media_moderation_audit
    ALTER COLUMN performed_by DROP NOT NULL;

ALTER TABLE media_moderation_audit
    ADD CONSTRAINT fk_media_moderation_audit_performed_by
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for query performance on audit lookups
CREATE INDEX IF NOT EXISTS idx_media_moderation_audit_performed_by
    ON media_moderation_audit(performed_by);

COMMENT ON COLUMN media_moderation_audit.performed_by IS
    'References users.id. SET NULL on user deletion to preserve audit trail.';
