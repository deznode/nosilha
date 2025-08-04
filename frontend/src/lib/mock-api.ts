import { DirectoryEntry } from "../types/directory";
import { Town } from "../types/town";

const MOCK_ENTRIES: DirectoryEntry[] = [
  {
    id: "1",
    slug: "nha-kasa-restaurante",
    name: "Nha Kasa Restaurante",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=1",
    town: "Nova Sintra",
    latitude: 14.8650,
    longitude: -24.7070,
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
    latitude: 14.8640,
    longitude: -24.7080,
    description:
      "A charming and comfortable hotel offering stunning panoramic views of the island and the ocean.",
    rating: 4.8,
    reviewCount: 120,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    details: {
      // Note: phoneNumber might not be available from backend yet for hotels
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
    latitude: 14.8470,
    longitude: -24.7200,
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
    latitude: 14.8690,
    longitude: -24.7050,
    description:
      "A scenic viewpoint dedicated to the famous poet Eugénio Tavares, offering breathtaking views of the coastline.",
    rating: 4.9,
    reviewCount: 150,
    createdAt: "2024-01-04T10:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
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
export function getMockEntriesByCategory(
  category: string
): DirectoryEntry[] {
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
export function getMockEntryBySlug(
  slug: string
): DirectoryEntry | undefined {
  console.log(`Using mock fallback for slug: ${slug}`);
  return MOCK_ENTRIES.find((entry) => entry.slug === slug);
}

// Mock town data based on the existing frontend hardcoded data
const MOCK_TOWNS: Town[] = [
  {
    id: "1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "Our mountain capital where cobblestone streets wind between flower-filled gardens and colonial sobrados tell stories of diaspora dreams realized",
    latitude: 14.851,
    longitude: -24.338,
    population: "~1,200",
    elevation: "500m",
    founded: "Late 17th century",
    highlights: ["UNESCO Tentative List site", "Praça Eugénio Tavares", "Colonial sobrados", "Eugénio Tavares Museum"],
    heroImage: "/images/towns/nova-sintra-hero.jpg",
    gallery: ["/images/towns/nova-sintra-1.jpg", "/images/towns/nova-sintra-2.jpg", "/images/towns/nova-sintra-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "2",
    slug: "furna",
    name: "Furna",
    description: "Where the sea meets the land in a perfect volcanic embrace, this ancient harbor welcomes every visitor with the rhythms of working boats and ocean waves",
    latitude: 14.821,
    longitude: -24.323,
    population: "~800",
    elevation: "Sea level",
    founded: "Early 18th century as major port",
    highlights: ["Volcanic crater harbor", "Fishing fleet", "Maritime festivals", "Nossa Senhora dos Navegantes"],
    heroImage: "/images/towns/furna-hero.jpg",
    gallery: ["/images/towns/furna-1.jpg", "/images/towns/furna-2.jpg", "/images/towns/furna-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "3",
    slug: "faja-de-agua",
    name: "Fajã de Água",
    description: "Once our gateway to the world's whaling ships, now a hidden paradise where volcanic pools offer perfect refuge from the Atlantic's power",
    latitude: 14.836,
    longitude: -24.366,
    population: "~126",
    elevation: "Sea level-100m",
    founded: "18th century as main port",
    highlights: ["Natural swimming pools", "Agricultural terraces", "Abandoned airport", "Emigrant monument"],
    heroImage: "/images/towns/faja-de-agua-hero.jpg",
    gallery: ["/images/towns/faja-de-agua-1.jpg", "/images/towns/faja-de-agua-2.jpg", "/images/towns/faja-de-agua-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "4",
    slug: "nossa-senhora-do-monte",
    name: "Nossa Senhora do Monte",
    description: "High among the clouds, this sacred place has drawn pilgrims for over 150 years, offering both spiritual solace and breathtaking views of our island home",
    latitude: 14.865,
    longitude: -24.355,
    population: "~300",
    elevation: "770m",
    founded: "Parish established around 1826",
    highlights: ["Pilgrimage church", "August 15th festival", "Monte Fontainhas views", "Religious processions"],
    heroImage: "/images/towns/nossa-senhora-do-monte-hero.jpg",
    gallery: ["/images/towns/nossa-senhora-do-monte-1.jpg", "/images/towns/nossa-senhora-do-monte-2.jpg", "/images/towns/nossa-senhora-do-monte-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "5",
    slug: "cachaco",
    name: "Cachaço",
    description: "In Brava's remote highlands, generations of families have perfected the art of cheese-making, creating flavors that carry the essence of our mountain pastures",
    latitude: 14.848,
    longitude: -24.372,
    population: "~200",
    elevation: "592m",
    founded: "19th century",
    highlights: ["Queijo do Cachaço", "Fogo island views", "Traditional cheese making", "Mountain isolation"],
    heroImage: "/images/towns/cachaco-hero.jpg",
    gallery: ["/images/towns/cachaco-1.jpg", "/images/towns/cachaco-2.jpg", "/images/towns/cachaco-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "6",
    slug: "cova-joana",
    name: "Cova Joana",
    description: "Cradled within an ancient crater's embrace, this peaceful valley village showcases the harmony possible between volcanic power and human cultivation",
    latitude: 14.859,
    longitude: -24.349,
    population: "~150",
    elevation: "400m",
    founded: "19th century",
    highlights: ["Volcanic crater setting", "Colonial sobrados", "Hibiscus hedges", "Mountain tranquility"],
    heroImage: "/images/towns/cova-joana-hero.jpg",
    gallery: ["/images/towns/cova-joana-1.jpg", "/images/towns/cova-joana-2.jpg", "/images/towns/cova-joana-3.jpg"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
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
