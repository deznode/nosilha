import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "@/components/catalyst-ui/link";

const meta = {
  title: "Catalyst UI/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "#",
    children: "This is a link",
  },
};
