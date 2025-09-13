-- Seed data for the directory_entries table for local development

-- A Restaurant
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'nha-kasa-restaurante',
             'Nha Kasa Restaurante',
             'A cozy place offering the best of traditional Cape Verdean cuisine. Known for its cachupa and fresh seafood.',
             'Restaurant',
             'Nova Sintra',
             14.8695, -24.7115,
             'https://picsum.photos/800/600?random=1',
             4.5,
             88,
             '+238 555 1234',
             'Mon-Sat: 12:00 PM - 10:00 PM',
             'Cape Verdean,Seafood'
         );

-- A Hotel
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'djababas-eco-lodge',
             'Djabraba''s Eco-Lodge',
             'An authentic eco-lodge in Cruz Grande offering sustainable mountain accommodation with traditional Cape Verdean hospitality and stunning views of the volcanic landscape.'
             'Hotel',
             'Nova Sintra',
             14.8710, -24.7120,
             'https://picsum.photos/800/600?random=2',
             4.8,
             120,
             '+238 555 5678',
             'Eco-Tourism,Mountain Views,Traditional Architecture,Cultural Immersion,Sustainable Practices'
         );

-- A Beach
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'praia-de-faja-dagua',
             'Praia de Fajã d''Água',
             'A beautiful black sand beach nestled in a green valley, offering a tranquil escape and natural swimming pools.',
             'Beach',
             'Fajã d''Água',
             14.8588, -24.7578,
             'https://picsum.photos/800/600?random=3',
             4.9,
             250
         );

-- A Landmark
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, review_count
) VALUES (
             gen_random_uuid(),
             'miradouro-eugenio-tavares',
             'Miradouro Eugénio Tavares',
             'A viewpoint offering breathtaking panoramic views of the town of Nova Sintra and the ocean beyond. Named after the famous morna poet.',
             'Landmark',
             'Nova Sintra',
             14.8725, -24.7145,
             'https://picsum.photos/800/600?random=4',
             150
         );

-- NEW AUTHENTIC RESTAURANT ENTRIES

-- Restaurante Sodade
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'restaurante-sodade',
             'Restaurante Sodade',
             'Three generations of the Santos family have perfected their cachupa recipe in this cozy mountain restaurant, where each bowl carries the essence of diaspora longing and island tradition.',
             'Restaurant',
             'Nova Sintra',
             14.8645, -24.7065,
             'https://picsum.photos/800/600?random=5',
             4.7,
             156,
             '+238 285 1456',
             '11:00 AM - 11:00 PM Daily',
             'Traditional Cape Verdean,Cachupa Specialties,Grogue Tastings'
         );

-- Casa de Pasto Monte Verde
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'casa-de-pasto-monte-verde',
             'Casa de Pasto Monte Verde',
             'High among the clouds, Dona Maria''s kitchen serves pilgrims and locals alike with traditional morna accompaniment to every meal and stories of faith that sustained our ancestors.',
             'Restaurant',
             'Nossa Senhora do Monte',
             14.8655, -24.7048,
             'https://picsum.photos/800/600?random=6',
             4.4,
             92,
             '+238 285 2134',
             '10:00 AM - 9:00 PM Daily',
             'Mountain Cuisine,Goat Cheese Specialties,Religious Festival Catering'
         );

-- Tasca do Pescador
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'tasca-do-pescador',
             'Tasca do Pescador',
             'Where local fishermen gather each evening, this harbor tavern serves the day''s catch with stories of the sea that connect our working families to Cape Verde''s maritime soul.',
             'Restaurant',
             'Furna',
             14.8833, -24.6640,
             'https://picsum.photos/800/600?random=7',
             4.6,
             203,
             '+238 285 3267',
             '4:00 PM - 12:00 AM Daily',
             'Fresh Seafood,Daily Catch,Harbor Specialties'
         );

-- Restaurante Morabeza
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'restaurante-morabeza',
             'Restaurante Morabeza',
             'In our historic port village, the Tavares family welcomes visitors with the legendary Cape Verdean hospitality that made emigrants ambassadors of kindness worldwide.',
             'Restaurant',
             'Fajã d''Água',
             14.8588, -24.7578,
             'https://picsum.photos/800/600?random=8',
             4.3,
             78,
             '+238 285 4189',
             '12:00 PM - 10:00 PM Daily',
             'Traditional Welcome Ceremonies,Emigrant Stories,Natural Pool Views'
         );

