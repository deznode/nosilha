-- Partial index for efficient duplicate detection during YouTube channel sync.
-- Only indexes ExternalMedia rows (which have non-null external_id),
-- skipping UserUploadedMedia rows entirely.
CREATE INDEX IF NOT EXISTS idx_gallery_media_platform_external_id
ON gallery_media (platform, external_id)
WHERE external_id IS NOT NULL;
