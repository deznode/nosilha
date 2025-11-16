import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/catalyst-ui/badge";

const meta = {
  title: "Catalyst UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"],
    },
    className: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Red: Story = {
  args: {
    children: "Badge",
    color: "red",
  },
};

export const Green: Story = {
  args: {
    children: "Badge",
    color: "green",
  },
};

export const Blue: Story = {
  args: {
    children: "Badge",
    color: "blue",
  },
};

export const Large: Story = {
  args: {
    children: "Badge",
    className: "text-lg",
  },
};
