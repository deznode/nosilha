import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DirectoryEntryDetailPage from "@/app/(main)/directory/entry/[slug]/page";
import { MockApiClient } from "@/lib/mock-api";
import { rest } from "msw";

const mockApi = new MockApiClient();

const meta = {
  title: "Pages/EntryDetail",
  component: DirectoryEntryDetailPage,
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/v1/directory/slug/:slug", (req, res, ctx) => {
          const { slug } = req.params;
          return res(ctx.json(mockApi.getEntryBySlug(slug as string)));
        }),
      ],
    },
  },
} satisfies Meta<typeof DirectoryEntryDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Restaurant: Story = {
  args: {
    params: { slug: "nos-raiz" },
  },
};

export const Hotel: Story = {
  args: {
    params: { slug: "djababas-eco-lodge" },
  },
};

export const Landmark: Story = {
  args: {
    params: { slug: "igreja-nossa-senhora-do-monte" },
  },
};

export const NotFound: Story = {
  args: {
    params: { slug: "not-found" },
  },
};
