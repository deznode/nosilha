import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DirectoryCategoryPageContent,
  type DirectoryCategoryPageContentProps,
} from "@/components/pages/directory-category-page-content";
import { getMockEntriesByCategory } from "@/lib/mock-api";

function createDirectoryArgs(
  category: string
): DirectoryCategoryPageContentProps {
  return {
    category,
    entries: getMockEntriesByCategory(category),
  };
}

const meta = {
  title: "Pages/Directory",
  component: DirectoryCategoryPageContent,
  args: createDirectoryArgs("all"),
} satisfies Meta<typeof DirectoryCategoryPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCategories: Story = {};

export const Restaurants: Story = {
  args: createDirectoryArgs("Restaurant"),
};

export const Hotels: Story = {
  args: createDirectoryArgs("Hotel"),
};

export const NoResults: Story = {
  args: {
    category: "non-existent-category",
    entries: [],
  },
};
