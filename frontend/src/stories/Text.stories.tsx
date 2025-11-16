import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text } from "@/components/catalyst-ui/text";

const meta = {
  title: "Catalyst UI/Text",
  component: Text,
  tags: ["autodocs"],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a paragraph of text.",
  },
};
