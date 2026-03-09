-- Seed default YouTube sync config (disabled by default)
INSERT INTO youtube_sync_config (enabled, default_category)
SELECT false, null
WHERE NOT EXISTS (SELECT 1 FROM youtube_sync_config);
