-- Add full-text search capability to directory_entries table
-- Adds tsvector column with GIN index for fast searching
-- Auto-updates search vector on INSERT/UPDATE via trigger

-- Add search vector column
ALTER TABLE directory_entries
ADD COLUMN search_vector tsvector;

-- Create GIN index for fast searching
CREATE INDEX idx_directory_entries_search
ON directory_entries USING GIN(search_vector);

-- Create trigger function to auto-update search vector
CREATE OR REPLACE FUNCTION update_directory_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
CREATE TRIGGER directory_search_vector_update
BEFORE INSERT OR UPDATE OF name, description ON directory_entries
FOR EACH ROW EXECUTE FUNCTION update_directory_search_vector();

-- Populate existing data
UPDATE directory_entries SET search_vector =
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Comments for documentation
COMMENT ON COLUMN directory_entries.search_vector IS 'Full-text search vector combining name (weight A) and description (weight B)';
COMMENT ON INDEX idx_directory_entries_search IS 'GIN index for fast full-text search on directory entries';
