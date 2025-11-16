import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BackToTopButton } from "@/components/ui/back-to-top-button";

/**
 * BackToTopButton encourages long-read visitors to return to the
 * beginning of a page with smooth scrolling that mirrors the
 * experience on our editorial stories.
 */
const meta = {
  title: "Nos Ilha/BackToTopButton",
  component: BackToTopButton,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="bg-background-secondary text-text-primary flex min-h-[120vh] flex-col gap-4 p-6">
        <div className="max-w-2xl space-y-4">
          {[...Array(6)].map((_, index) => (
            <p key={index} className="text-base leading-7 text-gray-600">
              Nos Ilha documents stories from Nova Sintra to Fajã d'Água, mixing
              oral history with modern travel tips. Scroll to the bottom of this
              preview to trigger the button interaction.
            </p>
          ))}
        </div>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof BackToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
