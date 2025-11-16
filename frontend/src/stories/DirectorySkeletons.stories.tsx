import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DirectoryCardSkeleton } from "@/components/ui/directory-card-skeleton";
import { DirectoryGridSkeleton } from "@/components/ui/directory-grid-skeleton";

const meta = {
  title: "Nos Ilha/Directory Skeletons",
  component: DirectoryCardSkeleton,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof DirectoryCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardLightMode: Story = {};

export const CardDarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark" data-theme="dark">
        <div className="bg-gray-900 p-6">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const GridLoading: Story = {
  render: () => <DirectoryGridSkeleton count={6} />,
};

export const GridDarkTheme: Story = {
  render: () => <DirectoryGridSkeleton count={4} className="mt-0" />,
  decorators: [
    (Story) => (
      <div className="dark" data-theme="dark">
        <div className="bg-gray-950 p-8">
          <Story />
        </div>
      </div>
    ),
  ],
};
