import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RelatedContent } from "@/components/ui/related-content";

const meta = {
  title: "UI/RelatedContent",
  component: RelatedContent,
  tags: ["autodocs"],
} satisfies Meta<typeof RelatedContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    relatedEntries: [
      {
        slug: "related-entry-1",
        title: "Related Entry 1",
        category: "Category 1",
        imageUrl: "https://via.placeholder.com/300x200",
        town: { name: "Town 1" },
      },
      {
        slug: "related-entry-2",
        title: "Related Entry 2",
        category: "Category 2",
        imageUrl: "https://via.placeholder.com/300x200",
        town: { name: "Town 2" },
      },
      {
        slug: "related-entry-3",
        title: "Related Entry 3",
        category: "Category 3",
        imageUrl: "https://via.placeholder.com/300x200",
        town: { name: "Town 3" },
      },
    ],
  },
};