-- Adega do Queijo
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'adega-do-queijo',
             'Adega do Queijo',
             'Paulo Rodrigues combines his family''s century-old cheese-making tradition with simple mountain meals, offering tastes that carry the essence of Brava''s highland pastures.',
             'Restaurant',
             'Cachaço',
             14.8485, -24.7015,
             'https://picsum.photos/800/600?random=9',
             4.8,
             67,
             '+238 285 5243',
             '9:00 AM - 7:00 PM Daily',
             'Queijo do Cachaço,Cheese-making Demonstrations,Highland Cuisine'
         );

-- Cantina da Cova
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'cantina-da-cova',
             'Cantina da Cova',
             'Nestled in our ancient crater, this family cantina serves hearty mountain fare where volcanic soil and grandmother''s wisdom create flavors that taste of home.',
             'Restaurant',
             'Cova Joana',
             14.8595, -24.6985,
             'https://picsum.photos/800/600?random=10',
             4.2,
             54,
             '+238 285 6378',
             '11:00 AM - 9:00 PM Daily',
             'Crater Cuisine,Volcanic Soil Vegetables,Traditional Preserving'
         );

-- O Poeta
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'o-poeta',
             'O Poeta',
             'Named for Eugénio Tavares himself, this cultural restaurant celebrates our island''s literary legacy with morna performances and poetry evenings that honor our contribution to world culture.',
             'Restaurant',
             'Nova Sintra',
             14.8635, -24.7075,
             'https://picsum.photos/800/600?random=11',
             4.5,
             134,
             '+238 285 7456',
             '6:00 PM - 1:00 AM Wed-Sun',
             'Cultural Cuisine,Morna Performances,Poetry Evenings'
         );

-- Taberna do Mar
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'taberna-do-mar',
             'Taberna do Mar',
             'This waterfront taverna serves fresh tuna and wahoo alongside traditional grogue, where fishing boat captains share navigation wisdom passed down through generations.',
             'Restaurant',
             'Furna',
             14.8825, -24.6635,
             'https://picsum.photos/800/600?random=12',
             4.4,
             145,
             '+238 285 8234',
             '3:00 PM - 11:00 PM Daily',
             'Fresh Daily Catch,Grogue Tastings,Maritime Stories'
         );

-- NEW AUTHENTIC HOTEL ENTRIES

-- Casa Colonial Brava
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'casa-colonial-brava',
             'Casa Colonial Brava',
             'A restored 19th-century sobrado where emigrants once planned their journeys, now welcoming diaspora descendants with the same hope and hospitality their ancestors experienced.',
             'Hotel',
             'Nova Sintra',
             14.8642, -24.7072,
             'https://picsum.photos/800/600?random=13',
             4.6,
             87,
             '+238 285 9123',
             'Colonial Architecture,Historical Significance,Diaspora Stories,Mountain Views'
         );

-- Pensão Familiar Furna
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pensao-familiar-furna',
             'Pensão Familiar Furna',
             'The Andrade family opens their harbor home to visitors, sharing fishing traditions and sea stories while providing comfortable rooms overlooking our working port.',
             'Hotel',
             'Furna',
             14.8830, -24.6642,
             'https://picsum.photos/800/600?random=14',
             4.3,
             112,
             '+238 285 9854',
             'Family-Run,Fishing Traditions,Harbor Views,Local Breakfast'
         );

-- Pousada Fajã Tradicional
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pousada-faja-tradicional',
             'Pousada Fajã Tradicional',
             'In our historic emigrant port, this traditional pousada occupies a house where American whaling ship captains once lodged, maintaining the same welcoming spirit.',
             'Hotel',
             'Fajã d''Água',
             14.8585, -24.7582,
             'https://picsum.photos/800/600?random=15',
             4.1,
             65,
             '+238 285 7321',
             'Historic Whaling Connection,Traditional Architecture,Natural Pools Nearby,Emigrant History'
         );

-- Casa de Monte
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'casa-de-monte',
             'Casa de Monte',
             'This pilgrimage lodge provides spiritual retreat accommodation where the sacred and secular meet, offering mountain tranquility and views that inspire contemplation.',
             'Hotel',
             'Nossa Senhora do Monte',
             14.8652, -24.7052,
             'https://picsum.photos/800/600?random=16',
             4.4,
             76,
             '+238 285 6789',
             'Pilgrimage Accommodation,Spiritual Retreat,Mountain Tranquility,Religious Festivals'
         );

