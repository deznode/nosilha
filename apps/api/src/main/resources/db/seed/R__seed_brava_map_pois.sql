-- Repeatable migration: BravaMap POIs (57 directory entries)
-- Re-runs automatically when file content changes (checksum-based).
-- Uses DO NOTHING because entries are curated through the admin UI.
-- All entries start as DRAFT for admin review before publishing.
--
-- Source: Originally seeded in V28, categories updated in V29, status fixed in V31.
-- Note: 2 entries from original V28 omitted (praca-eugenio-tavares, igreja-nossa-senhora-do-monte)
-- because they duplicate richer entries in R__seed_directory_entries.sql.

INSERT INTO directory_entries (id, slug, name, description, category, town, latitude, longitude, tags, status)
VALUES
-- === Towns (category: Town) ===
(gen_random_uuid(), 'nova-sintra', 'Nova Sintra',
 'The charming capital of Brava, known as one of the most beautiful towns in Cape Verde. Features colonial architecture, flowering gardens, and cobblestone streets.',
 'Town', 'Nova Sintra', 14.8711, -24.6956, 'capital,colonial,flowers,historic', 'DRAFT'),

(gen_random_uuid(), 'furna', 'Furna',
 'The main port town of Brava located in a natural harbor. Gateway to the island with ferry connections to Fogo and Santiago.',
 'Town', 'Furna', 14.8877, -24.6806, 'port,ferry,harbor,fishing', 'DRAFT'),

(gen_random_uuid(), 'cachaco', 'Cachaço',
 'A mountain village south of Nova Sintra. The second southernmost settlement in Cape Verde, surrounded by scenic hiking trails through lush oases.',
 'Town', 'Cachaço', 14.8371, -24.6944, 'village,mountain,hiking,scenic', 'DRAFT'),

(gen_random_uuid(), 'cova-joana', 'Cova Joana',
 'A picturesque village in a mountain valley north of Nossa Senhora do Monte. Known for its tranquil atmosphere and traditional architecture.',
 'Town', 'Nossa Senhora do Monte', 14.8627, -24.7123, 'village,mountain,scenic,traditional', 'DRAFT'),

(gen_random_uuid(), 'campo-baixo', 'Campo Baixo',
 'A small mountain settlement meaning ''low field''. Near a small hilltop chapel shaped like a ship with Santa Maria painted on it.',
 'Town', 'Nossa Senhora do Monte', 14.8494, -24.7226, 'village,mountain,chapel', 'DRAFT'),

(gen_random_uuid(), 'cova-rodela', 'Cova Rodela',
 'A village in the mountains famous for the dragon tree (Dracaena draco) in its main street. Popular stop on hiking routes.',
 'Town', 'Nova Sintra', 14.8705, -24.7053, 'village,dragon-tree,hiking,nature', 'DRAFT'),

(gen_random_uuid(), 'vinagre', 'Vinagre',
 'A small settlement in the northeastern part of Brava, located between Santa Bárbara and Furna.',
 'Town', 'Furna', 14.8698, -24.6825, 'village,rural', 'DRAFT'),

(gen_random_uuid(), 'mato', 'Mato',
 'A village in the Nossa Senhora do Monte parish, situated in the central mountains of Brava.',
 'Town', 'Nossa Senhora do Monte', 14.8571, -24.7052, 'village,mountain,rural', 'DRAFT'),

(gen_random_uuid(), 'minhoto', 'Minhoto',
 'A small settlement northeast of Nova Sintra, part of the São João Baptista parish.',
 'Town', 'Nova Sintra', 14.8784, -24.6958, 'village,rural', 'DRAFT'),

(gen_random_uuid(), 'mato-grande', 'Mato Grande',
 'A village on the eastern side of Brava with its own church. Known for its scenic location.',
 'Town', 'Nova Sintra', 14.8632, -24.6895, 'village,scenic', 'DRAFT'),

