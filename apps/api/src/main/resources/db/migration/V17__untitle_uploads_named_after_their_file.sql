-- Untitle uploads whose title is only their file's name (spec 034-media-map-redesign, FR-019).
--
-- Upload confirmation used to copy the original filename into title when no description
-- was given, so "DJI_0155.JPG" read as a title. A record with no title now shows as
-- untitled, with its file name shown as the file name. A one-time data fix, not DDL.

UPDATE gallery_media
SET title = NULL
WHERE media_source = 'USER_UPLOAD'
  AND title = original_name;
