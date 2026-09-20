-- Heritage fields for the place record (spec 034-media-map-redesign, FR-016).
--
-- Free text, all nullable: the archive records what is known ("c. 1826", "under
-- reconstruction since 2023") and infers nothing. FieldGuard decides which categories
-- may carry them (Heritage and Church); the columns sit on the shared single-table base.
--
-- condition_status is named to stay clear of the lifecycle `status` column.

ALTER TABLE directory_entries
    ADD COLUMN established      VARCHAR(255),
    ADD COLUMN condition_status VARCHAR(255),
    ADD COLUMN festival         VARCHAR(255),
    ADD COLUMN architect        VARCHAR(255);
