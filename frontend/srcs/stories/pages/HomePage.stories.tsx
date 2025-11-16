import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HomePage from "@/app/(main)/page";
import { handlers } from "@/lib/__test_mocks__/handlers";

const meta = {
  title: "Pages/Home",
  component: HomePage,
  parameters: {
    msw: {
      handlers: handlers,
    },
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
