-- V3: Places Tables (towns, directory_entries)
-- Core directory module with Single Table Inheritance for directory entries.

-- ============================================================
-- Towns: Brava Island settlements
-- ============================================================
CREATE TABLE towns (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(2048) NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    population  VARCHAR(255),
    elevation   VARCHAR(255),
    founded     VARCHAR(255),
    highlights  TEXT,
    hero_image  VARCHAR(255),
    gallery     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);

CREATE INDEX idx_towns_slug ON towns(slug);
CREATE INDEX idx_towns_name ON towns(name);
CREATE INDEX idx_towns_created_at ON towns(created_at);

COMMENT ON COLUMN towns.highlights IS 'JSON array of notable features';
COMMENT ON COLUMN towns.gallery IS 'JSON array of gallery image URLs';

-- ============================================================
-- Directory Entries: STI for Restaurant, Hotel, Beach, Heritage,
-- Nature, Town, Viewpoint, Trail, Church, Port
-- ============================================================
CREATE TABLE directory_entries (
    id                  UUID PRIMARY KEY,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(2048),
    category            VARCHAR(255) NOT NULL,
    town                VARCHAR(255) NOT NULL,
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    image_url           VARCHAR(255),
    rating              DOUBLE PRECISION,
    review_count        INTEGER NOT NULL DEFAULT 0,

    phone_number        VARCHAR(255),
    email               VARCHAR(255),
    website             VARCHAR(512),

    opening_hours       VARCHAR(255),
    cuisine             VARCHAR(255),
    amenities           VARCHAR(255),

    tags                TEXT,
    content_actions     JSONB,

    status              VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    submitted_by        UUID REFERENCES users(id),
    submitted_by_email  VARCHAR(255),
    ip_address          VARCHAR(45),
    admin_notes         TEXT,
    reviewed_by         UUID REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    price_level         VARCHAR(5),
    custom_town         VARCHAR(100),

    search_vector       tsvector,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),

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

COMMENT ON COLUMN directory_entries.category IS 'STI discriminator: Restaurant, Hotel, Beach, Heritage, Nature, Town, Viewpoint, Trail, Church, Port';
COMMENT ON COLUMN directory_entries.tags IS 'Comma-separated list of manually curated tags';
COMMENT ON COLUMN directory_entries.content_actions IS 'JSON config overriding default ContentActionToolbar behavior';
COMMENT ON COLUMN directory_entries.status IS 'Lifecycle: DRAFT, PENDING, APPROVED, PUBLISHED, ARCHIVED';
COMMENT ON COLUMN directory_entries.search_vector IS 'Full-text search: name (weight A), description (weight B)';
