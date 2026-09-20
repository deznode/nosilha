-- Copy entry images into gallery heroes (spec 034-media-map-redesign, FR-023, ADR-001).
--
-- An entry's image moves from directory_entries.image_url to a gallery_media row with role
-- HERO; V20 drops the column in the same release. A one-time data fix, not DDL.
--
-- 1. An entry whose image is one of its own uploads (an earlier promote-hero wrote the upload's
--    URL into image_url) has that upload made its hero, keeping the upload's credit.
-- 2. Any other entry with an image gains a hero row serving that URL: active, never listed in
--    the gallery, no credit recorded. R__seed_gallery_heroes adds the credits the archive knows.
--
-- Entries that already have a hero keep it.

WITH own_uploads AS (
    SELECT DISTINCT ON (d.id) g.id AS media_id
    FROM directory_entries d
    JOIN gallery_media g
      ON g.entry_id = d.id
     AND g.media_source = 'USER_UPLOAD'
     AND g.status IN ('ACTIVE', 'PENDING_REVIEW')
     AND g.public_url = TRIM(d.image_url)
    WHERE NULLIF(TRIM(d.image_url), '') IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM gallery_media h WHERE h.entry_id = d.id AND h.role = 'HERO')
    ORDER BY d.id, g.created_at
)
UPDATE gallery_media
SET role = 'HERO'
WHERE id IN (SELECT media_id FROM own_uploads);

INSERT INTO gallery_media (media_source, status, role, show_in_gallery, entry_id, public_url)
SELECT 'USER_UPLOAD', 'ACTIVE'::gallery_media_status, 'HERO'::gallery_media_role, FALSE, d.id, TRIM(d.image_url)
FROM directory_entries d
WHERE NULLIF(TRIM(d.image_url), '') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM gallery_media h WHERE h.entry_id = d.id AND h.role = 'HERO');
