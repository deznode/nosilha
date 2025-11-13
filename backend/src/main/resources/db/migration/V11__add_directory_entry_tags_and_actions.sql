-- Add manual tag metadata and content action overrides to directory entries
ALTER TABLE directory_entries
    ADD COLUMN tags TEXT,
    ADD COLUMN content_actions JSONB;

COMMENT ON COLUMN directory_entries.tags IS 'Comma-separated list of manually curated tags used for related-content matching';
COMMENT ON COLUMN directory_entries.content_actions IS 'JSON configuration overriding default ContentActionToolbar behavior';
