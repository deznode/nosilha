import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NewsletterSignup from "@/components/ui/newsletter";

const meta = {
  title: "Nos Ilha/NewsletterSignup",
  component: NewsletterSignup,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Gradient-rich newsletter CTA that uses semantic tokens from docs/DESIGN_SYSTEM.md.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NewsletterSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