(gen_random_uuid(), 'sorno', 'Sorno',
 'A small village in the northwestern part of Brava.',
 'Town', 'Faja d''Agua', 14.8850, -24.7182, 'village,rural', 'DRAFT'),

(gen_random_uuid(), 'lagoa', 'Lagoa',
 'A hamlet near Fajã de Água.',
 'Town', 'Faja d''Agua', 14.8687, -24.7241, 'hamlet,rural', 'DRAFT'),

(gen_random_uuid(), 'lima-doce', 'Lima Doce',
 'A small hamlet in the central mountains of Brava.',
 'Town', 'Nossa Senhora do Monte', 14.8553, -24.7090, 'hamlet,mountain', 'DRAFT'),

(gen_random_uuid(), 'tantum', 'Tantum',
 'The southernmost settlement in Cape Verde, a remote hamlet in the southwestern corner of Brava with traditional mountain architecture.',
 'Town', 'Cachaço', 14.8280, -24.7200, 'village,remote,southernmost,traditional', 'DRAFT'),

(gen_random_uuid(), 'joao-da-noly', 'João da Noly',
 'A small northern hamlet in the São João Baptista parish.',
 'Town', 'Nova Sintra', 14.8820, -24.6950, 'village,rural,northern', 'DRAFT'),

(gen_random_uuid(), 'lem', 'Lem',
 'A settlement in the northern part of Brava island.',
 'Town', 'Nova Sintra', 14.8780, -24.7000, 'village,rural', 'DRAFT'),

(gen_random_uuid(), 'tome-barraz', 'Tomé Barraz',
 'A small hamlet in the Nossa Senhora do Monte parish.',
 'Town', 'Nossa Senhora do Monte', 14.8560, -24.7180, 'hamlet,mountain', 'DRAFT'),

(gen_random_uuid(), 'baleia', 'Baleia',
 'An eastern settlement in São João Baptista parish.',
 'Town', 'Cachaço', 14.8500, -24.6850, 'village,eastern', 'DRAFT'),

(gen_random_uuid(), 'garca', 'Garça',
 'A small settlement in the central highlands of Brava.',
 'Town', 'Nossa Senhora do Monte', 14.8650, -24.7100, 'hamlet,highland', 'DRAFT'),

(gen_random_uuid(), 'cruzinha', 'Cruzinha',
 'A small settlement in northern Brava.',
 'Town', 'Nova Sintra', 14.8800, -24.7050, 'hamlet,northern', 'DRAFT'),

(gen_random_uuid(), 'espardeiro', 'Espardeiro',
 'A small settlement on the eastern slopes of Brava.',
 'Town', 'Cachaço', 14.8550, -24.6900, 'hamlet,eastern', 'DRAFT'),

(gen_random_uuid(), 'figueiral', 'Figueiral',
 'A small settlement in the northern area of Brava, also known as Figueiral Baixo.',
 'Town', 'Nova Sintra', 14.8750, -24.7150, 'hamlet,northern', 'DRAFT'),

-- === Beaches (category: Beach) ===
(gen_random_uuid(), 'faja-de-agua', 'Fajã de Água',
 'A beautiful coastal village in a sheltered bay with natural swimming pools, coconut palms, and volcanic black sand beaches. One of the most scenic spots on the island.',
 'Beach', 'Faja d''Agua', 14.8715, -24.7315, 'beach,swimming,natural-pools,scenic,coconut-palms', 'DRAFT'),

(gen_random_uuid(), 'natural-pools-faja-de-agua', 'Natural Pools of Fajã de Água',
 'Beautiful volcanic natural swimming pools by the sea in Fajã de Água. Crystal clear water perfect for swimming in a sheltered setting.',
 'Beach', 'Faja d''Agua', 14.8700, -24.7315, 'swimming,natural-pools,volcanic,beach', 'DRAFT'),

