import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DirectoryCard } from '@/components/ui/directory-card';
import { DirectoryEntry } from '@/types/directory';

/**
 * DirectoryCard displays a directory entry for cultural sites, landmarks,
 * restaurants, and other points of interest on Brava Island, Cape Verde.
 *
 * This component is used throughout the Nos Ilha platform to showcase
 * the island's cultural heritage in a mobile-first, accessible format.
 */
const meta = {
  title: 'Nos Ilha/DirectoryCard',
  component: DirectoryCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
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
  id: '1',
  slug: 'casa-da-morabeza',
  name: 'Casa da Morabeza',
  category: 'Restaurant',
  town: 'Nova Sintra',
  description: 'A family-run restaurant serving traditional Cape Verdean cachupa and fresh seafood.',
  imageUrl: '/api/placeholder/400/250',
  rating: 4.8,
  reviewCount: 127,
  coordinates: { lat: 14.8514, lng: -24.7086 },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-10-01'),
};

const hotelEntry: DirectoryEntry = {
  id: '2',
  slug: 'pensao-oceano',
  name: 'Pensão Oceano',
  category: 'Hotel',
  town: 'Fajã d\'Água',
  description: 'Cozy guesthouse with stunning ocean views and traditional Cape Verdean hospitality.',
  imageUrl: '/api/placeholder/400/250',
  rating: 4.5,
  reviewCount: 89,
  coordinates: { lat: 14.8300, lng: -24.7200 },
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-09-15'),
};

const landmarkEntry: DirectoryEntry = {
  id: '3',
  slug: 'our-lady-of-mount-carmel',
  name: 'Our Lady of Mount Carmel Church',
  category: 'Landmark',
  town: 'Nova Sintra',
  description: 'Historic 19th-century church in the heart of Nova Sintra, a testament to Brava Island\'s Catholic heritage.',
  imageUrl: '/api/placeholder/400/250',
  rating: 5.0,
  reviewCount: 342,
  coordinates: { lat: 14.8514, lng: -24.7086 },
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-10-10'),
};

const beachEntry: DirectoryEntry = {
  id: '4',
  slug: 'praia-de-faja',
  name: 'Praia de Fajã',
  category: 'Beach',
  town: 'Fajã d\'Água',
  description: 'Secluded black sand beach surrounded by dramatic cliffs and lush vegetation. A hidden gem of Brava Island.',
  imageUrl: '/api/placeholder/400/250',
  rating: 4.9,
  reviewCount: 256,
  coordinates: { lat: 14.8300, lng: -24.7200 },
  createdAt: new Date('2024-03-05'),
  updatedAt: new Date('2024-09-28'),
};

const entryWithLongDescription: DirectoryEntry = {
  id: '5',
  slug: 'eugenio-tavares-museum',
  name: 'Eugénio Tavares Museum',
  category: 'Museum',
  town: 'Nova Sintra',
  description: 'Dedicated to the life and work of Eugénio Tavares (1867–1930), one of Cape Verde\'s most celebrated poets and composers. The museum showcases his contributions to morna music and Cape Verdean literature, featuring original manuscripts, personal belongings, and historical photographs. A must-visit for anyone interested in Cape Verdean cultural heritage and the evolution of morna as a musical genre.',
  imageUrl: '/api/placeholder/400/250',
  rating: 4.7,
  reviewCount: 98,
  coordinates: { lat: 14.8514, lng: -24.7086 },
  createdAt: new Date('2024-04-12'),
  updatedAt: new Date('2024-10-05'),
};

const entryWithoutImage: DirectoryEntry = {
  id: '6',
  slug: 'nova-sintra-market',
  name: 'Nova Sintra Market',
  category: 'Market',
  town: 'Nova Sintra',
  description: 'Local market featuring fresh produce, handicrafts, and traditional Cape Verdean goods.',
  imageUrl: undefined,
  rating: 4.3,
  reviewCount: 45,
  coordinates: { lat: 14.8514, lng: -24.7086 },
  createdAt: new Date('2024-05-20'),
  updatedAt: new Date('2024-10-12'),
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
 * Hotel variant - displays a guesthouse with ocean views.
 * Demonstrates how accommodations are presented to diaspora visitors.
 */
export const Hotel: Story = {
  args: {
    entry: hotelEntry,
  },
};

/**
 * Landmark variant - shows a historic church, representing Brava's
 * rich cultural and religious heritage.
 */
export const Landmark: Story = {
  args: {
    entry: landmarkEntry,
  },
};

/**
 * Beach variant - features a secluded beach with high ratings.
 * Perfect for showcasing Brava's natural beauty.
 */
export const Beach: Story = {
  args: {
    entry: beachEntry,
  },
};

/**
 * Long Description - demonstrates how the card handles extensive
 * descriptive text while maintaining visual balance.
 */
export const WithLongDescription: Story = {
  args: {
    entry: entryWithLongDescription,
  },
};

/**
 * No Image - shows fallback state when no image is available.
 * Ensures graceful degradation and accessibility.
 */
export const WithoutImage: Story = {
  args: {
    entry: entryWithoutImage,
  },
};

/**
 * High Rating - showcases a landmark with perfect 5.0 rating
 * and extensive community reviews.
 */
export const HighRating: Story = {
  args: {
    entry: landmarkEntry,
  },
};

/**
 * Low Reviews - displays an entry with fewer reviews,
 * showing how the component handles varying review counts.
 */
export const LowReviews: Story = {
  args: {
    entry: entryWithoutImage,
  },
};
