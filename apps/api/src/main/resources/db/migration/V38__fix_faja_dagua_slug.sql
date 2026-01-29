-- V38__fix_faja_dagua_slug.sql
-- Update slug to match the renamed entry "Faja d'Agua"

UPDATE directory_entries SET
    slug = 'faja-dagua'
WHERE slug = 'praia-de-faja-dagua';
