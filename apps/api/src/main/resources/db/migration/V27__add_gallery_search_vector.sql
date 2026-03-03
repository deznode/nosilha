-- V27: Add full-text search vector to gallery_media
-- Uses Portuguese text search configuration for Cape Verdean content.
-- Weighted search: title (A), description (B), location_name (C).

ALTER TABLE gallery_media
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(location_name, '')), 'C')
    ) STORED;

-- Partial GIN index: only index active, gallery-visible items
CREATE INDEX idx_gallery_media_search
    ON gallery_media USING GIN(search_vector)
    WHERE status = 'ACTIVE' AND show_in_gallery = true;
