-- Make `towns` the canonical settlement model (spec 033-archive-redesign, FR-001).
--
-- Settlements were modelled in three places: the `towns` table, `directory_entries`
-- rows with category='Town' (plus the TownPoi entity), and `directory_entries.town`
-- as free text. This migration establishes the foreign key and removes the second.
--
-- IMPORTANT: this file deliberately contains no backfill. Flyway runs every
-- versioned migration before every repeatable one, so on a fresh database `towns`
-- is still empty at this point. The backfill lives in
-- db/seed/R__towns_fk_backfill.sql, whose description sorts after every seed file.

-- unaccent() is required by the backfill: seed data carries 'Cachaço' and 'Garça'
-- while the corresponding town slugs are 'cachaco' and 'garca'.
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE directory_entries
    ADD COLUMN town_id UUID REFERENCES towns(id);

CREATE INDEX idx_directory_entries_town_id ON directory_entries(town_id);

COMMENT ON COLUMN directory_entries.town_id IS
    'Canonical settlement reference. The legacy `town` VARCHAR is retained until the backfill is verified empty in every environment; see R__towns_fk_backfill.sql.';

-- Reporting table for unmatched town values. FR-001 requires unmatched values be
-- reported rather than silently dropped; a queryable table is inspectable and
-- testable, unlike a log warning.
CREATE TABLE town_backfill_exceptions (
    entry_id   UUID PRIMARY KEY REFERENCES directory_entries(id) ON DELETE CASCADE,
    town_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE town_backfill_exceptions IS
    'Directory entries whose free-text town matched no towns row. Must be empty before town_id can be made NOT NULL and the legacy town column dropped.';

-- Remove the 22 settlement duplicates held as directory entries.
--
-- Correct on both paths: on an existing database these rows were inserted by an
-- earlier run of R__seed_brava_map_pois.sql and are deleted here; on a fresh
-- database the seed no longer contains them, so this is a no-op. All three foreign
-- keys referencing directory_entries specify ON DELETE CASCADE or SET NULL, so no
-- constraint is violated.
DELETE FROM directory_entries WHERE category = 'Town';
