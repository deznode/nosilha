-- Migration to update reaction types to LinkedIn-style semantic naming
-- Changes: HEART→LOVE, PARTY→CELEBRATE, LIGHTBULB→INSIGHTFUL, CLAP→SUPPORT
-- Reference: docs/API_CODING_STANDARDS.md (Section 4: Data Migration & Schema Evolution)

-- Step 1: Drop the existing check constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS chk_reaction_type;

-- Step 2: Update existing data to new semantic enum values
-- HEART → LOVE (maintain emotional connection meaning)
UPDATE reactions SET reaction_type = 'LOVE' WHERE reaction_type = 'HEART';

-- PARTY → CELEBRATE (maintain celebration meaning with semantic clarity)
UPDATE reactions SET reaction_type = 'CELEBRATE' WHERE reaction_type = 'PARTY';

-- LIGHTBULB → INSIGHTFUL (maintain discovery/learning meaning with semantic clarity)
UPDATE reactions SET reaction_type = 'INSIGHTFUL' WHERE reaction_type = 'LIGHTBULB';

-- CLAP → SUPPORT (maintain appreciation meaning with semantic clarity)
UPDATE reactions SET reaction_type = 'SUPPORT' WHERE reaction_type = 'CLAP';

-- Step 3: Add new check constraint with updated semantic enum values
ALTER TABLE reactions
  ADD CONSTRAINT chk_reaction_type
  CHECK (reaction_type IN ('LOVE', 'CELEBRATE', 'INSIGHTFUL', 'SUPPORT'));

-- Step 4: Update documentation comments
COMMENT ON COLUMN reactions.reaction_type IS 'Type of emotional response: LOVE (❤️), CELEBRATE (🎉), INSIGHTFUL (💡), SUPPORT (👏)';

-- Migration validation
-- Verify no orphaned reaction types remain
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM reactions
  WHERE reaction_type NOT IN ('LOVE', 'CELEBRATE', 'INSIGHTFUL', 'SUPPORT');

  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % reactions have invalid reaction_type values', invalid_count;
  END IF;

  RAISE NOTICE 'Migration successful: All reaction types updated to LinkedIn-style semantic values';
END $$;
