-- Migration: Add EXIF metadata columns to gallery_media
-- Description: Stores extracted EXIF data and manual metadata for photos

-- EXIF metadata columns (extracted from photos)
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS altitude DECIMAL(8, 2);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS date_taken TIMESTAMP WITH TIME ZONE;
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS camera_make VARCHAR(100);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS camera_model VARCHAR(100);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS orientation INTEGER DEFAULT 1;

-- Privacy tracking columns
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS photo_type VARCHAR(20);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS gps_privacy_level VARCHAR(20);

-- Manual metadata columns (for historical photos without EXIF)
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS approximate_date VARCHAR(100);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS photographer_credit VARCHAR(255);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS archive_source VARCHAR(255);

-- Performance indexes for location and date queries
CREATE INDEX IF NOT EXISTS idx_gallery_media_location
ON gallery_media (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_media_date_taken
ON gallery_media (date_taken)
WHERE date_taken IS NOT NULL;

-- Documentation comments
COMMENT ON COLUMN gallery_media.latitude IS 'GPS latitude from EXIF (privacy-processed based on photo_type)';
COMMENT ON COLUMN gallery_media.longitude IS 'GPS longitude from EXIF (privacy-processed based on photo_type)';
COMMENT ON COLUMN gallery_media.altitude IS 'GPS altitude in meters from EXIF';
COMMENT ON COLUMN gallery_media.date_taken IS 'Original capture date from EXIF DateTimeOriginal';
COMMENT ON COLUMN gallery_media.camera_make IS 'Camera manufacturer from EXIF (e.g., Apple, Canon)';
COMMENT ON COLUMN gallery_media.camera_model IS 'Camera model from EXIF (e.g., iPhone 13 Pro)';
COMMENT ON COLUMN gallery_media.orientation IS 'EXIF orientation (1-8) for display rotation';
COMMENT ON COLUMN gallery_media.photo_type IS 'CULTURAL_SITE, COMMUNITY_EVENT, or PERSONAL - determines GPS privacy';
COMMENT ON COLUMN gallery_media.gps_privacy_level IS 'FULL, APPROXIMATE, STRIPPED, or NONE - actual privacy applied';
COMMENT ON COLUMN gallery_media.approximate_date IS 'Manual date entry for historical photos (e.g., circa 1960s)';
COMMENT ON COLUMN gallery_media.location_name IS 'Manual location name for historical photos (e.g., Vila Nova Sintra)';
COMMENT ON COLUMN gallery_media.photographer_credit IS 'Photographer name if known';
COMMENT ON COLUMN gallery_media.archive_source IS 'Source of historical photo (e.g., Family collection)';
