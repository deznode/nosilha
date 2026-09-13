-- Backfill directory_entries.town_id from the legacy free-text `town` column.
-- Spec 033-archive-redesign, FR-001.
--
-- WHY THIS IS A REPEATABLE MIGRATION AND NOT A VERSIONED ONE
-- ----------------------------------------------------------
-- Flyway runs every versioned (V__) migration before every repeatable (R__) one.
-- On a fresh database the `towns` table is therefore still empty while V14 runs,
-- so a backfill placed there would match nothing and silently leave every row
-- unlinked. Repeatable migrations run after all versioned ones, in alphabetical
-- order of their description -- "towns_fk_backfill" sorts after every "seed_*"
-- file, so both `towns` and `directory_entries` are fully populated by the time
-- this executes, on a fresh database and an existing one alike.
--
-- Flyway has no explicit dependency mechanism for repeatable migrations, so that
-- ordering rests on the filename. The guarantee is enforced by a test asserting
-- town_backfill_exceptions is empty after a full migrate on a clean schema -- if
-- anyone moves this logic back into a V__ file, that test fails loudly.

-- Accent- and case-insensitive match. Seed data carries 'Cachaço' and 'Garça'
-- where the towns table holds 'Cachaco' and 'Garça' under slugs 'cachaco' and
-- 'garca'; a plain equality join drops those rows. Guarded on town_id IS NULL so
-- reruns are idempotent and never overwrite a deliberate manual assignment.
UPDATE directory_entries de
SET town_id = t.id
FROM towns t
WHERE de.town_id IS NULL
  AND lower(unaccent(t.name)) = lower(unaccent(trim(de.town)));

-- Record anything still unmatched. FR-001 requires unmatched values be reported
-- rather than silently dropped.
INSERT INTO town_backfill_exceptions (entry_id, town_value)
SELECT id, town
FROM directory_entries
WHERE town_id IS NULL
ON CONFLICT (entry_id) DO NOTHING;

-- Clear entries that have since been resolved, so the table always reflects the
-- current state rather than accumulating history.
DELETE FROM town_backfill_exceptions
WHERE entry_id IN (SELECT id FROM directory_entries WHERE town_id IS NOT NULL);
