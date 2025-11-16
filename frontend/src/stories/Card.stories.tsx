import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a card.",
  },
};
