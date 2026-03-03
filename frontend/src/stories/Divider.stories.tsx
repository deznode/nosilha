import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Divider } from "@/components/catalyst-ui/divider";

const meta = {
  title: "Catalyst UI/Divider",
  component: Divider,
  tags: ["autodocs"],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
