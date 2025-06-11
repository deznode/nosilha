import { DirectoryEntry } from "./types";

const MOCK_ENTRIES: DirectoryEntry[] = [
  {
    id: "1",
    slug: "nha-kasa-restaurante",
    name: "Nha Kasa Restaurante",
    category: "Restaurant",
    imageUrl: "https://picsum.photos/800/600?random=1", // <-- Updated
    town: "Nova Sintra",
    description:
      "A beloved local spot known for its fresh seafood and traditional Cape Verdean dishes, offering an authentic taste of Brava.",
    rating: 4.5,
    reviewCount: 88,
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
    imageUrl: "https://picsum.photos/800/600?random=2", // <-- Updated
    town: "Nova Sintra",
    description:
      "A charming and comfortable hotel offering stunning panoramic views of the island and the ocean.",
    rating: 4.8,
    reviewCount: 120,
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
    imageUrl: "https://picsum.photos/800/600?random=3", // <-- Updated
    town: "Fajã d'Água",
    description:
      "A beautiful natural swimming bay with volcanic black sand and clear waters, surrounded by dramatic green cliffs.",
    rating: 5.0,
    reviewCount: 250,
    details: null,
  },
  {
    id: "4",
    slug: "miradouro-eugenio-tavares",
    name: "Miradouro Eugénio Tavares",
    category: "Landmark",
    imageUrl: "https://picsum.photos/800/600?random=4", // <-- Updated
    town: "Nova Sintra",
    description:
      "A scenic viewpoint dedicated to the famous poet Eugénio Tavares, offering breathtaking views of the coastline.",
    rating: 4.9,
    reviewCount: 150,
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
