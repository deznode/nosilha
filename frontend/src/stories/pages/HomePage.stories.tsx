import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  HomePageContent,
  type HomePageContentProps,
} from "@/components/pages/home-page-content";
import { getMockEntriesByCategory } from "@/lib/mock-api";

const meta = {
  title: "Pages/Home",
  component: HomePageContent,
  args: createHomePageArgs(),
} satisfies Meta<typeof HomePageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function createHomePageArgs(): HomePageContentProps {
  return {
    featuredEntries: getMockEntriesByCategory("all"),
  };
}
