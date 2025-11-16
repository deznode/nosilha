import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DirectoryCategoryPage from "@/app/(main)/directory/[category]/page";
import { MockApiClient } from "@/lib/mock-api";
import { rest } from "msw";

const mockApi = new MockApiClient();

const meta = {
  title: "Pages/Directory",
  component: DirectoryCategoryPage,
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/v1/directory/entries", (req, res, ctx) => {
          const category = req.url.searchParams.get("category") || "all";
          return res(ctx.json(mockApi.getEntriesByCategory(category)));
        }),
      ],
    },
  },
} satisfies Meta<typeof DirectoryCategoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCategories: Story = {
  args: {
    params: { category: "all" },
  },
};

export const Restaurants: Story = {
  args: {
    params: { category: "Restaurant" },
  },
};

export const Hotels: Story = {
  args: {
    params: { category: "Hotel" },
  },
};

export const NoResults: Story = {
  args: {
    params: { category: "non-existent-category" },
  },
};
