-- V29: Promote map: tag workaround categories to native STI discriminator values
-- Relates to ADR-0011: Native 10-Category Directory System

-- Update discriminator values for rows seeded in V28 with map: tag workaround
UPDATE directory_entries SET category = 'Town'
  WHERE category = 'Nature' AND tags LIKE '%map:Town%';

UPDATE directory_entries SET category = 'Viewpoint'
  WHERE category = 'Nature' AND tags LIKE '%map:Viewpoint%';

UPDATE directory_entries SET category = 'Trail'
  WHERE category = 'Nature' AND tags LIKE '%map:Trail%';

UPDATE directory_entries SET category = 'Port'
  WHERE category = 'Nature' AND tags LIKE '%map:Port%';

UPDATE directory_entries SET category = 'Church'
  WHERE category = 'Heritage' AND tags LIKE '%map:Church%';

-- Strip map: tags (now redundant); NULLIF ensures solo map: tags become NULL not ''
UPDATE directory_entries
  SET tags = NULLIF(TRIM(BOTH ',' FROM regexp_replace(tags, ',?map:[A-Za-z]+,?', ',', 'g')), '')
  WHERE tags ~ 'map:[A-Za-z]+';

-- Update category column comment to reflect all 10 types
COMMENT ON COLUMN directory_entries.category IS
  'STI discriminator: Restaurant, Hotel, Beach, Heritage, Nature, Town, Viewpoint, Trail, Church, Port';
