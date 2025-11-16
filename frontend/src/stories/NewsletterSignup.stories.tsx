import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NewsletterSignup from "@/components/ui/newsletter";

/**
 * NewsletterSignup invites locals and diaspora supporters to stay
 * informed about cultural events, community programs, and new
 * additions to the Nos Ilha directory.
 */
const meta = {
  title: "Nos Ilha/NewsletterSignup",
  component: NewsletterSignup,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "gradient",
      values: [{ name: "gradient", value: "#0b2144" }],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background-primary">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof NewsletterSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
