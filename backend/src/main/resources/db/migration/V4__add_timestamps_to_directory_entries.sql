-- Add timestamp columns to the directory_entries table
-- This migration adds created_at and updated_at columns to track entity lifecycle

ALTER TABLE directory_entries 
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create an index on created_at for efficient sorting by creation date
CREATE INDEX idx_directory_entries_created_at ON directory_entries(created_at);

-- Create an index on updated_at for efficient sorting by update date
CREATE INDEX idx_directory_entries_updated_at ON directory_entries(updated_at);

-- Update existing records to have reasonable timestamps
-- Set created_at to a base date and updated_at to the same
UPDATE directory_entries 
SET created_at = CURRENT_TIMESTAMP - INTERVAL '30 days',
    updated_at = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE created_at IS NULL OR updated_at IS NULL;