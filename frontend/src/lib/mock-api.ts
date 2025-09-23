import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type { ApiClient } from "@/lib/api-contracts";

const MOCK_ENTRIES: DirectoryEntry[] = [
  // AUTHENTIC HOTEL ENTRIES FROM DATABASE
  {
    id: "1",
    slug: "djababas-eco-lodge",
    name: "Djabraba's Eco-Lodge",
    category: "Hotel",
    imageUrl: "/images/directory/djababas-eco-lodge.jpg",
    town: "Nova Sintra",
    latitude: 14.871,
    longitude: -24.712,
    description:
      "An eco-lodge offering sustainable mountain accommodation with traditional Cape Verdean hospitality and stunning views of the volcanic landscape.",
    rating: 4.8,
    reviewCount: 120,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    details: {
      phoneNumber: "+238 555 5678",
      amenities: [
        "Eco-Tourism",
        "Mountain Views",
        "Traditional Architecture",
        "Cultural Immersion",
        "Sustainable Practices",
      ],
    },
  },
  {
    id: "2",
    slug: "pousada-nova-sintra",
    name: "Pousada Nova Sintra",
    category: "Hotel",
    imageUrl: "/images/directory/pousada-nova-sintra.jpg",
    town: "Nova Sintra",
    latitude: 14.8687443,
    longitude: -24.6943796,
    description:
      "An authentic family-run pousada in the heart of Nova Sintra, offering traditional Cape Verdean hospitality with views of the surrounding mountains and cultural immersion experiences.",
    rating: 4.6,
    reviewCount: 87,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    details: {
      phoneNumber: "+238 262 0444",
      amenities: [
        "Family-Run",
        "Cultural Immersion",
        "Mountain Views",
        "Traditional Breakfast",
        "Local Guides",
      ],
    },
  },
  {
    id: "3",
    slug: "pensao-paulo",
    name: "Pensão Paulo",
    category: "Hotel",
    imageUrl: "/images/directory/pensao-paulo.jpg",
    town: "Nova Sintra",
    latitude: 14.865,
    longitude: -24.707,
    description:
      "A welcoming pensão offering comfortable accommodation and authentic local experience in Nova Sintra, where guests become part of the Brava Island community.",
    rating: 4.3,
    reviewCount: 112,
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-17T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1300",
      amenities: [
        "Community Experience",
        "Local Hospitality",
        "Central Location",
        "Traditional Architecture",
      ],
    },
  },

  // AUTHENTIC RESTAURANT ENTRIES FROM DATABASE
  {
    id: "4",
    slug: "nos-raiz",
    name: "Nós Raiz",
    category: "Restaurant",
    imageUrl: "/images/directory/nos-raiz.jpg",
    town: "Nova Sintra",
    latitude: 14.8635,
    longitude: -24.7055,
    description:
      "An authentic local restaurant celebrating Cape Verdean roots with traditional recipes and cultural storytelling, where every meal connects diners to Brava Island heritage.",
    rating: 4.5,
    reviewCount: 88,
    createdAt: "2024-01-04T10:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    details: {
      phoneNumber: "+238 285 1400",
      openingHours: "11:00 AM - 10:00 PM Daily",
      cuisine: [
        "Traditional Cape Verdean",
        "Cultural Storytelling",
        "Local Recipes",
        "Heritage Cuisine",
      ],
    },
  },

  // AUTHENTIC BEACH ENTRIES FROM DATABASE
  {
    id: "5",
    slug: "praia-de-faja-dagua",
    name: "Praia de Fajã d'Água",
    category: "Beach",
    imageUrl: "/images/directory/praia-de-faja-dagua.jpg",
    town: "Fajã d'Água",
    latitude: 14.8588,
    longitude: -24.7578,
    description:
      "A beautiful black sand beach nestled in a green valley, offering a tranquil escape and natural swimming pools.",
    rating: 5.0,
    reviewCount: 250,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-19T14:30:00Z",
    details: null,
  },

  // AUTHENTIC LANDMARK ENTRIES FROM DATABASE
  {
    id: "6",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Landmark",
    imageUrl: "/images/directory/igreja-nossa-senhora-do-monte.jpg",
    town: "Nossa Senhora do Monte",
    latitude: 14.8591559,
    longitude: -24.7164904,
    description:
      "This sacred pilgrimage church has drawn faithful souls for over 160 years, where August processions unite island residents with diaspora descendants in shared devotion.",
    rating: 4.9,
    reviewCount: 234,
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    details: null,
  },
  {
    id: "7",
    slug: "casa-eugenio-tavares",
    name: "Casa Eugénio Tavares",
    category: "Landmark",
    imageUrl: "/images/directory/casa-eugenio-tavares.jpg",
    town: "Nova Sintra",
    latitude: 14.8648,
    longitude: -24.7068,
    description:
      "The preserved home of Cape Verde's greatest poet, where morna was perfected and sodade given voice, connecting our island soul to hearts across the world.",
    rating: 4.7,
    reviewCount: 189,
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-21T14:30:00Z",
    details: null,
  },
  {
    id: "8",
    slug: "praca-eugenio-tavares",
    name: "Praça Eugénio Tavares",
    category: "Landmark",
    imageUrl: "/images/directory/praca-eugenio-tavares.jpg",
    town: "Nova Sintra",
    latitude: 14.8638,
    longitude: -24.7062,
    description:
      "Our town's cultural heart where the poet's bust watches over daily life, surrounded by colonial sobrados and the hibiscus gardens that inspired his verses about island beauty.",
    rating: 4.6,
    reviewCount: 167,
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
    details: null,
  },
];

