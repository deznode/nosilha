import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DirectoryCard } from "@/components/ui/directory-card";
import { DirectoryEntry } from "@/types/directory";

/**
 * DirectoryCard displays a directory entry for cultural sites, landmarks,
 * restaurants, and other points of interest on Brava Island, Cape Verde.
 *
 * This component is used throughout the Nos Ilha platform to showcase
 * the island's cultural heritage in a mobile-first, accessible format.
 */
const meta = {
  title: "Nos Ilha/DirectoryCard",
  component: DirectoryCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DirectoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock directory entries for different categories

const restaurantEntry: DirectoryEntry = {
  id: "1",
  slug: "casa-da-morabeza",
  name: "Casa da Morabeza",
  category: "Restaurant",
  town: "Nova Sintra",
  description:
    "A family-run restaurant serving traditional Cape Verdean cachupa and fresh seafood.",
  tags: ["restaurant", "traditional", "cape-verdean"],
  contentActions: null,
  imageUrl: "/api/placeholder/400/250",
  rating: 4.8,
  reviewCount: 127,
  latitude: 14.8514,
  longitude: -24.7086,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-10-01T00:00:00Z",
  details: {
    phoneNumber: "+238 281 1234",
    openingHours: "Mon-Sat 11:00-22:00",
    cuisine: ["Cape Verdean", "Seafood", "Traditional"],
  },
};

const hotelEntry: DirectoryEntry = {
  id: "2",
  slug: "pensao-oceano",
  name: "Pensão Oceano",
  category: "Hotel",
  town: "Fajã d'Água",
  description:
    "Cozy guesthouse with stunning ocean views and traditional Cape Verdean hospitality.",
  tags: ["hotel", "ocean-view", "hospitality"],
  contentActions: null,
  imageUrl: "/api/placeholder/400/250",
  rating: 4.5,
  reviewCount: 89,
  latitude: 14.83,
  longitude: -24.72,
  createdAt: "2024-02-20T00:00:00Z",
  updatedAt: "2024-09-15T00:00:00Z",
  details: {
    phoneNumber: "+238 281 5678",
    amenities: ["Ocean View", "WiFi", "Breakfast Included", "Garden"],
  },
};

const landmarkEntry: DirectoryEntry = {
  id: "3",
  slug: "our-lady-of-mount-carmel",
  name: "Our Lady of Mount Carmel Church",
  category: "Landmark",
  town: "Nova Sintra",
  description:
    "Historic 19th-century church in the heart of Nova Sintra, a testament to Brava Island's Catholic heritage.",
  tags: ["landmark", "heritage", "nova-sintra"],
  contentActions: null,
  imageUrl: "/api/placeholder/400/250",
  rating: 5.0,
  reviewCount: 342,
  latitude: 14.8514,
  longitude: -24.7086,
  createdAt: "2024-01-10T00:00:00Z",
  updatedAt: "2024-10-10T00:00:00Z",
  details: null,
};

const beachEntry: DirectoryEntry = {
  id: "4",
  slug: "praia-de-faja",
  name: "Praia de Fajã",
  category: "Beach",
  town: "Fajã d'Água",
  description:
    "Secluded black sand beach surrounded by dramatic cliffs and lush vegetation. A hidden gem of Brava Island.",
  tags: ["beach", "nature", "faja-dagua"],
  contentActions: null,
  imageUrl: "/api/placeholder/400/250",
  rating: 4.9,
  reviewCount: 256,
  latitude: 14.83,
  longitude: -24.72,
  createdAt: "2024-03-05T00:00:00Z",
  updatedAt: "2024-09-28T00:00:00Z",
  details: null,
};

const entryWithLongDescription: DirectoryEntry = {
  id: "5",
  slug: "eugenio-tavares-museum",
  name: "Eugénio Tavares Museum",
  category: "Landmark", // Changed from "Museum" to valid category
  town: "Nova Sintra",
  description:
    "Dedicated to the life and work of Eugénio Tavares (1867–1930), one of Cape Verde's most celebrated poets and composers. The museum showcases his contributions to morna music and Cape Verdean literature, featuring original manuscripts, personal belongings, and historical photographs. A must-visit for anyone interested in Cape Verdean cultural heritage and the evolution of morna as a musical genre.",
  tags: ["museum", "morna", "heritage"],
  contentActions: null,
  imageUrl: "/api/placeholder/400/250",
  rating: 4.7,
  reviewCount: 98,
  latitude: 14.8514,
  longitude: -24.7086,
  createdAt: "2024-04-12T00:00:00Z",
  updatedAt: "2024-10-05T00:00:00Z",
  details: null,
};

const entryWithoutImage: DirectoryEntry = {
  id: "6",
  slug: "nova-sintra-market",
  name: "Nova Sintra Market",
  category: "Landmark", // Changed from "Market" to valid category
  town: "Nova Sintra",
  description:
    "Local market featuring fresh produce, handicrafts, and traditional Cape Verdean goods.",
  tags: ["market", "heritage", "nova-sintra"],
  contentActions: null,
  imageUrl: null, // Changed from undefined to null
  rating: 4.3,
  reviewCount: 45,
  latitude: 14.8514,
  longitude: -24.7086,
  createdAt: "2024-05-20T00:00:00Z",
  updatedAt: "2024-10-12T00:00:00Z",
  details: null,
};

/**
 * Restaurant variant - showcases a traditional Cape Verdean restaurant
 * with high ratings and substantial review count.
 */
export const Restaurant: Story = {
  args: {
    entry: restaurantEntry,
  },
};

/**
 * Hotel variant - displays a guesthouse with amenities.
 * Demonstrates how accommodation listings appear in the directory.
 */
export const Hotel: Story = {
  args: {
    entry: hotelEntry,
  },
};

/**
 * Landmark variant - shows a cultural heritage site.
 * Perfect rating demonstrates how highly-rated sites display.
 */
export const Landmark: Story = {
  args: {
    entry: landmarkEntry,
  },
};

/**
 * Beach variant - highlights natural attractions.
 * Shows how outdoor recreation sites are presented.
 */
export const Beach: Story = {
  args: {
    entry: beachEntry,
  },
};

/**
 * Long Description - tests how the card handles extensive text.
 * Important for cultural sites with rich histories.
 */
export const LongDescription: Story = {
  args: {
    entry: entryWithLongDescription,
  },
};

/**
 * Without Image - shows fallback state when no photo is available.
 * Some entries may lack imagery, especially user-submitted ones.
 */
export const WithoutImage: Story = {
  args: {
    entry: entryWithoutImage,
  },
};

/**
 * Grid Layout - demonstrates how cards appear in the directory grid.
 * Responsive design adapts from 1 to 3 columns.
 */
export const GridLayout: Story = {
  decorators: [
    () => (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DirectoryCard entry={restaurantEntry} />
        <DirectoryCard entry={hotelEntry} />
        <DirectoryCard entry={landmarkEntry} />
        <DirectoryCard entry={beachEntry} />
        <DirectoryCard entry={entryWithLongDescription} />
        <DirectoryCard entry={entryWithoutImage} />
      </div>
    ),
  ],
  args: {
    entry: restaurantEntry,
  },
};

/**
 * Mobile View - ensures cards work well on small screens.
 * Mobile-first design is critical for diaspora users.
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {
    entry: restaurantEntry,
  },
};
