-- Add featured flag and duration to gallery_media for video section redesign
ALTER TABLE gallery_media
    ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN duration_seconds INTEGER;

-- Partial index for quick featured video lookup (at most one row expected)
CREATE INDEX idx_gallery_media_featured
    ON gallery_media (featured)
    WHERE featured = TRUE AND status = 'ACTIVE';
