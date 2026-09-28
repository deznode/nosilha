"use client";

import { useMemo, useState } from "react";

import { foldAccents } from "@/features/contribute/lib/accent-fold";
import type { Town } from "@/types/town";

import { ResponsiveSheet } from "./responsive-sheet";

interface TownPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (town: Town) => void;
  onFreeText: () => void;
  towns: Town[];
  /** The field's own question, asked again as the picker's heading (P3). */
  label: string;
}

/**
 * The town search sheet/dialog (P3): a sheet on phones, a 460px dialog from
 * `md` up. Search filters by name and ignores accents, so "faja" finds
 * "Fajã d'Água". Spec 039.
 */
export function TownPicker({
  open,
  onClose,
  onSelect,
  onFreeText,
  towns,
  label,
}: TownPickerProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const folded = foldAccents(query.trim());
    if (!folded) return towns;
    return towns.filter((town) => foldAccents(town.name).includes(folded));
  }, [towns, query]);

  function handleClose() {
    setQuery("");
    onClose();
  }

  function handleSelect(town: Town) {
    setQuery("");
    onSelect(town);
  }

  function handleFreeText() {
    setQuery("");
    onFreeText();
  }

  return (
    <ResponsiveSheet
      open={open}
      onClose={handleClose}
      label={label}
      variant="picker"
    >
      <div className="flex flex-none items-baseline justify-between">
        <h2 className="text-body font-serif text-[23px] leading-[1.2] font-normal">
          {label}
        </h2>
        <button
          type="button"
          onClick={handleClose}
          className="focus-ring text-ocean-blue rounded-sm text-[14px] font-semibold"
        >
          Close
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Brava's towns"
        aria-label="Search Brava's towns"
        autoFocus
        className="bg-card text-body placeholder:text-muted border-ocean-blue h-11 w-full flex-none rounded-lg border-[1.5px] px-3 text-[15px] outline-none"
      />

      <div className="flex flex-col overflow-y-auto">
        {results.map((town) => (
          <button
            key={town.id}
            type="button"
            onClick={() => handleSelect(town)}
            className="border-hairline text-body flex min-h-12 items-center justify-between border-b text-left text-[15px]"
          >
            <span>{town.name}</span>
            <span className="text-muted text-[13px]">›</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleFreeText}
        className="focus-ring text-ocean-blue flex-none self-start rounded-sm py-1 text-[14px] font-semibold"
      >
        Describe it in my own words instead
      </button>
    </ResponsiveSheet>
  );
}