-- === Nature (category: Nature) ===
(gen_random_uuid(), 'monte-fontainhas', 'Monte Fontainhas',
 'The highest peak on Brava Island at 976 meters. Offers breathtaking panoramic views of the entire island and Fogo''s volcano on clear days.',
 'Nature', 'Nossa Senhora do Monte', 14.8514, -24.7047, 'hiking,summit,viewpoint,scenic,mountain', 'DRAFT'),

(gen_random_uuid(), 'faja-bay', 'Fajã Bay',
 'A beautiful sheltered bay where lush greens meet the deep blue ocean. Lined with coconut palms and featuring calm waters ideal for swimming.',
 'Nature', 'Faja d''Agua', 14.8690, -24.7320, 'bay,scenic,swimming,coconut-palms,sheltered', 'DRAFT'),

(gen_random_uuid(), 'monte-miranda', 'Monte Miranda',
 'An extinct volcano peak in southern Brava, offering panoramic views.',
 'Nature', 'Cachaço', 14.8309, -24.6932, 'volcano,peak,viewpoint', 'DRAFT'),

(gen_random_uuid(), 'tina', 'Tina',
 'The second highest peak on Brava at 887 meters.',
 'Nature', 'Nossa Senhora do Monte', 14.8627, -24.6989, 'peak,mountain,hiking', 'DRAFT'),

(gen_random_uuid(), 'monte-gambia', 'Monte Gambia',
 'A peak in the northern part of Brava offering coastal views.',
 'Nature', 'Nova Sintra', 14.8864, -24.7053, 'peak,viewpoint', 'DRAFT'),

-- === Viewpoints (category: Viewpoint) ===
(gen_random_uuid(), 'miradouro-santa-maria', 'Miradouro Santa Maria',
 'A scenic viewpoint at the eastern entrance of Nova Sintra featuring a ship monument. Offers beautiful coastal views toward Fogo Island.',
 'Viewpoint', 'Nova Sintra', 14.8728, -24.6910, 'viewpoint,scenic,photography,panoramic', 'DRAFT'),

(gen_random_uuid(), 'miradouro-cutelo-mentira', 'Miradouro de Cutelo Mentira',
 'A viewpoint in Nova Sintra offering fantastic views of the capital town and distant views of Fogo Island''s volcano.',
 'Viewpoint', 'Nova Sintra', 14.8725, -24.6960, 'viewpoint,scenic,photography,panoramic', 'DRAFT'),

(gen_random_uuid(), 'miradouro-mirabeleza', 'Miradouro MiraBeleza',
 'Beauty Viewpoint offers privileged views over the green valley, mountains, and the sea with perfect vistas of Fajã de Água below.',
 'Viewpoint', 'Nossa Senhora do Monte', 14.8662, -24.7148, 'viewpoint,scenic,photography,valley', 'DRAFT'),

(gen_random_uuid(), 'miradouro-miragraciosa', 'Miradouro MiraGraciosa',
 'A viewpoint near Nossa Senhora do Monte church offering beautiful views of the upper Fajã d''Água valley and coast.',
 'Viewpoint', 'Nossa Senhora do Monte', 14.8582, -24.7237, 'viewpoint,scenic,valley,coast', 'DRAFT'),

(gen_random_uuid(), 'miradouro-de-mato-grande', 'Miradouro de Mato Grande',
 'A viewpoint near Mato Grande offering views over the central mountains of Brava.',
 'Viewpoint', 'Nova Sintra', 14.8667, -24.7004, 'viewpoint,scenic,mountain', 'DRAFT'),

(gen_random_uuid(), 'miradouro-mato-grande-east', 'Miradouro Mato Grande',
 'Magnificent viewpoint offering views of Brava''s eastern coast and the neighboring island of Fogo across the channel.',
 'Viewpoint', 'Nova Sintra', 14.8636, -24.6862, 'viewpoint,scenic,coast,fogo-views', 'DRAFT'),

