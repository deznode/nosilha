-- Gallery media role, dimensions and provenance (spec 034-media-map-redesign).
--
-- role (FR-023): an entry's hero image becomes a gallery row with role HERO (copied in
--   V17). At most one hero per entry, and a hero always belongs to an entry.
-- width, height (FR-019): stored so a masonry tile reserves its shape before the image
--   loads. Filled by upload and by an admin backfill.
-- identifiable_person (FR-022): shows an identifiable person without confirmed
--   provenance; such records are kept out of the home row and every hero slot.
--
-- Untitling rows whose title equals their original filename is not done here: the
-- entity's title is still non-null, so it moves to T-14 with nullable titles.

CREATE TYPE gallery_media_role AS ENUM ('ARCHIVE', 'HERO');

ALTER TABLE gallery_media
    ADD COLUMN role                gallery_media_role NOT NULL DEFAULT 'ARCHIVE',
    ADD COLUMN width               INTEGER,
    ADD COLUMN height              INTEGER,
    ADD COLUMN identifiable_person BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE gallery_media
    ADD CONSTRAINT ck_gallery_media_hero_has_entry CHECK (role <> 'HERO' OR entry_id IS NOT NULL);

CREATE UNIQUE INDEX uq_gallery_media_hero_per_entry
    ON gallery_media (entry_id)
    WHERE role = 'HERO';

-- entry_id is ON DELETE SET NULL. Deleting an entry nulls its hero's entry_id, which
-- the check above would reject, so the entry could never be deleted. Demote the hero to
-- an archive record instead: the photograph stays in the archive and no longer heads a
-- record. Hibernate lists every column in its UPDATE, so this fires on most saves of a
-- gallery row; it changes nothing unless a hero's entry_id is null.
CREATE FUNCTION gallery_media_demote_orphaned_hero() RETURNS trigger AS $$
BEGIN
    IF NEW.role = 'HERO' AND NEW.entry_id IS NULL THEN
        NEW.role := 'ARCHIVE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gallery_media_demote_orphaned_hero
    BEFORE UPDATE OF entry_id ON gallery_media
    FOR EACH ROW
    EXECUTE FUNCTION gallery_media_demote_orphaned_hero();
