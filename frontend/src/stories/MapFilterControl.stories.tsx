import { useEffect, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapFilterControl } from "@/components/ui/map-filter-control";
import { useFilterStore } from "@/stores/filterStore";
import userEvent from "@testing-library/user-event";

const defaultSelectedCategories = [
  ...useFilterStore.getState().selectedCategories,
];

const meta = {
  title: "Nos Ilha/MapFilterControl",
  component: MapFilterControl,
  args: {
    categories: ["Restaurant", "Hotel", "Beach", "Landmark"],
    __selectedCategories: defaultSelectedCategories,
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
    const appliedSelection = selected ?? defaultSelectedCategories;

    useFilterStore.setState((state) => ({
      ...state,
      selectedCategories: appliedSelection,
    }));

    return () => {
      useFilterStore.setState((state) => ({
        ...state,
        selectedCategories: defaultSelectedCategories,
      }));
    };
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
    const assertState = (condition: boolean, message: string) => {
      if (!condition) {
        throw new Error(message);
      }
    };

    const initialMatch =
      JSON.stringify(useFilterStore.getState().selectedCategories) ===
      JSON.stringify(defaultSelectedCategories);
    assertState(
      initialMatch,
      "Initial selectedCategories should match defaults"
    );

    const user = userEvent.setup();

    await user.tab(); // focus first checkbox
    await user.keyboard(" "); // toggle off
    assertState(
      JSON.stringify(useFilterStore.getState().selectedCategories) !==
        JSON.stringify(defaultSelectedCategories),
      "Toggling should change selectedCategories"
    );

    await user.keyboard(" "); // toggle back on
    const resetMatch =
      JSON.stringify(useFilterStore.getState().selectedCategories) ===
      JSON.stringify(defaultSelectedCategories);
    assertState(
      resetMatch,
      "Second toggle should restore default selectedCategories"
    );

    await user.tab();
    await user.tab();
  },
};
