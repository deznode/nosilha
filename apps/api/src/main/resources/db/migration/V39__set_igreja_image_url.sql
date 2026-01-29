-- V39__set_igreja_image_url.sql
-- Set the imageUrl for Igreja Nossa Senhora do Monte (downloaded from Wikimedia Commons)
-- Image stored in category-organized folder: /images/directory/heritage/

UPDATE directory_entries SET
    image_url = '/images/directory/heritage/igreja-nossa-senhora-do-monte.jpg'
WHERE slug = 'igreja-nossa-senhora-do-monte';
