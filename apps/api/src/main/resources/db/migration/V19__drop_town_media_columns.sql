-- Drop the settlement media columns (spec 034-media-map-redesign, FR-023).
--
-- towns.hero_image and towns.gallery held file paths that no page renders, for files that were
-- never added. A settlement's photographs are gallery records on its entries or near it.

ALTER TABLE towns
    DROP COLUMN hero_image,
    DROP COLUMN gallery;
