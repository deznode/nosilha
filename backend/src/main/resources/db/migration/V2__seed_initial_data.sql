-- Seed data for the directory_entries table for local development


-- A Hotel
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'djababas-eco-lodge',
             'Djabraba''s Eco-Lodge',
             'An eco-lodge offering sustainable mountain accommodation with traditional Cape Verdean hospitality and stunning views of the volcanic landscape.',
             'Hotel',
             'Nova Sintra',
             14.8710, -24.7120,
             '+238 555 5678',
             'Eco-Tourism,Mountain Views,Traditional Architecture,Cultural Immersion,Sustainable Practices'
         );

-- A Beach
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude
) VALUES (
             gen_random_uuid(),
             'praia-de-faja-dagua',
             'Praia de Fajã d''Água',
             'A beautiful black sand beach nestled in a green valley, offering a tranquil escape and natural swimming pools.',
             'Beach',
             'Fajã d''Água',
             14.8588, -24.7578
         );


-- NEW AUTHENTIC RESTAURANT ENTRIES









-- NEW AUTHENTIC HOTEL ENTRIES







-- NEW AUTHENTIC LANDMARK ENTRIES

-- Igreja Nossa Senhora do Monte
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude
) VALUES (
             gen_random_uuid(),
             'igreja-nossa-senhora-do-monte',
             'Igreja Nossa Senhora do Monte',
             'This sacred pilgrimage church has drawn faithful souls for over 160 years, where August processions unite island residents with diaspora descendants in shared devotion.',
             'Landmark',
             'Nossa Senhora do Monte',
             14.8591559, -24.7164904
         );

-- Casa Eugénio Tavares
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude
) VALUES (
             gen_random_uuid(),
             'casa-eugenio-tavares',
             'Casa Eugénio Tavares',
             'The preserved home of Cape Verde''s greatest poet, where morna was perfected and sodade given voice, connecting our island soul to hearts across the world.',
             'Landmark',
             'Nova Sintra',
             14.8648, -24.7068
         );


-- Praça Eugénio Tavares
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude
) VALUES (
             gen_random_uuid(),
             'praca-eugenio-tavares',
             'Praça Eugénio Tavares',
             'Our town''s cultural heart where the poet''s bust watches over daily life, surrounded by colonial sobrados and the hibiscus gardens that inspired his verses about island beauty.',
             'Landmark',
             'Nova Sintra',
             14.8638, -24.7062
         );





-- NEW AUTHENTIC BEACH/NATURAL SITE ENTRIES





-- AUTHENTIC BRAVA BUSINESSES FROM RESEARCH

-- Pousada Nova Sintra (Authentic)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pousada-nova-sintra',
             'Pousada Nova Sintra',
             'An authentic family-run pousada in the heart of Nova Sintra, offering traditional Cape Verdean hospitality with views of the surrounding mountains and cultural immersion experiences.',
             'Hotel',
             'Nova Sintra',
             14.8687443, -24.6943796,
             '+238 262 0444',
             'Family-Run,Cultural Immersion,Mountain Views,Traditional Breakfast,Local Guides'
         );

-- Pensão Paulo (Authentic)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pensao-paulo',
             'Pensão Paulo',
             'A welcoming pensão offering comfortable accommodation and authentic local experience in Nova Sintra, where guests become part of the Brava Island community.',
             'Hotel',
             'Nova Sintra',
             14.8650, -24.7070,
             '+238 285 1300',
             'Community Experience,Local Hospitality,Central Location,Traditional Architecture'
         );

-- Nós Raiz (Authentic Restaurant)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'nos-raiz',
             'Nós Raiz',
             'An authentic local restaurant celebrating Cape Verdean roots with traditional recipes and cultural storytelling, where every meal connects diners to Brava Island heritage.',
             'Restaurant',
             'Nova Sintra',
             14.8635, -24.7055,
             '+238 285 1400',
             '11:00 AM - 10:00 PM Daily',
             'Traditional Cape Verdean,Cultural Storytelling,Local Recipes,Heritage Cuisine'
         );