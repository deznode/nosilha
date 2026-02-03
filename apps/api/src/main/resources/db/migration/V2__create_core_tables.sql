-- V2: Core Tables (users, towns)
-- Base tables with no foreign key dependencies.

-- Users: Public profiles linked to Supabase auth
CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- Towns: Brava Island settlements
CREATE TABLE towns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2048) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    population VARCHAR(255),
    elevation VARCHAR(255),
    founded VARCHAR(255),
    highlights TEXT,
    hero_image VARCHAR(255),
    gallery TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_towns_slug ON towns(slug);
CREATE INDEX idx_towns_name ON towns(name);
CREATE INDEX idx_towns_created_at ON towns(created_at);

COMMENT ON COLUMN towns.highlights IS 'JSON array of notable features';
COMMENT ON COLUMN towns.gallery IS 'JSON array of gallery image URLs';
