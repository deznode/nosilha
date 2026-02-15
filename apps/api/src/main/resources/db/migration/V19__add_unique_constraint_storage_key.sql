CREATE UNIQUE INDEX uq_gallery_media_storage_key
    ON gallery_media(storage_key)
    WHERE storage_key IS NOT NULL;
