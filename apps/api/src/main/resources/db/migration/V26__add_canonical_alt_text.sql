-- V26: Add canonical alt_text column to gallery_media
-- Supports WCAG 1.1.1 compliance with human-editable alt text.
-- Backfills from ai_alt_text where AI processing has completed.

ALTER TABLE gallery_media ADD COLUMN alt_text VARCHAR(1024);

-- Backfill from AI-generated alt text where available
UPDATE gallery_media
SET alt_text = ai_alt_text
WHERE ai_processed_at IS NOT NULL
  AND ai_alt_text IS NOT NULL;
