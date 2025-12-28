/**
 * Directory Mock Data (Extended)
 *
 * Extended mock data for directory entries with bookmark support.
 */

import type { BaseDirectoryEntry } from "@/types/directory";

// Extended directory entry for the enhanced directory view
export interface MockDirectoryEntry extends Omit<
  BaseDirectoryEntry,
  | "slug"
  | "latitude"
  | "longitude"
  | "createdAt"
  | "updatedAt"
  | "contentActions"
> {
  priceLevel?: "$" | "$$" | "$$$";
}

export const MOCK_DIRECTORY_ENTRIES: MockDirectoryEntry[] = [
  {
    id: "1",
    name: "Café Morabeza",
    category: "Restaurant",
    town: "Nova Sintra",
    rating: 4.8,
    reviewCount: 12,
    description:
      "Traditional Cape Verdean cuisine with ocean view. Famous for their catchupa.",
    tags: ["Traditional", "Ocean View", "Breakfast"],
    imageUrl: "https://picsum.photos/id/431/800/600",
    priceLevel: "$$",
  },
  {
    id: "2",
    name: "Fajã d'Água Natural Pools",
    category: "Beach",
    town: "Fajã d'Água",
    rating: 4.9,
    reviewCount: 45,
    description:
      "Beautiful natural swimming pools formed by volcanic rock meeting the Atlantic.",
    tags: ["Swimming", "Nature", "Free"],
    imageUrl: "https://picsum.photos/id/1015/800/600",
  },
  {
    id: "3",
    name: "Eugénio Tavares Museum",
    category: "Landmark",
    town: "Nova Sintra",
    rating: 4.7,
    reviewCount: 28,
    description:
      "The former home of Brava's most famous poet. Contains manuscripts and personal items.",
    tags: ["History", "Poetry", "Museum"],
    imageUrl: "https://picsum.photos/id/211/800/600",
    priceLevel: "$",
  },
  {
    id: "4",
    name: "Restaurante Brava",
    category: "Restaurant",
    town: "Furna",
    rating: 4.5,
    reviewCount: 8,
    description:
      "Family-run restaurant serving fresh seafood right by the harbor.",
    tags: ["Seafood", "Lunch", "Harbor"],
    imageUrl: "https://picsum.photos/id/225/800/600",
    priceLevel: "$$",
  },
  {
    id: "5",
    name: "Nossa Senhora do Monte",
    category: "Landmark",
    town: "Nossa Senhora do Monte",
    rating: 4.6,
    reviewCount: 15,
    description:
      "Historic church located in the misty highlands of the island.",
    tags: ["Religion", "History", "Viewpoint"],
    imageUrl: "https://picsum.photos/id/116/800/600",
  },
  {
    id: "6",
    name: "Bar do Porto",
    category: "Restaurant",
    town: "Furna",
    rating: 4.3,
    reviewCount: 6,
    description:
      "Casual bar and grill overlooking the ferry terminal. Great for grogue.",
    tags: ["Bar", "Grogue", "Casual"],
    imageUrl: "https://picsum.photos/id/167/800/600",
    priceLevel: "$",
  },
];

export const DIRECTORY_TOWNS = [
  "Nova Sintra",
  "Furna",
  "Fajã d'Água",
  "Nossa Senhora do Monte",
  "Cachaço",
  "Cova Joana",
];

export const DIRECTORY_CATEGORIES = [
  "Restaurant",
  "Beach",
  "Landmark",
  "Hotel",
] as const;

// Mock API functions
export const mockDirectoryApi = {
  getEntries: async (filters?: {
    category?: string;
    town?: string;
    searchQuery?: string;
    sortBy?: "rating" | "name" | "newest";
  }): Promise<MockDirectoryEntry[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let entries = [...MOCK_DIRECTORY_ENTRIES];

    if (filters?.category && filters.category !== "All") {
      entries = entries.filter((e) => e.category === filters.category);
    }

    if (filters?.town && filters.town !== "All") {
      entries = entries.filter((e) => e.town === filters.town);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filters?.sortBy === "rating") {
      entries.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (filters?.sortBy === "name") {
      entries.sort((a, b) => a.name.localeCompare(b.name));
    }

    return entries;
  },

  getEntryById: async (id: string): Promise<MockDirectoryEntry | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_DIRECTORY_ENTRIES.find((e) => e.id === id) || null;
  },

  getTowns: async (): Promise<string[]> => {
    return DIRECTORY_TOWNS;
  },
};
