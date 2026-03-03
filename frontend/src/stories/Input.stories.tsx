import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/catalyst-ui/input";

const meta = {
  title: "Catalyst UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password...",
  },
};
