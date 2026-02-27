-- V31: Fix V28 BravaMap POIs status from PUBLISHED to DRAFT
-- These ~57 entries were incorrectly seeded as PUBLISHED in V28.
-- They should be DRAFT until individually reviewed and approved.
-- The 8 original V9 entries (fixed UUIDs) remain PUBLISHED.

UPDATE directory_entries
SET status = 'DRAFT', updated_at = now()
WHERE status = 'PUBLISHED'
  AND submitted_by IS NULL
  AND id NOT IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888'
  );