-- === Churches (category: Church) ===
(gen_random_uuid(), 'nossa-senhora-do-monte-church', 'Nossa Senhora do Monte',
 'A mountain village with a historic Catholic pilgrimage church founded in 1826. Offers magnificent views of the coast and valleys below.',
 'Church', 'Nossa Senhora do Monte', 14.8597, -24.7155, 'church,pilgrimage,viewpoint,historic,mountain', 'DRAFT'),

(gen_random_uuid(), 'igreja-sao-joao-baptista', 'Igreja São João Baptista',
 'The main Catholic church in Nova Sintra, built around 1880. Features colonial architecture and is near a scenic viewpoint overlooking the coast.',
 'Church', 'Nova Sintra', 14.8726, -24.6929, 'church,colonial,historic,architecture', 'DRAFT'),

(gen_random_uuid(), 'igreja-do-nazareno', 'Igreja do Nazareno',
 'The oldest Protestant church on Brava Island, located on the main square Praça Eugénio Tavares in Nova Sintra.',
 'Church', 'Nova Sintra', 14.8719, -24.6955, 'church,protestant,historic,nazarene', 'DRAFT'),

(gen_random_uuid(), 'santa-barbara-church', 'Santa Bárbara',
 'A church in the northeastern part of Brava, about 1 km east of Nova Sintra. Features traditional architecture and mountain views.',
 'Church', 'Furna', 14.8749, -24.6847, 'church,mountain', 'DRAFT'),

(gen_random_uuid(), 'nossa-senhora-de-boa-viagem', 'Nossa Senhora de Boa Viagem',
 'A small chapel near Furna dedicated to Our Lady of Safe Voyage, reflecting Brava''s maritime heritage.',
 'Church', 'Furna', 14.8883, -24.6795, 'chapel,maritime,historic', 'DRAFT'),

(gen_random_uuid(), 'igreja-de-mato-grande', 'Igreja de Mato Grande',
 'A church in the Mato Grande area serving the local community.',
 'Church', 'Nova Sintra', 14.8632, -24.6889, 'church', 'DRAFT'),

(gen_random_uuid(), 'igreja-do-cachaco', 'Igreja do Cachaço',
 'The Catholic church in Cachaço village, serving the southern mountain communities.',
 'Church', 'Cachaço', 14.8369, -24.6943, 'church,catholic', 'DRAFT'),

-- === Historic (category: Heritage) ===
(gen_random_uuid(), 'casa-museu-eugenio-tavares', 'Casa Museu Eugénio Tavares',
 'Museum dedicated to the famous morna poet Eugénio Tavares (1867-1930), housed in his former residence. Also serves as a center for morna music studies.',
 'Heritage', 'Nova Sintra', 14.8708, -24.6957, 'museum,cultural,poetry,music,morna', 'DRAFT'),

(gen_random_uuid(), 'ponta-jalunga-lighthouse', 'Ponta Jalunga Lighthouse',
 'A historic lighthouse built in 1891 on a dramatic headland northeast of Furna. The focal height is 80 meters above sea level.',
 'Heritage', 'Furna', 14.8906, -24.6737, 'lighthouse,historic,coastal,landmark', 'DRAFT'),

(gen_random_uuid(), 'mercado-municipal', 'Mercado Municipal',
 'The municipal market of Nova Sintra where locals sell fresh produce and goods.',
 'Heritage', 'Nova Sintra', 14.8704, -24.6953, 'market,local,shopping', 'DRAFT'),

-- === Ports (category: Port) ===
(gen_random_uuid(), 'ferry-terminal-furna', 'Ferry Terminal Furna',
 'The main ferry terminal of Brava. Departure point for ferries to Fogo and Santiago islands.',
 'Port', 'Furna', 14.8878, -24.6779, 'ferry,terminal,transport', 'DRAFT'),

