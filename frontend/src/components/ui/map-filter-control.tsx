"use client";

import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { Field, Label } from "@/components/catalyst-ui/fieldset";

interface MapFilterControlProps {
  categories: string[];
  selectedCategories: string[];
  onFilterChange: (category: string, isChecked: boolean) => void;
}

export function MapFilterControl({
  categories,
  selectedCategories,
  onFilterChange,
}: MapFilterControlProps) {
  return (
    <div className="rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      <fieldset>
        <legend className="text-base font-semibold text-volcanic-gray-dark">
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
                // CORRECTED: The 'onChange' handler now directly receives the boolean 'checked' state.
                onChange={(checked) => onFilterChange(category, checked)}
                className="h-4 w-4 rounded border-gray-300 text-ocean-blue focus:ring-ocean-blue"
              />
              <Label
                htmlFor={category}
                className="ml-3 block text-sm font-medium leading-6 text-gray-900"
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
