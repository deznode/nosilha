-- Add AI-generated title column to gallery_media (consistent with other ai_* fields)
ALTER TABLE gallery_media ADD COLUMN ai_title VARCHAR(256);
