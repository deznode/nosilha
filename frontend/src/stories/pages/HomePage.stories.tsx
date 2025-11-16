import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HomePage from "@/app/(main)/page";
import { MockApiClient } from "@/lib/mock-api";
import { rest } from "msw";

const mockApi = new MockApiClient();

const meta = {
  title: "Pages/Home",
  component: HomePage,
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/v1/directory/entries", (req, res, ctx) => {
          return res(ctx.json(mockApi.getEntriesByCategory("all")));
        }),
      ],
    },
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
