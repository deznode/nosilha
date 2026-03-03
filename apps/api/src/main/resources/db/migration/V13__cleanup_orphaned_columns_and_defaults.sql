-- V13: Cleanup orphaned columns, add missing defaults, fix nullability
-- gallery_media has orphaned created_by, updated_by, submitted_by columns
-- that were added by a previous migration but are unused by the current entity model.
-- V14 will re-add created_by/updated_by as UUID audit columns.

-- Drop orphaned gallery_media columns
ALTER TABLE gallery_media DROP COLUMN IF EXISTS created_by;
ALTER TABLE gallery_media DROP COLUMN IF EXISTS updated_by;
ALTER TABLE gallery_media DROP COLUMN IF EXISTS submitted_by;

-- Add missing defaults
ALTER TABLE user_profiles ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_profiles ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookmarks ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- Fix nullable users.created_at
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
