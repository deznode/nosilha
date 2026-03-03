import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DirectoryEntryDetailPageContent,
  type DirectoryEntryDetailPageContentProps,
} from "@/components/pages/directory-entry-detail-page-content";
import { getMockEntryBySlug } from "@/lib/mock-api";

function createEntryArgs(slug: string): DirectoryEntryDetailPageContentProps {
  const entry = getMockEntryBySlug(slug);
  if (!entry) {
    throw new Error(`Unable to find mock entry for slug: ${slug}`);
  }

  return { entry };
}

const meta = {
  title: "Pages/EntryDetail",
  component: DirectoryEntryDetailPageContent,
  args: createEntryArgs("nos-raiz"),
} satisfies Meta<typeof DirectoryEntryDetailPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Restaurant: Story = {};

export const Hotel: Story = {
  args: createEntryArgs("djababas-eco-lodge"),
};

export const Landmark: Story = {
  args: createEntryArgs("igreja-nossa-senhora-do-monte"),
};

export const NotFound: Story = {
  name: "Not Found (Handled by Next.js)",
  render: () => (
    <div className="bg-background-secondary text-text-secondary flex h-full items-center justify-center p-10 text-center font-sans text-lg">
      Entry not found states are served through Next.js route-level 404 pages.
    </div>
  ),
};
