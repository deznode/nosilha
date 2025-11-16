import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Banner from "@/components/ui/banner";

const meta = {
  title: "Nos Ilha/Banner",
  component: Banner,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLink: Story = {
  args: {
    title: "Tubarões Azuis: Mundial 2026!",
    message:
      "From Brockton to Brava, the Blue Sharks made history. Read the inside story.",
    linkUrl: "https://www.bbc.com/sport/football/articles/c04q0gd0yedo",
  },
};

export const WithoutLink: Story = {
  args: {
    title: "Community Spotlight",
    message:
      "Celebrate our storytellers, artists, and local historians preserving Brava.",
    linkUrl: undefined,
  },
};

export const Persistent: Story = {
  args: {
    title: "Heritage News",
    message: "Stay tuned for new oral histories being added next week.",
    showDismissButton: false,
  },
};
