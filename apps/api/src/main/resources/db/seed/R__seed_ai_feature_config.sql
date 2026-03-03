-- Repeatable migration: AI feature domain toggles
-- Re-runs automatically when file content changes (checksum-based).
-- Uses DO NOTHING to preserve runtime enable/disable state set by admins.
-- Add new domains here — Flyway detects the checksum change and re-runs,
-- inserting only the new row(s).

INSERT INTO ai_feature_config (domain, enabled) VALUES
    ('gallery', false),
    ('stories', false),
    ('directory', false),
    ('global', true)
ON CONFLICT (domain) DO NOTHING;
