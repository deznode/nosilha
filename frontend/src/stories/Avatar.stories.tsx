import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "@/components/catalyst-ui/avatar";

const meta = {
  title: "Catalyst UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    initials: { control: "text" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://via.placeholder.com/150",
    alt: "User Avatar",
  },
};

export const WithInitials: Story = {
  args: {
    initials: "NI",
  },
};

export const Large: Story = {
  args: {
    src: "https://via.placeholder.com/150",
    alt: "User Avatar",
    className: "h-24 w-24",
  },
};

export const Rounded: Story = {
  args: {
    src: "https://via.placeholder.com/150",
    alt: "User Avatar",
    className: "rounded-lg",
  },
};
