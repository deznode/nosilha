-- V3: Directory Entries Table
-- Single Table Inheritance for Restaurant, Hotel, Beach, Heritage, Nature.

CREATE TABLE directory_entries (
    id UUID PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2048),
    category VARCHAR(255) NOT NULL,
    town VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url VARCHAR(255),
    rating DOUBLE PRECISION,
    review_count INTEGER NOT NULL DEFAULT 0,

    phone_number VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(512),

    opening_hours VARCHAR(255),
    cuisine VARCHAR(255),
    amenities VARCHAR(255),

    tags TEXT,
    content_actions JSONB,

    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    submitted_by VARCHAR(255),
    submitted_by_email VARCHAR(255),
    ip_address VARCHAR(45),
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    price_level VARCHAR(5),
    custom_town VARCHAR(100),

    search_vector tsvector,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_directory_entries_status
        CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_directory_entries_slug ON directory_entries(slug);
CREATE INDEX idx_directory_entries_category ON directory_entries(category);
CREATE INDEX idx_directory_entries_created_at ON directory_entries(created_at);
CREATE INDEX idx_directory_entries_updated_at ON directory_entries(updated_at);
CREATE INDEX idx_directory_entries_status ON directory_entries(status);
CREATE INDEX idx_directory_entries_status_created ON directory_entries(status, created_at DESC);
CREATE INDEX idx_directory_entries_search ON directory_entries USING GIN(search_vector);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION update_directory_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER directory_search_vector_update
BEFORE INSERT OR UPDATE OF name, description ON directory_entries
FOR EACH ROW EXECUTE FUNCTION update_directory_search_vector();

COMMENT ON COLUMN directory_entries.category IS 'STI discriminator: Restaurant, Hotel, Beach, Heritage, Nature';
COMMENT ON COLUMN directory_entries.tags IS 'Comma-separated list of manually curated tags';
COMMENT ON COLUMN directory_entries.content_actions IS 'JSON config overriding default ContentActionToolbar behavior';
COMMENT ON COLUMN directory_entries.status IS 'Lifecycle: DRAFT, PENDING, APPROVED, PUBLISHED, ARCHIVED';
COMMENT ON COLUMN directory_entries.search_vector IS 'Full-text search: name (weight A), description (weight B)';