-- === Accommodation (category: Hotel) ===
(gen_random_uuid(), 'hotel-pousada-nova-sintra', 'Hotel Pousada Nova Sintra',
 'A charming hotel in the heart of Nova Sintra with garden, terrace, and restaurant. Features city views and traditional Cape Verdean hospitality.',
 'Hotel', 'Nova Sintra', 14.8687, -24.6944, 'hotel,accommodation,restaurant,central', 'DRAFT'),

(gen_random_uuid(), 'djababras-eco-lodge', 'Djabraba''s Eco-Lodge',
 'A colonial bed & breakfast in Cruz Grande with rooftop terrace, offering eco-friendly accommodations and spectacular views. Includes free breakfast.',
 'Hotel', 'Nova Sintra', 14.8715, -24.6898, 'accommodation,eco-lodge,colonial,rooftop,breakfast', 'DRAFT'),

(gen_random_uuid(), 'hotel-cruz-grande-brava', 'Hotel Cruz Grande-Brava',
 'Hotel at the entrance to Nova Sintra offering rooms with sea or city views. Features a rooftop terrace with panoramic Atlantic Ocean and Fogo Island views.',
 'Hotel', 'Nova Sintra', 14.8725, -24.6914, 'hotel,accommodation,ocean-views,rooftop', 'DRAFT'),

(gen_random_uuid(), 'faja-beach-house', 'Fajã Beach House',
 'Beachside accommodation in Fajã with outdoor swimming pool, garden, terrace and restaurant. Direct access to natural pools and beach.',
 'Hotel', 'Faja d''Agua', 14.8661, -24.7401, 'accommodation,beach,pool,restaurant,coastal', 'DRAFT'),

(gen_random_uuid(), 'kaza-di-zaza', 'Kaza di Zaza',
 'Family-run guesthouse in Fajã de Água offering authentic local experience near the natural pools and beach.',
 'Hotel', 'Faja d''Agua', 14.8695, -24.7308, 'guesthouse,accommodation,family-run,beach,local', 'DRAFT'),

(gen_random_uuid(), 'casa-di-julia', 'Casa di Júlia',
 'A guesthouse in Fajã de Água near the bay and natural pools.',
 'Hotel', 'Faja d''Agua', 14.8719, -24.7312, 'guesthouse,accommodation,beach', 'DRAFT'),

(gen_random_uuid(), 'pensao-o-castelo', 'Pensão O Castelo',
 'Traditional Cape Verdean pension in Nova Sintra with restaurant serving authentic local cuisine.',
 'Hotel', 'Nova Sintra', 14.8713, -24.6950, 'pension,accommodation,restaurant,local-food', 'DRAFT'),

-- === Restaurants (category: Restaurant) ===
(gen_random_uuid(), 'restaurante-luanda', 'Restaurante Luanda',
 'Restaurant in Nova Sintra serving Cape Verdean and international cuisine.',
 'Restaurant', 'Nova Sintra', 14.8697, -24.6952, 'restaurant,cape-verdean-cuisine', 'DRAFT'),

(gen_random_uuid(), 'restaurante-cruz-grande', 'Restaurante Cruz Grande',
 'Restaurant at Hotel Cruz Grande offering dining with panoramic views.',
 'Restaurant', 'Nova Sintra', 14.8724, -24.6914, 'restaurant,hotel,views', 'DRAFT'),

(gen_random_uuid(), 'o-poeta', 'O Poeta',
 'Restaurant named after the poet Eugénio Tavares, located in Nova Sintra.',
 'Restaurant', 'Nova Sintra', 14.8708, -24.6968, 'restaurant,cultural', 'DRAFT'),

(gen_random_uuid(), 'esplanada-sodadi', 'Esplanada Sodadi',
 'Popular esplanade in Nova Sintra for drinks and light meals.',
 'Restaurant', 'Nova Sintra', 14.8714, -24.6958, 'bar,esplanade,social', 'DRAFT')

ON CONFLICT (slug) DO NOTHING;
