import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RelatedContent } from "@/components/ui/related-content";
import type { DirectoryEntry } from "@/types/directory";

const meta = {
  title: "UI/RelatedContent",
  component: RelatedContent,
  tags: ["autodocs"],
} satisfies Meta<typeof RelatedContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = "2024-11-16T00:00:00.000Z";
const relatedEntries: DirectoryEntry[] = [
  {
    id: "entry-1",
    slug: "morabeza-grill",
    name: "Morabeza Grill",
    category: "Restaurant",
    imageUrl: "/images/history/brava-maritime.jpg",
    town: "Nova Sintra",
    latitude: 0,
    longitude: 0,
    description:
      "Family-run grill known for fresh catch, live morna nights, and valley views.",
    rating: 4.8,
    reviewCount: 128,
    createdAt: now,
    updatedAt: now,
    tags: ["seafood", "live-music"],
    details: {
      phoneNumber: "+238 999-1111",
      openingHours: "11:00 - 23:00",
      cuisine: ["Seafood", "Cape Verdean"],
    },
  },
  {
    id: "entry-2",
    slug: "nossa-senhora-do-monte",
    name: "Nossa Senhora do Monte",
    category: "Landmark",
    imageUrl: "/images/history/brava-culture.webp",
    town: "Nova Sintra",
    latitude: 0,
    longitude: 0,
    description:
      "Hilltop church overlooking Brava's lush valleys, beloved by pilgrims.",
    rating: 4.9,
    reviewCount: 256,
    createdAt: now,
    updatedAt: now,
    tags: ["heritage", "architecture"],
    details: null,
  },
  {
    id: "entry-3",
    slug: "faja-dagua-bay",
    name: "Fajã d'Água Bay",
    category: "Beach",
    imageUrl: "/images/history/whaling-heritage.jpg",
    town: "Fajã d'Água",
    latitude: 0,
    longitude: 0,
    description:
      "Calm turquoise bay with fishing boats, tidal pools, and dramatic cliffs.",
    rating: 4.7,
    reviewCount: 310,
    createdAt: now,
    updatedAt: now,
    tags: ["beach", "snorkeling"],
    details: null,
  },
];

export const Default: Story = {
  args: {
    contentId: "story-content-id",
    relatedEntries,
  },
};
