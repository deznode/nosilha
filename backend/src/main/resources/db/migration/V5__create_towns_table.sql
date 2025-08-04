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

-- Seed the towns table with existing data from the frontend
INSERT INTO towns (slug, name, description, latitude, longitude, population, elevation, founded, highlights, hero_image, gallery) VALUES 
(
    'nova-sintra',
    'Nova Sintra',
    'Our mountain capital where cobblestone streets wind between flower-filled gardens and colonial sobrados tell stories of diaspora dreams realized',
    14.851,
    -24.338,
    '~1,200',
    '500m',
    'Late 17th century',
    '["UNESCO Tentative List site", "Praça Eugénio Tavares", "Colonial sobrados", "Eugénio Tavares Museum"]',
    '/images/towns/nova-sintra-hero.jpg',
    '["/images/towns/nova-sintra-1.jpg", "/images/towns/nova-sintra-2.jpg", "/images/towns/nova-sintra-3.jpg"]'
),
(
    'furna',
    'Furna',
    'Where the sea meets the land in a perfect volcanic embrace, this ancient harbor welcomes every visitor with the rhythms of working boats and ocean waves',
    14.821,
    -24.323,
    '~800',
    'Sea level',
    'Early 18th century as major port',
    '["Volcanic crater harbor", "Fishing fleet", "Maritime festivals", "Nossa Senhora dos Navegantes"]',
    '/images/towns/furna-hero.jpg',
    '["/images/towns/furna-1.jpg", "/images/towns/furna-2.jpg", "/images/towns/furna-3.jpg"]'
),
(
    'faja-de-agua',
    'Fajã de Água',
    'Once our gateway to the world''s whaling ships, now a hidden paradise where volcanic pools offer perfect refuge from the Atlantic''s power',
    14.836,
    -24.366,
    '~126',
    'Sea level-100m',
    '18th century as main port',
    '["Natural swimming pools", "Agricultural terraces", "Abandoned airport", "Emigrant monument"]',
    '/images/towns/faja-de-agua-hero.jpg',
    '["/images/towns/faja-de-agua-1.jpg", "/images/towns/faja-de-agua-2.jpg", "/images/towns/faja-de-agua-3.jpg"]'
),
(
    'nossa-senhora-do-monte',
    'Nossa Senhora do Monte',
    'High among the clouds, this sacred place has drawn pilgrims for over 150 years, offering both spiritual solace and breathtaking views of our island home',
    14.865,
    -24.355,
    '~300',
    '770m',
    'Parish established around 1826',
    '["Pilgrimage church", "August 15th festival", "Monte Fontainhas views", "Religious processions"]',
    '/images/towns/nossa-senhora-do-monte-hero.jpg',
    '["/images/towns/nossa-senhora-do-monte-1.jpg", "/images/towns/nossa-senhora-do-monte-2.jpg", "/images/towns/nossa-senhora-do-monte-3.jpg"]'
),
(
    'cachaco',
    'Cachaço',
    'In Brava''s remote highlands, generations of families have perfected the art of cheese-making, creating flavors that carry the essence of our mountain pastures',
    14.848,
    -24.372,
    '~200',
    '592m',
    '19th century',
    '["Queijo do Cachaço", "Fogo island views", "Traditional cheese making", "Mountain isolation"]',
    '/images/towns/cachaco-hero.jpg',
    '["/images/towns/cachaco-1.jpg", "/images/towns/cachaco-2.jpg", "/images/towns/cachaco-3.jpg"]'
),
(
    'cova-joana',
    'Cova Joana',
    'Cradled within an ancient crater''s embrace, this peaceful valley village showcases the harmony possible between volcanic power and human cultivation',
    14.859,
    -24.349,
    '~150',
    '400m',
    '19th century',
    '["Volcanic crater setting", "Colonial sobrados", "Hibiscus hedges", "Mountain tranquility"]',
    '/images/towns/cova-joana-hero.jpg',
    '["/images/towns/cova-joana-1.jpg", "/images/towns/cova-joana-2.jpg", "/images/towns/cova-joana-3.jpg"]'
);