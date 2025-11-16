import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DirectoryEntryDetailPage from "@/app/(main)/directory/entry/[slug]/page";
import { MockApiClient } from "@/lib/mock-api";
import { http, HttpResponse } from "msw";

const mockApi = new MockApiClient();

const meta = {
  title: "Pages/EntryDetail",
  component: DirectoryEntryDetailPage,
  parameters: {
    msw: {
      handlers: [
        http.get("/api/v1/directory/slug/:slug", ({ params }) => {
          const { slug } = params;
          return HttpResponse.json(
            mockApi.getEntryBySlug((slug as string) ?? "")
          );
        }),
      ],
    },
  },
} satisfies Meta<typeof DirectoryEntryDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Restaurant: Story = {
  args: {
    params: Promise.resolve({ slug: "nos-raiz" }),
  },
};

export const Hotel: Story = {
  args: {
    params: Promise.resolve({ slug: "djababas-eco-lodge" }),
  },
};

export const Landmark: Story = {
  args: {
    params: Promise.resolve({ slug: "igreja-nossa-senhora-do-monte" }),
  },
};

export const NotFound: Story = {
  args: {
    params: Promise.resolve({ slug: "not-found" }),
  },
};
