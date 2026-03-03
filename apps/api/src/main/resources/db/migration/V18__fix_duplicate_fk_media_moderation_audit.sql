-- V18: Fix duplicate FK constraints on media_moderation_audit.created_by
--
-- V5 created an inline FK (ON DELETE SET NULL) auto-named 'media_moderation_audit_performed_by_fkey'
-- V16 renamed the column but PostgreSQL preserved the old constraint
-- V17 added a second FK without ON DELETE SET NULL (defaults to NO ACTION)
-- This consolidates to a single FK with correct ON DELETE behavior

ALTER TABLE media_moderation_audit
    DROP CONSTRAINT IF EXISTS media_moderation_audit_performed_by_fkey;

ALTER TABLE media_moderation_audit
    DROP CONSTRAINT IF EXISTS fk_media_moderation_audit_created_by;

ALTER TABLE media_moderation_audit
    ADD CONSTRAINT fk_media_moderation_audit_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
