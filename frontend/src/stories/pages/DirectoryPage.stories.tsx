import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DirectoryCategoryPage from "@/app/(main)/directory/[category]/page";
import { MockApiClient } from "@/lib/mock-api";
import { http, HttpResponse } from "msw";

const mockApi = new MockApiClient();

const meta = {
  title: "Pages/Directory",
  component: DirectoryCategoryPage,
  parameters: {
    msw: {
      handlers: [
        http.get("/api/v1/directory/entries", ({ request }) => {
          const url = new URL(request.url);
          const category = url.searchParams.get("category") || "all";
          return HttpResponse.json(mockApi.getEntriesByCategory(category));
        }),
      ],
    },
  },
} satisfies Meta<typeof DirectoryCategoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCategories: Story = {
  args: {
    params: Promise.resolve({ category: "all" }),
  },
};

export const Restaurants: Story = {
  args: {
    params: Promise.resolve({ category: "Restaurant" }),
  },
};

export const Hotels: Story = {
  args: {
    params: Promise.resolve({ category: "Hotel" }),
  },
};

export const NoResults: Story = {
  args: {
    params: Promise.resolve({ category: "non-existent-category" }),
  },
};
