import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageGallery } from "@/components/ui/image-gallery";

const meta = {
  title: "UI/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [
      {
        src: "https://via.placeholder.com/600x400",
        alt: "Placeholder Image 1",
        courtesy: "Placeholder Courtesy 1",
      },
      {
        src: "https://via.placeholder.com/600x400",
        alt: "Placeholder Image 2",
        courtesy: "Placeholder Courtesy 2",
      },
      {
        src: "https://via.placeholder.com/600x400",
        alt: "Placeholder Image 3",
        courtesy: "Placeholder Courtesy 3",
      },
    ],
  },
};