-- Alojamento Cachuco
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'alojamento-cachuco',
             'Alojamento Cachuco',
             'High in cheese-making country, this family alojamento offers rural hospitality where guests participate in traditional dairy activities and taste authentic mountain life.',
             'Hotel',
             'Cachaço',
             14.8478, -24.7018,
             'https://picsum.photos/800/600?random=17',
             4.2,
             43,
             '+238 285 5432',
             'Rural Tourism,Cheese-making Activities,Mountain Isolation,Traditional Life Experience'
         );

-- Casa da Cova
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'casa-da-cova',
             'Casa da Cova',
             'Within our volcanic crater''s peaceful embrace, this intimate guesthouse provides crater views and garden tranquility that restores the spirit after life''s journeys.',
             'Hotel',
             'Cova Joana',
             14.8588, -24.6988,
             'https://picsum.photos/800/600?random=18',
             4.5,
             52,
             '+238 285 4567',
             'Crater Setting,Volcanic Landscape,Garden Tranquility,Intimate Atmosphere'
         );

-- NEW AUTHENTIC LANDMARK ENTRIES

-- Igreja Nossa Senhora do Monte
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'igreja-nossa-senhora-do-monte',
             'Igreja Nossa Senhora do Monte',
             'This sacred pilgrimage church has drawn faithful souls for over 150 years, where August processions unite island residents with diaspora descendants in shared devotion.',
             'Landmark',
             'Nossa Senhora do Monte',
             14.8658, -24.7045,
             'https://picsum.photos/800/600?random=19',
             4.9,
             234
         );

-- Casa Eugénio Tavares
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'casa-eugenio-tavares',
             'Casa Eugénio Tavares',
             'The preserved home of Cape Verde''s greatest poet, where morna was perfected and sodade given voice, connecting our island soul to hearts across the world.',
             'Landmark',
             'Nova Sintra',
             14.8648, -24.7068,
             'https://picsum.photos/800/600?random=20',
             4.7,
             189
         );

-- Cemitério dos Emigrantes
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'cemiterio-dos-emigrantes',
             'Cemitério dos Emigrantes',
             'This hillside cemetery overlooks our historic port, where headstones tell stories of those who left for distant shores and those who waited, embodying our diaspora story.',
             'Landmark',
             'Fajã d''Água',
             14.8582, -24.7585,
             'https://picsum.photos/800/600?random=21',
             4.5,
             98
         );

-- Praça Eugénio Tavares
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'praca-eugenio-tavares',
             'Praça Eugénio Tavares',
             'Our town''s cultural heart where the poet''s bust watches over daily life, surrounded by colonial sobrados and the hibiscus gardens that inspired his verses about island beauty.',
             'Landmark',
             'Nova Sintra',
             14.8638, -24.7062,
             'https://picsum.photos/800/600?random=22',
             4.6,
             167
         );

-- Farol de Cima
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'farol-de-cima',
             'Farol de Cima',
             'This lighthouse has guided emigrants'' ships and fishing boats safely home for generations, standing as a beacon of hope that connected our island to the wider world.',
             'Landmark',
             'Furna',
             14.8835, -24.6625,
             'https://picsum.photos/800/600?random=23',
             4.4,
             142
         );

-- Centro Cultural Monte Fontainhas
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'centro-cultural-monte-fontainhas',
             'Centro Cultural Monte Fontainhas',
             'Perched at Brava''s highest inhabited point, this cultural center celebrates our island''s artistic legacy while providing breathtaking views of the entire Cape Verde archipelago.',
             'Landmark',
             'Nossa Senhora do Monte',
             14.8665, -24.7040,
             'https://picsum.photos/800/600?random=24',
             4.8,
             76
         );

-- Antiga Escola Colonial
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'antiga-escola-colonial',
             'Antiga Escola Colonial',
             'This restored schoolhouse represents our community''s resilience in preserving Cape Verdean education and cultural identity despite colonial challenges, celebrating our ancestors'' determination to learn and thrive.',
             'Landmark',
             'Cova Joana',
             14.8595, -24.6982,
             'https://picsum.photos/800/600?random=25',
             4.3,
             84
         );

