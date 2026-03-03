-- V5__create_towns_table.sql

-- This migration creates the towns table for storing geographic/administrative
-- information about towns and villages on Brava Island. Towns are separate
-- from directory entries as they represent geographic containers rather than
-- individual businesses or attractions.

CREATE TABLE towns (
    -- Core identification fields
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(2048) NOT NULL,
    
    -- Geographic coordinates
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    
    -- Town-specific administrative and geographic fields
    population      VARCHAR(255),
    elevation       VARCHAR(255),
    founded         VARCHAR(255),
    
    -- JSON arrays stored as TEXT
    highlights      TEXT, -- JSON array of highlights/notable features
    hero_image      VARCHAR(255), -- Primary hero image URL
    gallery         TEXT, -- JSON array of gallery image URLs
    
    -- Timestamp fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient lookups
CREATE INDEX idx_towns_slug ON towns(slug);
CREATE INDEX idx_towns_name ON towns(name);
CREATE INDEX idx_towns_created_at ON towns(created_at);

-- Note: Data seeding moved to V6 migration with corrected coordinates and census-accurate demographics