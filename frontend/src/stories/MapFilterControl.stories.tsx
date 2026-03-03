import { useEffect, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapFilterControl } from "@/components/ui/map-filter-control";
import { useFilterStore } from "@/stores/filterStore";
import { userEvent } from "@storybook/testing-library";

const defaultSelectedCategories = [
  ...useFilterStore.getState().selectedCategories,
];

const meta = {
  title: "Nos Ilha/MapFilterControl",
  component: MapFilterControl,
  args: {
    categories: ["Restaurant", "Hotel", "Beach", "Landmark"],
  },
  decorators: [
    (Story, context) => (
      <FilterStateProvider selected={context.parameters.__selectedCategories}>
        <div className="max-w-sm">
          <Story />
        </div>
      </FilterStateProvider>
    ),
  ],
  parameters: {
    __selectedCategories: defaultSelectedCategories,
  },
} satisfies Meta<typeof MapFilterControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function FilterStateProvider({
  selected,
  children,
}: {
  selected?: string[];
  children: ReactNode;
}) {
  useEffect(() => {
    const appliedSelection =
      (selected as string[] | undefined) ?? defaultSelectedCategories;

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
  parameters: {
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

    const user = await userEvent.setup();

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
