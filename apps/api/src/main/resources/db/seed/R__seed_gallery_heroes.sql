-- Repeatable migration: entry heroes whose credit the archive has recorded (spec 034, FR-023).
-- Re-runs automatically when file content changes (checksum-based).
-- Sorts after R__seed_directory_entries.sql, which creates the entries these heroes head.
--
-- Idempotent on the one-hero-per-entry index. An existing hero serving the same image gains a
-- missing credit or source (V18 copies images without one); a hero serving another image, or
-- credited since, is left as it is.

INSERT INTO gallery_media (media_source, status, role, show_in_gallery, entry_id, public_url,
    photographer_credit, archive_source)
SELECT 'USER_UPLOAD', 'ACTIVE'::gallery_media_status, 'HERO'::gallery_media_role, FALSE, d.id,
    '/images/directory/heritage/igreja-nossa-senhora-do-monte.jpg',
    'Torbenbrinker',
    'Wikimedia Commons, CC BY-SA 3.0, 2010'
FROM directory_entries d
WHERE d.slug = 'igreja-nossa-senhora-do-monte'
ON CONFLICT (entry_id) WHERE role = 'HERO' DO UPDATE SET
    photographer_credit = COALESCE(gallery_media.photographer_credit, EXCLUDED.photographer_credit),
    archive_source = COALESCE(gallery_media.archive_source, EXCLUDED.archive_source)
WHERE gallery_media.public_url = EXCLUDED.public_url;
