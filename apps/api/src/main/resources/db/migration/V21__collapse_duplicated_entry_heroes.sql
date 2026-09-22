-- Collapse the entry heroes V18 duplicated (spec 034-media-map-redesign, FR-023, ADR-001).
--
-- V18 sits in db/seed rather than here, though it is a versioned migration and not a
-- repeatable seed; both locations are on the Flyway path, so it still runs in order.
--
-- V18 promotes an entry's own upload to HERO only when the upload already carries the
-- entry_id:
--
--     JOIN gallery_media g ON g.entry_id = d.id AND g.public_url = TRIM(d.image_url)
--
-- On production no upload carried one — an earlier promote-hero wrote the upload's URL
-- into directory_entries.image_url without ever linking the row — so that UPDATE matched
-- nothing and V18's INSERT ran instead. The result is two rows for one photograph: the
-- original upload, still role ARCHIVE and listed, and a bare HERO copy holding nothing but
-- a URL. The copy is what an entry now shows, so a hero renders without the title,
-- coordinates, date or credit the archive already knows.
--
-- This finishes what V18 meant to do: drop each bare copy and promote the upload it was
-- copied from, keeping that row's metadata. A photograph is ARCHIVE or HERO, never both
-- (V16: "the photograph stays in the archive and no longer heads a record"), so a promoted
-- upload leaves the archive listing and the facet counts fall by the number of pairs
-- collapsed. That is the intended state: those photographs were only ever counted because
-- V18 failed to promote them.
--
-- Entries whose hero was never a duplicate — a curated path with no upload behind it, such
-- as the Igreja — have no pair here and are left untouched.

-- Pair each hero with the archive upload it copied. DISTINCT ON keeps one archive row per
-- hero, oldest first, matching how V18 chose among an entry's uploads.
CREATE TEMP TABLE hero_duplicates ON COMMIT DROP AS
SELECT DISTINCT ON (h.id)
       h.id       AS hero_id,
       h.entry_id AS entry_id,
       a.id       AS archive_id
FROM gallery_media h
JOIN gallery_media a
  ON  a.id <> h.id
  AND a.public_url = h.public_url
  AND a.role = 'ARCHIVE'
  AND a.media_source = 'USER_UPLOAD'
  AND a.status IN ('ACTIVE', 'PENDING_REVIEW')
WHERE h.role = 'HERO'
  AND h.entry_id IS NOT NULL
  AND NULLIF(TRIM(h.public_url), '') IS NOT NULL
ORDER BY h.id, a.created_at;

-- One upload standing behind two entries' heroes cannot be promoted to both: a partial
-- unique index allows one hero per entry, and the row can only carry one entry_id. Leave
-- those pairs alone rather than guess which entry keeps the photograph.
DELETE FROM hero_duplicates
WHERE archive_id IN (
    SELECT archive_id FROM hero_duplicates GROUP BY archive_id HAVING COUNT(*) > 1
);

-- Order matters: the copy has to go before the upload takes its place, or promoting the
-- upload would be a second hero for the entry and trip uq_gallery_media_hero_per_entry.
DELETE FROM gallery_media
WHERE id IN (SELECT hero_id FROM hero_duplicates);

-- Promoting sets entry_id, so trg_gallery_media_demote_orphaned_hero fires; it demotes
-- only when the new entry_id is null, which it never is here.
UPDATE gallery_media g
SET role            = 'HERO',
    entry_id        = d.entry_id,
    show_in_gallery = FALSE
FROM hero_duplicates d
WHERE g.id = d.archive_id;
