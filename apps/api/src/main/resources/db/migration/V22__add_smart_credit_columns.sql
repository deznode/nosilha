-- Migration: Add smart credit attribution columns to gallery_media
-- Description: Stores parsed social media platform and handle for creator credits

ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS credit_platform VARCHAR(30);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS credit_handle VARCHAR(100);

COMMENT ON COLUMN gallery_media.credit_platform IS 'Detected social platform: YOUTUBE, INSTAGRAM, FACEBOOK, TWITTER, TIKTOK';
COMMENT ON COLUMN gallery_media.credit_handle IS 'Normalized social media handle (without @ prefix)';
