-- Add show_in_gallery flag to control public gallery visibility.
-- Entry-linked media defaults to hidden; standalone uploads and external media default to visible.

ALTER TABLE gallery_media
    ADD COLUMN show_in_gallery BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill: entry-linked media hidden from gallery by default
UPDATE gallery_media SET show_in_gallery = FALSE WHERE entry_id IS NOT NULL;

-- Partial index for the common public gallery query
CREATE INDEX idx_gallery_media_gallery_visible
    ON gallery_media (status, show_in_gallery, display_order)
    WHERE show_in_gallery = TRUE;
