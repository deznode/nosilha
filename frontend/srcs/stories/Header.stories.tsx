import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "@/components/ui/header";

const meta = {
  title: "UI/Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
