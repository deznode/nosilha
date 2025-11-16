import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageGallery } from "@/components/ui/image-gallery";

const sampleImages = [
  "/images/history/brava-maritime.jpg",
  "/images/history/whaling-heritage.jpg",
  "/images/history/brava-culture.webp",
];

/**
 * ImageGallery showcases visitor contributed photography using
 * responsive square tiles. It appears on town pages, directory
 * entries, and media highlights to celebrate Brava landscapes.
 */
const meta = {
  title: "Nos Ilha/ImageGallery",
  component: ImageGallery,
  args: {
    imageUrls: sampleImages,
  },
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    imageUrls: {
      control: { type: "object" },
      description: "Array of photo URLs rendered in the grid",
    },
  },
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyState: Story = {
  args: {
    imageUrls: [],
  },
};

export const ExtendedGallery: Story = {
  args: {
    imageUrls: [
      ...sampleImages,
      "/images/history/whaling-heritage2.jpg",
      "/images/about/community-collaboration.jpg",
      "/images/history/whaling-heritage3.jpg",
    ],
  },
};
