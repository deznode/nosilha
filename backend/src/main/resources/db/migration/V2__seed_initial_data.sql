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
             'pousada-djabraba',
             'Pousada Djabraba',
             'A charming guesthouse with stunning views of the surrounding hills. Perfect for a relaxing getaway.',
             'Hotel',
             'Nova Sintra',
             14.8710, -24.7120,
             'https://picsum.photos/800/600?random=2',
             4.8,
             120,
             '+238 555 5678',
             'Wi-Fi,Pool,Free Parking'
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