/**
 * Mock API Client - Implements ApiClient interface for testing and development
 * This implementation provides realistic mock data with simulated async behavior
 */
export class MockApiClient implements ApiClient {
  /**
   * Simulates network delay for realistic testing
   */
  private async simulateDelay(ms: number = 100): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetches all directory entries or entries for a specific category.
   * Simulates ISR caching behavior with realistic delays.
   */
  async getEntriesByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<DirectoryEntry[]> {
    console.log(`Mock API: Fetching entries for category: ${category}, page: ${page}, size: ${size}`);
    await this.simulateDelay(150);

    let filteredEntries = MOCK_ENTRIES;
    if (category.toLowerCase() !== "all") {
      filteredEntries = MOCK_ENTRIES.filter(
        (entry) => entry.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Simulate pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return filteredEntries.slice(startIndex, endIndex);
  }

  /**
   * Fetches a single directory entry by its slug.
   * Includes realistic delay and proper undefined handling.
   */
  async getEntryBySlug(slug: string): Promise<DirectoryEntry | undefined> {
    console.log(`Mock API: Fetching entry with slug: ${slug}`);
    await this.simulateDelay(100);
    return MOCK_ENTRIES.find((entry) => entry.slug === slug);
  }

  /**
   * Creates a new directory entry (mock implementation).
   * Simulates validation and returns a realistic response.
   */
  async createDirectoryEntry(
    entryData: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    >
  ): Promise<DirectoryEntry> {
    console.log(`Mock API: Creating new directory entry:`, entryData);
    await this.simulateDelay(300); // Longer delay for write operations

    // Simulate validation
    if (!entryData.name || entryData.name.trim().length === 0) {
      throw new Error("Validation failed: name: Name is required");
    }

    // Create mock entry with generated fields
    const newEntry: DirectoryEntry = {
      ...entryData,
      id: `mock-${Date.now()}`,
      slug: entryData.name.toLowerCase().replace(/\s+/g, "-"),
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DirectoryEntry;

    // Add to mock data (in real scenario, this would persist)
    MOCK_ENTRIES.push(newEntry);
    return newEntry;
  }

  /**
   * Fetches entries for map display with larger page size.
   * Uses no caching to simulate real-time map data.
   */
  async getEntriesForMap(category: string = "all"): Promise<DirectoryEntry[]> {
    console.log(`Mock API: Fetching entries for map, category: ${category}`);
    await this.simulateDelay(200);

    if (category.toLowerCase() === "all") {
      return MOCK_ENTRIES;
    }
    return MOCK_ENTRIES.filter(
      (entry) => entry.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Mock image upload implementation.
   * Simulates file processing and returns a mock URL.
   */
  async uploadImage(
    file: File,
    category?: string,
    description?: string
  ): Promise<string> {
    console.log(`Mock API: Uploading image:`, {
      fileName: file.name,
      size: file.size,
      category,
      description
    });
    await this.simulateDelay(1000); // Longer delay for file upload

    // Simulate validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Return mock URL
    const timestamp = Date.now();
    return `/images/uploads/mock-${timestamp}-${file.name}`;
  }

  /**
   * Fetches all towns with simulated caching behavior.
   */
  async getTowns(): Promise<Town[]> {
    console.log(`Mock API: Fetching all towns`);
    await this.simulateDelay(120);
    return MOCK_TOWNS;
  }

  /**
   * Fetches a single town by its slug.
   */
  async getTownBySlug(slug: string): Promise<Town | undefined> {
    console.log(`Mock API: Fetching town with slug: ${slug}`);
    await this.simulateDelay(100);
    return MOCK_TOWNS.find((town) => town.slug === slug);
  }

  /**
   * Fetches towns for map display.
   */
  async getTownsForMap(): Promise<Town[]> {
    console.log(`Mock API: Fetching towns for map`);
    await this.simulateDelay(150);
    return MOCK_TOWNS;
  }
}

// Legacy synchronous functions for backward compatibility and build-time use
export function getMockEntriesByCategory(category: string): DirectoryEntry[] {
  console.log(`Legacy: Using mock fallback for category: ${category}`);
  if (category.toLowerCase() === "all") return MOCK_ENTRIES;
  return MOCK_ENTRIES.filter(
    (entry) => entry.category.toLowerCase() === category.toLowerCase()
  );
}

export function getMockEntryBySlug(slug: string): DirectoryEntry | undefined {
  console.log(`Legacy: Using mock fallback for slug: ${slug}`);
  return MOCK_ENTRIES.find((entry) => entry.slug === slug);
}

// Mock town data aligned with V6 migration database data
const MOCK_TOWNS: Town[] = [
  {
    id: "1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description:
      "Our mountain capital where cobblestone streets wind between flower-filled gardens and colonial sobrados tell stories of diaspora dreams realized",
    latitude: 14.87111,
    longitude: -24.69611,
    population: "1,536 (2010 census)",
    elevation: "520m",
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
    latitude: 14.88694,
    longitude: -24.68,
    population: "612 (2010 census)",
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
    name: "Fajã d'Água",
    description:
      "Once our gateway to the world's whaling ships, now a hidden paradise where volcanic pools offer perfect refuge from the Atlantic's power",
    latitude: 14.87306,
    longitude: -24.73194,
    population: "126 (2010 census)",
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
    latitude: 14.85806,
    longitude: -24.71806,
    population: "271 (2010 census)",
    elevation: "642m",
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
    latitude: 14.83694,
    longitude: -24.69694,
    population: "228 (2010 census)",
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
    latitude: 14.86306,
    longitude: -24.71306,
    population: "183 (2010 census)",
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

// Legacy synchronous functions for towns (backward compatibility)
export function getMockTowns(): Town[] {
  console.log("Legacy: Using mock fallback for towns");
  return MOCK_TOWNS;
}

export function getMockTownBySlug(slug: string): Town | undefined {
  console.log(`Legacy: Using mock fallback for town slug: ${slug}`);
  return MOCK_TOWNS.find((town) => town.slug === slug);
}
