import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Banner from "@/components/ui/banner";
import { fn } from "@storybook/test";

/**
 * Banner is used across the site to highlight cultural campaigns,
 * match announcements, or community updates with a subtle gradient
 * background that reflects the Nos Ilha palette.
 */
const meta = {
  title: "Nos Ilha/Banner",
  component: Banner,
  args: {
    title: "Brava Women's Cup",
    message:
      "Cheer on our local athletes during the island-wide finals this Saturday.",
    linkUrl: "https://nosilha.org/events/brava-womens-cup",
    onDismiss: fn(),
  },
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Bold headline that leads the announcement",
    },
    message: {
      control: "text",
      description: "Supporting text that provides context",
    },
    linkUrl: {
      control: "text",
      description: "Optional URL for more details",
    },
    showDismissButton: {
      control: "boolean",
      description: "Toggle the close button visibility",
    },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLink: Story = {
  args: {
    linkUrl: undefined,
    message:
      "The Fajã d'Água waterfront cleanup happens this weekend. Volunteers welcome!",
  },
};

export const Persistent: Story = {
  args: {
    showDismissButton: false,
    message:
      "Our oral history archive is open for submissions—share family stories and traditions with the community.",
  },
};

export const TourismAlert: Story = {
  args: {
    title: "Travel Advisory",
    message:
      "New ferry times between Praia and Brava are now live for the summer travel season.",
    linkUrl: "https://nosilha.org/travel",
  },
};

export const HighContrast: Story = {
  args: {
    title: "Accessibility Update",
    message:
      "Map navigation now supports screen readers and high contrast tiles for all visitors.",
    linkUrl: "https://nosilha.org/accessibility",
    tone: "high-contrast",
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-4">
        <Story />
      </div>
    ),
  ],
};
