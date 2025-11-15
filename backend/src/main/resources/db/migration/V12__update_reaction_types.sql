-- Migration to update reaction types from LOVE/HELPFUL/INTERESTING/THANKYOU to HEART/PARTY/LIGHTBULB/CLAP
-- This aligns the backend enum values with the frontend wireframe specifications

-- Step 1: Drop the existing check constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS chk_reaction_type;

-- Step 2: Update existing data to new enum values
-- LOVE → HEART (maintain emotional connection meaning)
UPDATE reactions SET reaction_type = 'HEART' WHERE reaction_type = 'LOVE';

-- HELPFUL → PARTY (shift from utility to celebration)
UPDATE reactions SET reaction_type = 'PARTY' WHERE reaction_type = 'HELPFUL';

-- INTERESTING → LIGHTBULB (maintain discovery/learning meaning)
UPDATE reactions SET reaction_type = 'LIGHTBULB' WHERE reaction_type = 'INTERESTING';

-- THANKYOU → CLAP (maintain appreciation meaning)
UPDATE reactions SET reaction_type = 'CLAP' WHERE reaction_type = 'THANKYOU';

-- Step 3: Add new check constraint with updated enum values
ALTER TABLE reactions
  ADD CONSTRAINT chk_reaction_type
  CHECK (reaction_type IN ('HEART', 'PARTY', 'LIGHTBULB', 'CLAP'));

-- Step 4: Update documentation comments
COMMENT ON COLUMN reactions.reaction_type IS 'Type of emotional response: HEART (❤️), PARTY (🎉), LIGHTBULB (💡), CLAP (👏)';

-- Migration validation
-- Verify no orphaned reaction types remain
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM reactions
  WHERE reaction_type NOT IN ('HEART', 'PARTY', 'LIGHTBULB', 'CLAP');

  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % reactions have invalid reaction_type values', invalid_count;
  END IF;

  RAISE NOTICE 'Migration successful: All reaction types updated to new enum values';
END $$;
