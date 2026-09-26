-- Correct the coordinates of three published directory entries.
--
-- R__seed_directory_entries.sql inserts with ON CONFLICT DO NOTHING, so editing its
-- values never reaches a database that already has these rows; the admin edit modal
-- has no latitude/longitude fields either. The seed carries the same values so fresh
-- databases match.
--
-- References (2026-09 coordinate audit):
--   djababas-eco-lodge            OSM node "Djabraba's Ecolodge" at Cruz Grande on the Furna
--                                 road; the old point was the Nova Sintra square (~630 m off)
--   igreja-nossa-senhora-do-monte OSM church building; the old point was the village (~220 m)
--   faja-dagua                    OSM village node "Fajã d' Água" (~180 m)

UPDATE directory_entries SET latitude = 14.87146, longitude = -24.68980
WHERE slug = 'djababas-eco-lodge';

UPDATE directory_entries SET latitude = 14.85921, longitude = -24.71638
WHERE slug = 'igreja-nossa-senhora-do-monte';

UPDATE directory_entries SET latitude = 14.87149, longitude = -24.73145
WHERE slug = 'faja-dagua';
