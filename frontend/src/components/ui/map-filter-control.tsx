"use client";

import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import { useSelectedCategories, useFilterStore } from "@/stores/filterStore";

interface MapFilterControlProps {
  categories: string[];
}

/**
 * MapFilterControl component for filtering map markers by category.
 * Uses Zustand filterStore for state management (eliminates prop drilling).
 *
 * Phase 2 Migration (T051): Migrated from prop drilling to filterStore.
 */
export function MapFilterControl({ categories }: MapFilterControlProps) {
  const selectedCategories = useSelectedCategories();
  const toggleCategory = useFilterStore((state) => state.toggleCategory);

  return (
    <div className="bg-background-primary/80 border-border-primary rounded-lg border p-4 shadow-lg backdrop-blur-sm">
      <fieldset>
        <legend className="text-text-primary text-base font-semibold">
          Filter by Category
        </legend>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <Field key={category} className="flex items-center">
              <Checkbox
                id={category}
                name="category-filter"
                value={category}
                checked={selectedCategories.includes(category)}
                onChange={(checked) => toggleCategory(category, checked)}
                className="border-border-primary text-ocean-blue focus:ring-ocean-blue h-4 w-4 rounded"
              />
              <Label
                htmlFor={category}
                className="text-text-primary ml-3 block text-sm leading-6 font-medium"
              >
                {category}
              </Label>
            </Field>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
