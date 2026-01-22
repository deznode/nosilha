-- V37__apply_research_corrections.sql
-- Apply research corrections from January 2026 review
-- Corrects coordinates, phone numbers, categories, and contact info for 8 entries

-- 1. Djabraba's Eco-Lodge (CRITICAL: fix placeholder phone)
UPDATE directory_entries SET
    latitude = 14.870500,
    longitude = -24.695535,
    phone_number = '+238 285 26 94',
    email = 'marcogiandinoto@gmail.com',
    website = 'https://www.djabrabaeco-lodge.cv/'
WHERE slug = 'djababas-eco-lodge';

-- 2. Nos Raiz (CRITICAL: reclassify and relocate)
-- Note: Changing from Restaurant to Hotel category
UPDATE directory_entries SET
    category = 'Hotel',
    town = 'Faja d''Agua',
    latitude = 14.873,
    longitude = -24.732,
    phone_number = '+238 977 9998',
    email = 'nosraizcv@gmail.com',
    opening_hours = NULL,
    cuisine = NULL,
    description = 'A multi-service residence in the coastal village of Faja d''Agua, offering cozy accommodation with bar and restaurant services. The name means "Our Roots," reflecting authentic Cape Verdean hospitality.'
WHERE slug = 'nos-raiz';

-- 3. Casa Eugenio Tavares
UPDATE directory_entries SET
    latitude = 14.8699988107245,
    longitude = -24.698636386530936,
    phone_number = '+238 2623385',
    email = 'nospatrimonio@gmail.com',
    website = 'http://www.eugeniotavares.org',
    opening_hours = 'Mon-Fri 08:00-13:00, 14:00-16:00; Sat-Sun by appointment'
WHERE slug = 'casa-eugenio-tavares';

-- 4. Praca Eugenio Tavares
UPDATE directory_entries SET
    latitude = 14.871352344591463,
    longitude = -24.695556421325776,
    description = 'The cultural heart of Nova Sintra, this historic square honors poet Eugenio Tavares (1867-1930) with a bronze statue inaugurated June 24, 2002. Features a traditional music pavilion and Portuguese pavement mosaics. Part of the UNESCO-nominated Nova Sintra Historic Centre.'
WHERE slug = 'praca-eugenio-tavares';

-- 5. Faja d'Agua (rename and recategorize from Beach to Nature)
UPDATE directory_entries SET
    name = 'Faja d''Agua',
    category = 'Nature',
    latitude = 14.873,
    longitude = -24.732,
    description = 'Historic fishing village famous for crystal-clear natural swimming pools carved from black volcanic rock. Site of the 1943 Matilde tragedy memorial and starting point of Cape Verdean emigration to America.'
WHERE slug = 'praia-de-faja-dagua';

-- 6. Igreja Nossa Senhora do Monte
UPDATE directory_entries SET
    latitude = 14.858,
    longitude = -24.718,
    description = 'Historic pilgrimage church established c. 1826, representing Brava''s Madeiran devotional heritage. Currently under reconstruction (2023-present) with diaspora support. Annual festival: second weekend of August.'
WHERE slug = 'igreja-nossa-senhora-do-monte';

-- 7. Pensao Paulo
UPDATE directory_entries SET
    latitude = 14.870085,
    longitude = -24.695388,
    phone_number = '+238 285 13 12',
    email = 'pensaopaulo@hotmail.com',
    website = 'https://pgbspensao.cv'
WHERE slug = 'pensao-paulo';

-- 8. Pousada Nova Sintra
UPDATE directory_entries SET
    latitude = 14.86868289,
    longitude = -24.6942991,
    phone_number = '+238 262 0444'
WHERE slug = 'pousada-nova-sintra';
