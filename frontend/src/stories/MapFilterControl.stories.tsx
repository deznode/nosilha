import { useEffect, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapFilterControl } from "@/components/ui/map-filter-control";
import { useFilterStore } from "@/stores/filterStore";
import { userEvent } from "@storybook/test";

const meta = {
  title: "Nos Ilha/MapFilterControl",
  component: MapFilterControl,
  args: {
    categories: ["Restaurant", "Hotel", "Beach", "Landmark"],
  },
  decorators: [
    (Story, context) => (
      <FilterStateProvider selected={context.args.__selectedCategories}>
        <div className="max-w-sm">
          <Story />
        </div>
      </FilterStateProvider>
    ),
  ],
  argTypes: {
    __selectedCategories: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof MapFilterControl>;

export default meta;
type Story = StoryObj<typeof meta>;

type FilterStateProviderProps = {
  selected?: string[];
  children: ReactNode;
};

function FilterStateProvider({ selected, children }: FilterStateProviderProps) {
  useEffect(() => {
    if (selected) {
      useFilterStore.setState((state) => ({
        ...state,
        selectedCategories: selected,
      }));
    }
  }, [selected]);

  return children;
}

export const Default: Story = {};

export const BeachesOnly: Story = {
  args: {
    __selectedCategories: ["Beach"],
  },
};

export const KeyboardNavigation: Story = {
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await userEvent.tab();
  },
};
