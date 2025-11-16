import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "@/components/ui/footer";

const meta = {
  title: "Nos Ilha/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site-wide footer referencing navigation groupings defined by the design system (see docs/DESIGN_SYSTEM.md).",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
