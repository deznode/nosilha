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
                // CORRECTED: The 'onChange' handler now directly receives the boolean 'checked' state.
                onChange={(checked) => onFilterChange(category, checked)}
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
