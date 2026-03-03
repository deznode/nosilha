-- V31__split_landmark_to_heritage_nature.sql
-- Split Landmark category into Heritage and Nature for better cultural heritage typology
--
-- Heritage: Historical/cultural sites (churches, monuments, colonial buildings, cultural centers)
-- Nature: Natural features (viewpoints, volcanic features, trails, natural pools)
--
-- Initial migration: All existing Landmark entries become Heritage
-- Nature entries will be created manually or recategorized by admin

-- Update the discriminator column for existing Landmark entries
UPDATE directory_entries
SET category = 'Heritage'
WHERE category = 'Landmark';

-- Add a comment explaining the category values for audit purposes
COMMENT ON COLUMN directory_entries.category IS
'Entry category: Restaurant, Hotel, Beach, Heritage (historical/cultural sites), Nature (natural features). Formerly included Landmark (split into Heritage/Nature).';