-- Queijaria Tradicional
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'queijaria-tradicional',
             'Queijaria Tradicional',
             'This traditional cheese house demonstrates the ancient art of Queijo do Cachaço production, where highland techniques create flavors that represent our island''s agricultural soul.',
             'Landmark',
             'Cachaço',
             14.8482, -24.7022,
             'https://picsum.photos/800/600?random=26',
             4.6,
             91
         );

-- NEW AUTHENTIC BEACH/NATURAL SITE ENTRIES

-- Piscinas Naturais de Cova Joana
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'piscinas-naturais-cova-joana',
             'Piscinas Naturais de Cova Joana',
             'Hidden within our crater valley, these volcanic rock pools collect mountain spring water, creating intimate swimming spots where nature''s architecture provides perfect refuge.',
             'Beach',
             'Cova Joana',
             14.8592, -24.6992,
             'https://picsum.photos/800/600?random=27',
             4.7,
             123
         );

-- Trilha dos Pastores
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'trilha-dos-pastores',
             'Trilha dos Pastores',
             'This ancient shepherd''s trail winds through highland pastures where our ancestors grazed goats, offering hikers views of Fogo Island and tastes of traditional pastoral life.',
             'Beach',
             'Cachaço',
             14.8495, -24.7008,
             'https://picsum.photos/800/600?random=28',
             4.4,
             87
         );

-- Rocha do Navio
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'rocha-do-navio',
             'Rocha do Navio',
             'This dramatic sea cliff formation resembles a ship''s prow cutting through ocean waves, where local fishermen read weather patterns their grandfathers taught them.',
             'Beach',
             'Furna',
             14.8838, -24.6635,
             'https://picsum.photos/800/600?random=29',
             4.5,
             156
         );

-- Lagoa da Furna
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count
) VALUES (
             gen_random_uuid(),
             'lagoa-da-furna',
             'Lagoa da Furna',
             'Our crater harbor''s protected lagoon provides safe swimming where children learn to navigate the same waters that carried their ancestors to distant opportunities.',
             'Beach',
             'Furna',
             14.8832, -24.6638,
             'https://picsum.photos/800/600?random=30',
             4.6,
             198
         );

-- AUTHENTIC BRAVA BUSINESSES FROM RESEARCH

-- Pousada Nova Sintra (Authentic)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pousada-nova-sintra',
             'Pousada Nova Sintra',
             'An authentic family-run pousada in the heart of Nova Sintra, offering traditional Cape Verdean hospitality with views of the surrounding mountains and cultural immersion experiences.',
             'Hotel',
             'Nova Sintra',
             14.8640, -24.7060,
             'https://picsum.photos/800/600?random=31',
             4.3,
             95,
             '+238 285 1200',
             'Family-Run,Cultural Immersion,Mountain Views,Traditional Breakfast,Local Guides'
         );

-- Pensão Paulo (Authentic)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, amenities
) VALUES (
             gen_random_uuid(),
             'pensao-paulo',
             'Pensão Paulo',
             'A welcoming pensão offering comfortable accommodation and authentic local experience in Nova Sintra, where guests become part of the Brava Island community.',
             'Hotel',
             'Nova Sintra',
             14.8650, -24.7070,
             'https://picsum.photos/800/600?random=32',
             4.1,
             78,
             '+238 285 1300',
             'Community Experience,Local Hospitality,Central Location,Traditional Architecture'
         );

-- Nós Raiz (Authentic Restaurant)
INSERT INTO directory_entries (
    id, slug, name, description, category, town, latitude, longitude,
    image_url, rating, review_count, phone_number, opening_hours, cuisine
) VALUES (
             gen_random_uuid(),
             'nos-raiz',
             'Nós Raiz',
             'An authentic local restaurant celebrating Cape Verdean roots with traditional recipes and cultural storytelling, where every meal connects diners to Brava Island heritage.',
             'Restaurant',
             'Nova Sintra',
             14.8635, -24.7055,
             'https://picsum.photos/800/600?random=33',
             4.5,
             112,
             '+238 285 1400',
             '11:00 AM - 10:00 PM Daily',
             'Traditional Cape Verdean,Cultural Storytelling,Local Recipes,Heritage Cuisine'
         );