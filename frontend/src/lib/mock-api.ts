import { DirectoryEntry } from "../types/directory";
import { Town } from "../types/town";

const MOCK_ENTRIES: DirectoryEntry[] = [
  // EXISTING ENTRIES
  {
    id: "1",
    slug: "nha-kasa-restaurante",
    name: "Nha Kasa Restaurante",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=1",
    town: "Nova Sintra",
    latitude: 14.865,
    longitude: -24.707,
    description:
      "A beloved local spot known for its fresh seafood and traditional Cape Verdean dishes, offering an authentic taste of Brava.",
    rating: 4.5,
    reviewCount: 88,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1234",
      openingHours: "12:00 PM - 10:00 PM Daily",
      cuisine: ["Cape Verdean", "Seafood", "Traditional"],
    },
  },
  {
    id: "2",
    slug: "pousada-djabraba",
    name: "Pousada Djabraba",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=2",
    town: "Nova Sintra",
    latitude: 14.864,
    longitude: -24.708,
    description:
      "A charming and comfortable hotel offering stunning panoramic views of the island and the ocean.",
    rating: 4.8,
    reviewCount: 120,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    details: {
      phoneNumber: "+238 285 5678",
      amenities: ["Wi-Fi", "Pool", "Parking"],
    },
  },
  {
    id: "3",
    slug: "praia-de-faja-d-agua",
    name: "Praia de Fajã d'Água",
    category: "Beach",
    imageUrl: "https://picsum.photos/800/600?random=3",
    town: "Fajã d'Água",
    latitude: 14.847,
    longitude: -24.72,
    description:
      "A beautiful natural swimming bay with volcanic black sand and clear waters, surrounded by dramatic green cliffs.",
    rating: 5.0,
    reviewCount: 250,
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-17T14:30:00Z",
    details: null,
  },
  {
    id: "4",
    slug: "miradouro-eugenio-tavares",
    name: "Miradouro Eugénio Tavares",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=4",
    town: "Nova Sintra",
    latitude: 14.869,
    longitude: -24.705,
    description:
      "A scenic viewpoint dedicated to the famous poet Eugénio Tavares, offering breathtaking views of the coastline.",
    rating: 4.9,
    reviewCount: 150,
    createdAt: "2024-01-04T10:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    details: null,
  },

  // NEW AUTHENTIC RESTAURANT ENTRIES
  {
    id: "5",
    slug: "restaurante-sodade",
    name: "Restaurante Sodade",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=5",
    town: "Nova Sintra",
    latitude: 14.8645,
    longitude: -24.7065,
    description:
      "Three generations of the Santos family have perfected their cachupa recipe in this cozy mountain restaurant, where each bowl carries the essence of diaspora longing and island tradition.",
    rating: 4.7,
    reviewCount: 156,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-19T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1456",
      openingHours: "11:00 AM - 11:00 PM Daily",
      cuisine: [
        "Traditional Cape Verdean",
        "Cachupa Specialties",
        "Grogue Tastings",
      ],
    },
  },
  {
    id: "6",
    slug: "casa-de-pasto-monte-verde",
    name: "Casa de Pasto Monte Verde",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=6",
    town: "Nossa Senhora do Monte",
    latitude: 14.8655,
    longitude: -24.3548,
    description:
      "High among the clouds, Dona Maria's kitchen serves pilgrims and locals alike with traditional morna accompaniment to every meal and stories of faith that sustained our ancestors.",
    rating: 4.4,
    reviewCount: 92,
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    details: {
      phoneNumber: "+238 285 2134",
      openingHours: "10:00 AM - 9:00 PM Daily",
      cuisine: [
        "Mountain Cuisine",
        "Goat Cheese Specialties",
        "Religious Festival Catering",
      ],
    },
  },
  {
    id: "7",
    slug: "tasca-do-pescador",
    name: "Tasca do Pescador",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=7",
    town: "Furna",
    latitude: 14.8215,
    longitude: -24.3228,
    description:
      "Where local fishermen gather each evening, this harbor tavern serves the day's catch with stories of the sea that connect our working families to Cape Verde's maritime soul.",
    rating: 4.6,
    reviewCount: 203,
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-21T14:30:00Z",
    details: {
      phoneNumber: "+238 285 3267",
      openingHours: "4:00 PM - 12:00 AM Daily",
      cuisine: ["Fresh Seafood", "Daily Catch", "Harbor Specialties"],
    },
  },
  {
    id: "8",
    slug: "restaurante-morabeza",
    name: "Restaurante Morabeza",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=8",
    town: "Fajã d'Água",
    latitude: 14.8365,
    longitude: -24.3658,
    description:
      "In our historic port village, the Tavares family welcomes visitors with the legendary Cape Verdean hospitality that made emigrants ambassadors of kindness worldwide.",
    rating: 4.3,
    reviewCount: 78,
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
    details: {
      phoneNumber: "+238 285 4189",
      openingHours: "12:00 PM - 10:00 PM Daily",
      cuisine: [
        "Traditional Welcome Ceremonies",
        "Emigrant Stories",
        "Natural Pool Views",
      ],
    },
  },
  {
    id: "9",
    slug: "adega-do-queijo",
    name: "Adega do Queijo",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=9",
    town: "Cachaço",
    latitude: 14.8485,
    longitude: -24.3715,
    description:
      "Paulo Rodrigues combines his family's century-old cheese-making tradition with simple mountain meals, offering tastes that carry the essence of Brava's highland pastures.",
    rating: 4.8,
    reviewCount: 67,
    createdAt: "2024-01-09T10:00:00Z",
    updatedAt: "2024-01-23T14:30:00Z",
    details: {
      phoneNumber: "+238 285 5243",
      openingHours: "9:00 AM - 7:00 PM Daily",
      cuisine: [
        "Queijo do Cachaço",
        "Cheese-making Demonstrations",
        "Highland Cuisine",
      ],
    },
  },
  {
    id: "10",
    slug: "cantina-da-cova",
    name: "Cantina da Cova",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=10",
    town: "Cova Joana",
    latitude: 14.8595,
    longitude: -24.3485,
    description:
      "Nestled in our ancient crater, this family cantina serves hearty mountain fare where volcanic soil and grandmother's wisdom create flavors that taste of home.",
    rating: 4.2,
    reviewCount: 54,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-24T14:30:00Z",
    details: {
      phoneNumber: "+238 285 6378",
      openingHours: "11:00 AM - 9:00 PM Daily",
      cuisine: [
        "Crater Cuisine",
        "Volcanic Soil Vegetables",
        "Traditional Preserving",
      ],
    },
  },
  {
    id: "11",
    slug: "o-poeta",
    name: "O Poeta",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=11",
    town: "Nova Sintra",
    latitude: 14.8635,
    longitude: -24.7075,
    description:
      "Named for Eugénio Tavares himself, this cultural restaurant celebrates our island's literary legacy with morna performances and poetry evenings that honor our contribution to world culture.",
    rating: 4.5,
    reviewCount: 134,
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-25T14:30:00Z",
    details: {
      phoneNumber: "+238 285 7456",
      openingHours: "6:00 PM - 1:00 AM Wed-Sun",
      cuisine: ["Cultural Cuisine", "Morna Performances", "Poetry Evenings"],
    },
  },
  {
    id: "12",
    slug: "taberna-do-mar",
    name: "Taberna do Mar",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=12",
    town: "Furna",
    latitude: 14.8205,
    longitude: -24.3235,
    description:
      "This waterfront taverna serves fresh tuna and wahoo alongside traditional grogue, where fishing boat captains share navigation wisdom passed down through generations.",
    rating: 4.4,
    reviewCount: 145,
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-26T14:30:00Z",
    details: {
      phoneNumber: "+238 285 8234",
      openingHours: "3:00 PM - 11:00 PM Daily",
      cuisine: ["Fresh Daily Catch", "Grogue Tastings", "Maritime Stories"],
    },
  },

  // NEW AUTHENTIC HOTEL ENTRIES
  {
    id: "13",
    slug: "casa-colonial-brava",
    name: "Casa Colonial Brava",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=13",
    town: "Nova Sintra",
    latitude: 14.8642,
    longitude: -24.7072,
    description:
      "A restored 19th-century sobrado where emigrants once planned their journeys, now welcoming diaspora descendants with the same hope and hospitality their ancestors experienced.",
    rating: 4.6,
    reviewCount: 87,
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-27T14:30:00Z",
    details: {
      phoneNumber: "+238 285 9123",
      amenities: [
        "Colonial Architecture",
        "Historical Significance",
        "Diaspora Stories",
        "Mountain Views",
      ],
    },
  },
  {
    id: "14",
    slug: "pensao-familiar-furna",
    name: "Pensão Familiar Furna",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=14",
    town: "Furna",
    latitude: 14.8218,
    longitude: -24.3232,
    description:
      "The Andrade family opens their harbor home to visitors, sharing fishing traditions and sea stories while providing comfortable rooms overlooking our working port.",
    rating: 4.3,
    reviewCount: 112,
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-28T14:30:00Z",
    details: {
      phoneNumber: "+238 285 9854",
      amenities: [
        "Family-Run",
        "Fishing Traditions",
        "Harbor Views",
        "Local Breakfast",
      ],
    },
  },
  {
    id: "15",
    slug: "pousada-faja-tradicional",
    name: "Pousada Fajã Tradicional",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=15",
    town: "Fajã d'Água",
    latitude: 14.8358,
    longitude: -24.3662,
    description:
      "In our historic emigrant port, this traditional pousada occupies a house where American whaling ship captains once lodged, maintaining the same welcoming spirit.",
    rating: 4.1,
    reviewCount: 65,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-29T14:30:00Z",
    details: {
      phoneNumber: "+238 285 7321",
      amenities: [
        "Historic Whaling Connection",
        "Traditional Architecture",
        "Natural Pools Nearby",
        "Emigrant History",
      ],
    },
  },
  {
    id: "16",
    slug: "casa-de-monte",
    name: "Casa de Monte",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=16",
    town: "Nossa Senhora do Monte",
    latitude: 14.8652,
    longitude: -24.3552,
    description:
      "This pilgrimage lodge provides spiritual retreat accommodation where the sacred and secular meet, offering mountain tranquility and views that inspire contemplation.",
    rating: 4.4,
    reviewCount: 76,
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-30T14:30:00Z",
    details: {
      phoneNumber: "+238 285 6789",
      amenities: [
        "Pilgrimage Accommodation",
        "Spiritual Retreat",
        "Mountain Tranquility",
        "Religious Festivals",
      ],
    },
  },
  {
    id: "17",
    slug: "alojamento-cachuco",
    name: "Alojamento Cachuco",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=17",
    town: "Cachaço",
    latitude: 14.8478,
    longitude: -24.3718,
    description:
      "High in cheese-making country, this family alojamento offers rural hospitality where guests participate in traditional dairy activities and taste authentic mountain life.",
    rating: 4.2,
    reviewCount: 43,
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-31T14:30:00Z",
    details: {
      phoneNumber: "+238 285 5432",
      amenities: [
        "Rural Tourism",
        "Cheese-making Activities",
        "Mountain Isolation",
        "Traditional Life Experience",
      ],
    },
  },
  {
    id: "18",
    slug: "casa-da-cova",
    name: "Casa da Cova",
    category: "Hotel",
    imageUrl: "https://picsum.photos/800/600?random=18",
    town: "Cova Joana",
    latitude: 14.8588,
    longitude: -24.3488,
    description:
      "Within our volcanic crater's peaceful embrace, this intimate guesthouse provides crater views and garden tranquility that restores the spirit after life's journeys.",
    rating: 4.5,
    reviewCount: 52,
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    details: {
      phoneNumber: "+238 285 4567",
      amenities: [
        "Crater Setting",
        "Volcanic Landscape",
        "Garden Tranquility",
        "Intimate Atmosphere",
      ],
    },
  },

  // NEW AUTHENTIC LANDMARK ENTRIES
  {
    id: "19",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=19",
    town: "Nossa Senhora do Monte",
    latitude: 14.8658,
    longitude: -24.3545,
    description:
      "This sacred pilgrimage church has drawn faithful souls for over 150 years, where August processions unite island residents with diaspora descendants in shared devotion.",
    rating: 4.9,
    reviewCount: 234,
    createdAt: "2024-01-19T10:00:00Z",
    updatedAt: "2024-02-02T14:30:00Z",
    details: null,
  },
  {
    id: "20",
    slug: "casa-eugenio-tavares",
    name: "Casa Eugénio Tavares",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=20",
    town: "Nova Sintra",
    latitude: 14.8648,
    longitude: -24.7068,
    description:
      "The preserved home of Cape Verde's greatest poet, where morna was perfected and sodade given voice, connecting our island soul to hearts across the world.",
    rating: 4.7,
    reviewCount: 189,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-02-03T14:30:00Z",
    details: null,
  },
  {
    id: "21",
    slug: "cemiterio-dos-emigrantes",
    name: "Cemitério dos Emigrantes",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=21",
    town: "Fajã d'Água",
    latitude: 14.8372,
    longitude: -24.3665,
    description:
      "This hillside cemetery overlooks our historic port, where headstones tell stories of those who left for distant shores and those who waited, embodying our diaspora story.",
    rating: 4.5,
    reviewCount: 98,
    createdAt: "2024-01-21T10:00:00Z",
    updatedAt: "2024-02-04T14:30:00Z",
    details: null,
  },
  {
    id: "22",
    slug: "praca-eugenio-tavares",
    name: "Praça Eugénio Tavares",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=22",
    town: "Nova Sintra",
    latitude: 14.8638,
    longitude: -24.7062,
    description:
      "Our town's cultural heart where the poet's bust watches over daily life, surrounded by colonial sobrados and the hibiscus gardens that inspired his verses about island beauty.",
    rating: 4.6,
    reviewCount: 167,
    createdAt: "2024-01-22T10:00:00Z",
    updatedAt: "2024-02-05T14:30:00Z",
    details: null,
  },
  {
    id: "23",
    slug: "farol-de-cima",
    name: "Farol de Cima",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=23",
    town: "Furna",
    latitude: 14.8228,
    longitude: -24.3215,
    description:
      "This lighthouse has guided emigrants' ships and fishing boats safely home for generations, standing as a beacon of hope that connected our island to the wider world.",
    rating: 4.4,
    reviewCount: 142,
    createdAt: "2024-01-23T10:00:00Z",
    updatedAt: "2024-02-06T14:30:00Z",
    details: null,
  },
  {
    id: "24",
    slug: "centro-cultural-monte-fontainhas",
    name: "Centro Cultural Monte Fontainhas",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=24",
    town: "Nossa Senhora do Monte",
    latitude: 14.8665,
    longitude: -24.354,
    description:
      "Perched at Brava's highest inhabited point, this cultural center celebrates our island's artistic legacy while providing breathtaking views of the entire Cape Verde archipelago.",
    rating: 4.8,
    reviewCount: 76,
    createdAt: "2024-01-24T10:00:00Z",
    updatedAt: "2024-02-07T14:30:00Z",
    details: null,
  },
  {
    id: "25",
    slug: "antiga-escola-colonial",
    name: "Antiga Escola Colonial",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=25",
    town: "Cova Joana",
    latitude: 14.8595,
    longitude: -24.3482,
    description:
      "This restored colonial schoolhouse preserves the educational traditions that prepared generations of Bravenses for success in distant lands, maintaining our commitment to learning.",
    rating: 4.3,
    reviewCount: 84,
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-02-08T14:30:00Z",
    details: null,
  },
  {
    id: "26",
    slug: "queijaria-tradicional",
    name: "Queijaria Tradicional",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=26",
    town: "Cachaço",
    latitude: 14.8482,
    longitude: -24.3722,
    description:
      "This traditional cheese house demonstrates the ancient art of Queijo do Cachaço production, where highland techniques create flavors that represent our island's agricultural soul.",
    rating: 4.6,
    reviewCount: 91,
    createdAt: "2024-01-26T10:00:00Z",
    updatedAt: "2024-02-09T14:30:00Z",
    details: null,
  },

  // NEW AUTHENTIC BEACH/NATURAL SITE ENTRIES
  {
    id: "27",
    slug: "piscinas-naturais-cova-joana",
    name: "Piscinas Naturais de Cova Joana",
    category: "Beach",
    imageUrl: "https://picsum.photos/800/600?random=27",
    town: "Cova Joana",
    latitude: 14.8592,
    longitude: -24.3492,
    description:
      "Hidden within our crater valley, these volcanic rock pools collect mountain spring water, creating intimate swimming spots where nature's architecture provides perfect refuge.",
    rating: 4.7,
    reviewCount: 123,
    createdAt: "2024-01-27T10:00:00Z",
    updatedAt: "2024-02-10T14:30:00Z",
    details: null,
  },
  {
    id: "28",
    slug: "trilha-dos-pastores",
    name: "Trilha dos Pastores",
    category: "Beach",
    imageUrl: "https://picsum.photos/800/600?random=28",
    town: "Cachaço",
    latitude: 14.8495,
    longitude: -24.3708,
    description:
      "This ancient shepherd's trail winds through highland pastures where our ancestors grazed goats, offering hikers views of Fogo Island and tastes of traditional pastoral life.",
    rating: 4.4,
    reviewCount: 87,
    createdAt: "2024-01-28T10:00:00Z",
    updatedAt: "2024-02-11T14:30:00Z",
    details: null,
  },
  {
    id: "29",
    slug: "rocha-do-navio",
    name: "Rocha do Navio",
    category: "Beach",
    imageUrl: "https://picsum.photos/800/600?random=29",
    town: "Furna",
    latitude: 14.8198,
    longitude: -24.3245,
    description:
      "This dramatic sea cliff formation resembles a ship's prow cutting through ocean waves, where local fishermen read weather patterns their grandfathers taught them.",
    rating: 4.5,
    reviewCount: 156,
    createdAt: "2024-01-29T10:00:00Z",
    updatedAt: "2024-02-12T14:30:00Z",
    details: null,
  },
  {
    id: "30",
    slug: "lagoa-da-furna",
    name: "Lagoa da Furna",
    category: "Beach",
    imageUrl: "https://picsum.photos/800/600?random=30",
    town: "Furna",
    latitude: 14.8212,
    longitude: -24.3228,
    description:
      "Our crater harbor's protected lagoon provides safe swimming where children learn to navigate the same waters that carried their ancestors to distant opportunities.",
    rating: 4.6,
    reviewCount: 198,
    createdAt: "2024-01-30T10:00:00Z",
    updatedAt: "2024-02-13T14:30:00Z",
    details: null,
  },
];

