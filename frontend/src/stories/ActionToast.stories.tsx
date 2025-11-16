import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActionToast } from "@/components/ui/action-toast";

/**
 * ActionToast surfaces quick success/error feedback for toolbar
 * interactions like sharing, saving, or reporting cultural content.
 */
const meta = {
  title: "Nos Ilha/ActionToast",
  component: ActionToast,
  args: {
    show: true,
    message: "Link copied to your clipboard",
    variant: "success",
  },
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f172a" },
        { name: "light", value: "#f8fafc" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["success", "error"],
      description: "Visual treatment for status messaging",
    },
    show: {
      control: "boolean",
      description: "Toggle visibility of the toast",
    },
    message: {
      control: "text",
      description: "Copy that appears within the notification",
    },
  },
} satisfies Meta<typeof ActionToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Error: Story = {
  args: {
    variant: "error",
    message: "We couldn't submit your reaction. Please try again.",
  },
};

export const Hidden: Story = {
  args: {
    show: false,
  },
};
