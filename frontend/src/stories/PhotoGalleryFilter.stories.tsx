import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PhotoGalleryFilter } from "@/components/ui/photo-gallery-filter";
import { userEvent } from "@storybook/testing-library";
import { within } from "@storybook/testing-library";

/**
 * PhotoGalleryFilter provides category-based filtering for Brava Island photo galleries.
 *
 * Showcases cultural heritage through community-contributed photographs,
 * with features for filtering, featured galleries, and responsive grid layouts.
 */
const meta = {
  title: "Nos Ilha/PhotoGalleryFilter",
  component: PhotoGalleryFilter,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PhotoGalleryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for galleries and categories
const mockCategories = [
  { name: "All Photos", value: "all", count: 248 },
  { name: "Landscapes", value: "landscapes", count: 87 },
  { name: "Architecture", value: "architecture", count: 52 },
  { name: "People & Culture", value: "culture", count: 63 },
  { name: "Events", value: "events", count: 46 },
];

const mockPhotos = [
  {
    src: "/api/placeholder/300/300",
    alt: "Sample photo 1",
    location: "Nova Sintra",
    date: "2024-08-15",
    description: "Photo description",
  },
  {
    src: "/api/placeholder/300/300",
    alt: "Sample photo 2",
    location: "Fajã d'Água",
    date: "2024-08-16",
    description: "Photo description",
  },
  {
    src: "/api/placeholder/300/300",
    alt: "Sample photo 3",
    location: "Mato",
    date: "2024-08-17",
    description: "Photo description",
  },
];

const mockGalleries = [
  {
    id: "gallery-1",
    title: "Volcanic Peaks of Brava",
    description:
      "Stunning views of Brava's volcanic landscape and dramatic mountain scenery.",
    category: "Landscapes",
    imageCount: 24,
    coverImage: "/api/placeholder/400/300",
    featured: true,
    culturalContext: "Natural Heritage",
    location: "Throughout Brava",
    photos: mockPhotos,
  },
  {
    id: "gallery-2",
    title: "Nossa Senhora do Monte",
    description:
      "Architectural details of Brava's historic churches and religious heritage sites.",
    category: "Architecture",
    imageCount: 18,
    coverImage: "/api/placeholder/400/300",
    featured: true,
    culturalContext: "Religious Heritage",
    location: "Nova Sintra",
    photos: mockPhotos,
  },
  {
    id: "gallery-3",
    title: "Morna Music Traditions",
    description:
      "Capturing the soul of Cape Verde through traditional morna performances.",
    category: "Culture",
    imageCount: 32,
    coverImage: "/api/placeholder/400/300",
    featured: true,
    culturalContext: "Musical Heritage",
    location: "Various Locations",
    photos: mockPhotos,
  },
  {
    id: "gallery-4",
    title: "Festas Juninas 2024",
    description:
      "Community celebrations of São João and Santo António festivals.",
    category: "Events",
    imageCount: 45,
    coverImage: "/api/placeholder/400/300",
    featured: false,
    culturalContext: "Cultural Events",
    location: "Nova Sintra",
    photos: mockPhotos,
  },
  {
    id: "gallery-5",
    title: "Coastal Villages",
    description: "Daily life in Brava's picturesque coastal settlements.",
    category: "Landscapes",
    imageCount: 29,
    coverImage: "/api/placeholder/400/300",
    featured: false,
    culturalContext: "Daily Life",
    location: "Fajã d'Água",
    photos: mockPhotos,
  },
  {
    id: "gallery-6",
    title: "Traditional Crafts",
    description:
      "Artisans preserving Brava's cultural heritage through traditional craftsmanship.",
    category: "Culture",
    imageCount: 21,
    coverImage: "/api/placeholder/400/300",
    featured: false,
    culturalContext: "Crafts & Artisans",
    location: "Various Locations",
    photos: mockPhotos,
  },
];

/**
 * Default - full photo gallery filter with all categories and galleries.
 * Shows both featured and regular gallery sections.
 */
export const Default: Story = {
  args: {
    galleries: mockGalleries,
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * With Featured Only - displays only featured galleries.
 * Used when highlighting curated content.
 */
export const FeaturedOnly: Story = {
  args: {
    galleries: mockGalleries.filter((g) => g.featured),
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * Empty State - demonstrates no results message.
 * Shows when filtered category has no galleries.
 */
export const EmptyCategory: Story = {
  args: {
    galleries: [],
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * Single Category - galleries from one category only.
 * Shows filtering behavior for specific content types.
 */
export const LandscapesOnly: Story = {
  args: {
    galleries: mockGalleries.filter((g) => g.category === "Landscapes"),
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

export const SelectedFilters: Story = {
  args: {
    galleries: mockGalleries,
    categories: mockCategories.map((category) => ({
      ...category,
      isSelected: ["Landscapes", "Culture"].includes(category.name),
    })),
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

export const KeyboardNavigation: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstButton = await canvas.findByRole("button", {
      name: /landscapes/i,
    });
    const user = userEvent.setup();
    await user.click(firstButton);
    await user.tab();
    await user.keyboard(" ");
  },
};

/**
 * Architecture Galleries - focuses on built heritage.
 * Demonstrates cultural heritage preservation through architecture.
 */
export const ArchitectureGalleries: Story = {
  args: {
    galleries: mockGalleries.filter((g) => g.category === "Architecture"),
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile View - responsive layout for mobile devices.
 * Ensures touch-friendly filters and readable gallery cards.
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {
    galleries: mockGalleries,
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-4">
        <Story />
      </div>
    ),
  ],
};

/**
 * Tablet View - demonstrates grid layout on medium screens.
 * Shows optimal column layout for tablets.
 */
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
  args: {
    galleries: mockGalleries,
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * Many Galleries - tests performance with larger dataset.
 * Demonstrates grid layout with numerous gallery items.
 */
export const ManyGalleries: Story = {
  args: {
    galleries: [
      ...mockGalleries,
      ...mockGalleries.map((g, i) => ({
        ...g,
        id: `gallery-${i + 10}`,
        title: `${g.title} (Copy ${i + 1})`,
        featured: i % 3 === 0,
      })),
    ],
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * Few Categories - minimal category set.
 * Shows simplified filtering interface.
 */
export const FewCategories: Story = {
  args: {
    galleries: mockGalleries,
    categories: [
      { name: "All Photos", value: "all", count: 72 },
      { name: "Landscapes", value: "landscapes", count: 42 },
      { name: "Culture", value: "culture", count: 30 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

/**
 * With Dark Mode - demonstrates appearance in dark theme.
 * Ensures visual consistency across theme modes.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  args: {
    galleries: mockGalleries,
    categories: mockCategories,
  },
  decorators: [
    (Story) => (
      <div className="dark container mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};
