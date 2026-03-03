-- Create curated_media table for admin-curated external media (YouTube, images, podcasts)
-- This is separate from the user-uploaded media table (R2 storage)

CREATE TABLE curated_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(20) NOT NULL,
    platform VARCHAR(30) NOT NULL,
    external_id VARCHAR(100),
    url VARCHAR(1024),
    thumbnail_url VARCHAR(1024),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2048),
    author VARCHAR(100),
    category VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    curated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for query performance
CREATE INDEX idx_curated_media_status ON curated_media(status);
CREATE INDEX idx_curated_media_type ON curated_media(media_type);
CREATE INDEX idx_curated_media_category ON curated_media(category);
CREATE INDEX idx_curated_media_display_order ON curated_media(display_order);

-- Add comments for documentation
COMMENT ON TABLE curated_media IS 'Admin-curated external media for the gallery (YouTube videos, external images, podcasts)';
COMMENT ON COLUMN curated_media.media_type IS 'Type of media: IMAGE, VIDEO, or AUDIO';
COMMENT ON COLUMN curated_media.platform IS 'Source platform: YOUTUBE, VIMEO, SOUNDCLOUD, or SELF_HOSTED';
COMMENT ON COLUMN curated_media.external_id IS 'Platform-specific ID (e.g., YouTube video ID: "dQw4w9WgXcQ")';
COMMENT ON COLUMN curated_media.url IS 'Direct URL for self-hosted content or full embed URL';
COMMENT ON COLUMN curated_media.thumbnail_url IS 'Thumbnail/poster image URL (auto-generated for YouTube if null)';
COMMENT ON COLUMN curated_media.category IS 'Category for filtering: Landmark, Historical, Nature, Culture, Event, Interview';
COMMENT ON COLUMN curated_media.display_order IS 'Display order within gallery (lower = first)';
COMMENT ON COLUMN curated_media.status IS 'Publication status: ACTIVE or ARCHIVED';
COMMENT ON COLUMN curated_media.curated_by IS 'Supabase auth user ID of the admin who curated this media';

-- Seed with existing mock data from gallery page

-- Photos (6 items)
INSERT INTO curated_media (media_type, platform, url, thumbnail_url, title, description, category, author, display_order, status) VALUES
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1018/800/600', NULL, 'Nova Sintra Town Square (1960s)', 'A rare color photo of the central plaza before the renovation.', 'Historical', 'Archive', 1, 'ACTIVE'),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1036/800/600', NULL, 'Furna Harbor at Sunset', 'The ferry arriving from Fogo.', 'Landmark', 'João Pereira', 2, 'ACTIVE'),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1015/800/600', NULL, 'Fajã d''Água Cliffs', 'The dramatic coastline on the western side.', 'Nature', 'Maria Silva', 3, 'ACTIVE'),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/292/800/600', NULL, 'Procession of São João', 'Community members carrying the flag.', 'Event', 'Community Upload', 4, 'ACTIVE'),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/305/800/600', NULL, 'Misty Mountains', 'The eternal fog of Brava covering the peaks.', 'Nature', 'Pedro Nunes', 5, 'ACTIVE'),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/110/800/600', NULL, 'Traditional House in Nossa Senhora do Monte', 'Colonial architecture preserved in the highlands.', 'Landmark', 'Ana Gomes', 6, 'ACTIVE');

-- Videos (4 items with YouTube embeds)
-- NOTE: Replace YouTube video IDs with real content before production deployment
INSERT INTO curated_media (media_type, platform, external_id, thumbnail_url, title, description, category, display_order, status) VALUES
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/158/800/450', 'Nos Ilha Podcast Ep. 1: The Departure', 'Sr. Antonio recounts his journey leaving Brava in 1978 and his first winter in Boston.', 'Interview', 1, 'ACTIVE'),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/178/800/450', 'Aerial View: Nova Sintra Gardens', 'Drone footage of the flower capital of Cape Verde in full bloom.', 'Nature', 2, 'ACTIVE'),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/234/800/450', 'Life in the 1950s: A Grandmother''s Tale', 'An interview about daily life, water scarcity, and community spirit before modern amenities.', 'Historical', 3, 'ACTIVE'),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/1023/800/450', 'Fajã d''Água Coastline Walk', 'A relaxing visual journey along the rugged coast to the natural pools.', 'Nature', 4, 'ACTIVE');