export async function getEntriesByCategory(
  category: string
): Promise<DirectoryEntry[]> {
  console.log(`Fetching entries for category: ${category}`);
  if (category.toLowerCase() === "all") return MOCK_ENTRIES;
  return MOCK_ENTRIES.filter(
    (entry) => entry.category.toLowerCase() === category.toLowerCase()
  );
}

// Synchronous fallback functions for build-time use
export function getMockEntriesByCategory(category: string): DirectoryEntry[] {
  console.log(`Using mock fallback for category: ${category}`);
  if (category.toLowerCase() === "all") return MOCK_ENTRIES;
  return MOCK_ENTRIES.filter(
    (entry) => entry.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getEntryById(
  id: string
): Promise<DirectoryEntry | undefined> {
  console.log(`Fetching entry with id: ${id}`);
  return MOCK_ENTRIES.find((entry) => entry.id === id);
}

export async function getEntryBySlug(
  slug: string
): Promise<DirectoryEntry | undefined> {
  console.log(`Fetching entry with slug: ${slug}`);
  return MOCK_ENTRIES.find((entry) => entry.slug === slug);
}

// Synchronous fallback function for build-time use
export function getMockEntryBySlug(slug: string): DirectoryEntry | undefined {
  console.log(`Using mock fallback for slug: ${slug}`);
  return MOCK_ENTRIES.find((entry) => entry.slug === slug);
}

// Mock town data based on the existing frontend hardcoded data
const MOCK_TOWNS: Town[] = [
  {
    id: "1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description:
      "Our mountain capital where cobblestone streets wind between flower-filled gardens and colonial sobrados tell stories of diaspora dreams realized",
    latitude: 14.851,
    longitude: -24.338,
    population: "~1,200",
    elevation: "500m",
    founded: "Late 17th century",
    highlights: [
      "UNESCO Tentative List site",
      "Praça Eugénio Tavares",
      "Colonial sobrados",
      "Eugénio Tavares Museum",
    ],
    heroImage: "/images/towns/nova-sintra-hero.jpg",
    gallery: [
      "/images/towns/nova-sintra-1.jpg",
      "/images/towns/nova-sintra-2.jpg",
      "/images/towns/nova-sintra-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    slug: "furna",
    name: "Furna",
    description:
      "Where the sea meets the land in a perfect volcanic embrace, this ancient harbor welcomes every visitor with the rhythms of working boats and ocean waves",
    latitude: 14.821,
    longitude: -24.323,
    population: "~800",
    elevation: "Sea level",
    founded: "Early 18th century as major port",
    highlights: [
      "Volcanic crater harbor",
      "Fishing fleet",
      "Maritime festivals",
      "Nossa Senhora dos Navegantes",
    ],
    heroImage: "/images/towns/furna-hero.jpg",
    gallery: [
      "/images/towns/furna-1.jpg",
      "/images/towns/furna-2.jpg",
      "/images/towns/furna-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "3",
    slug: "faja-de-agua",
    name: "Fajã de Água",
    description:
      "Once our gateway to the world's whaling ships, now a hidden paradise where volcanic pools offer perfect refuge from the Atlantic's power",
    latitude: 14.836,
    longitude: -24.366,
    population: "~126",
    elevation: "Sea level-100m",
    founded: "18th century as main port",
    highlights: [
      "Natural swimming pools",
      "Agricultural terraces",
      "Abandoned airport",
      "Emigrant monument",
    ],
    heroImage: "/images/towns/faja-de-agua-hero.jpg",
    gallery: [
      "/images/towns/faja-de-agua-1.jpg",
      "/images/towns/faja-de-agua-2.jpg",
      "/images/towns/faja-de-agua-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "4",
    slug: "nossa-senhora-do-monte",
    name: "Nossa Senhora do Monte",
    description:
      "High among the clouds, this sacred place has drawn pilgrims for over 150 years, offering both spiritual solace and breathtaking views of our island home",
    latitude: 14.865,
    longitude: -24.355,
    population: "~300",
    elevation: "770m",
    founded: "Parish established around 1826",
    highlights: [
      "Pilgrimage church",
      "August 15th festival",
      "Monte Fontainhas views",
      "Religious processions",
    ],
    heroImage: "/images/towns/nossa-senhora-do-monte-hero.jpg",
    gallery: [
      "/images/towns/nossa-senhora-do-monte-1.jpg",
      "/images/towns/nossa-senhora-do-monte-2.jpg",
      "/images/towns/nossa-senhora-do-monte-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "5",
    slug: "cachaco",
    name: "Cachaço",
    description:
      "In Brava's remote highlands, generations of families have perfected the art of cheese-making, creating flavors that carry the essence of our mountain pastures",
    latitude: 14.848,
    longitude: -24.372,
    population: "~200",
    elevation: "592m",
    founded: "19th century",
    highlights: [
      "Queijo do Cachaço",
      "Fogo island views",
      "Traditional cheese making",
      "Mountain isolation",
    ],
    heroImage: "/images/towns/cachaco-hero.jpg",
    gallery: [
      "/images/towns/cachaco-1.jpg",
      "/images/towns/cachaco-2.jpg",
      "/images/towns/cachaco-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "6",
    slug: "cova-joana",
    name: "Cova Joana",
    description:
      "Cradled within an ancient crater's embrace, this peaceful valley village showcases the harmony possible between volcanic power and human cultivation",
    latitude: 14.859,
    longitude: -24.349,
    population: "~150",
    elevation: "400m",
    founded: "19th century",
    highlights: [
      "Volcanic crater setting",
      "Colonial sobrados",
      "Hibiscus hedges",
      "Mountain tranquility",
    ],
    heroImage: "/images/towns/cova-joana-hero.jpg",
    gallery: [
      "/images/towns/cova-joana-1.jpg",
      "/images/towns/cova-joana-2.jpg",
      "/images/towns/cova-joana-3.jpg",
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
];

// Synchronous fallback functions for town data
export function getMockTowns(): Town[] {
  console.log("Using mock fallback for towns");
  return MOCK_TOWNS;
}

export function getMockTownBySlug(slug: string): Town | undefined {
  console.log(`Using mock fallback for town slug: ${slug}`);
  return MOCK_TOWNS.find((town) => town.slug === slug);
}
