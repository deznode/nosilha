-- V23: Curated title and settlement for films (spec 038 media immersion).
--
-- Both columns are nullable and carry no backfill: existing rows read as they do
-- today. `title` keeps the host's own title; YouTubeSyncService never updates an
-- existing row, so curated values survive a re-sync.
--
-- place_id is a plain FK to towns with no JPA association, following the
-- entry_id precedent, so the gallery module never imports places.

ALTER TABLE gallery_media
    ADD COLUMN display_title VARCHAR(255),
    ADD COLUMN place_id UUID REFERENCES towns(id) ON DELETE SET NULL;

CREATE INDEX idx_gallery_media_place_id ON gallery_media(place_id);

COMMENT ON COLUMN gallery_media.display_title IS
    'Curated title shown in the archive. The host''s own title stays in title (spec 038).';
COMMENT ON COLUMN gallery_media.place_id IS
    'Settlement a film was made near. Films only; photographs derive theirs from coordinates (spec 038).';
