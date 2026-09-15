-- Drop directory_entries.image_url (spec 034-media-map-redesign, FR-023, ADR-001).
--
-- An entry's image is its HERO row in gallery_media: V18 copied every image across, and every
-- reader resolves heroes through the gallery module. An entry write carrying an image URL
-- publishes EntryImageSubmittedEvent instead of storing it here.

ALTER TABLE directory_entries
    DROP COLUMN image_url;
