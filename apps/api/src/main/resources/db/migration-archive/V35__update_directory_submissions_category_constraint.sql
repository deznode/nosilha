-- V35__update_directory_submissions_category_constraint.sql
-- Update the category CHECK constraint to match the new DirectorySubmissionCategory enum values
--
-- Old values: RESTAURANT, LANDMARK, NATURE, CULTURE
-- New values: RESTAURANT, HOTEL, BEACH, HERITAGE, NATURE
--
-- This aligns directory_submissions with:
-- - DirectorySubmissionCategory.kt enum
-- - DirectoryEntry subclasses (Restaurant, Hotel, Beach, Heritage, Nature)
-- - V31 split of Landmark into Heritage and Nature

-- Drop the existing CHECK constraint (PostgreSQL auto-named it based on column)
ALTER TABLE directory_submissions
    DROP CONSTRAINT IF EXISTS directory_submissions_category_check;

-- Add the new CHECK constraint with updated category values
ALTER TABLE directory_submissions
    ADD CONSTRAINT directory_submissions_category_check
    CHECK (category IN ('RESTAURANT', 'HOTEL', 'BEACH', 'HERITAGE', 'NATURE'));

-- Update the column comment to reflect the new categories
COMMENT ON COLUMN directory_submissions.category IS 'Type of directory entry: RESTAURANT, HOTEL, BEACH, HERITAGE, or NATURE';
