-- V1__create_directory_entries_table.sql

-- This table will store all types of directory entries (Restaurants, Hotels, etc.)
-- using a Single Table Inheritance strategy. The 'category' column will be used
-- by JPA as the discriminator column to determine the specific subclass.

CREATE TABLE directory_entries (
    -- Core Fields
    id              UUID PRIMARY KEY,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(2048),
    category        VARCHAR(255) NOT NULL,
    town            VARCHAR(255) NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    image_url       VARCHAR(255),
    rating          DOUBLE PRECISION, -- Nullable, as a null rating means "not yet rated"
    review_count    INTEGER NOT NULL DEFAULT 0,

    -- Subclass-specific Fields (will be NULL for types they don't apply to)
    phone_number    VARCHAR(255),
    opening_hours   VARCHAR(255),
    cuisine         VARCHAR(255), -- Will store a comma-delimited list
    amenities       VARCHAR(255)  -- Will store a comma-delimited list
);

-- Create an index on the slug column for faster lookups, as this will be used in URLs.
CREATE INDEX idx_directory_entries_slug ON directory_entries(slug);

-- Create an index on the category column as we will filter by it frequently.
CREATE INDEX idx_directory_entries_category ON directory_entries(category);
