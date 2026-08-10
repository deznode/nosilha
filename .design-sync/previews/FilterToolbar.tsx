import { FilterToolbar } from "frontend";

/*
 * Brief §6 case 7 — dense controls with active and inactive states.
 * FilterToolbar is fully controlled, so each cell pins a different state
 * rather than relying on interaction.
 */

const TOWNS = ["Nova Sintra", "Fajã d'Água", "Nossa Senhora do Monte", "Furna"];

/* Passing `categories` is what renders the category row — the surface where a
   new palette's category scale (brief §4.1) actually has to work. */
const CATEGORIES = [
  "All",
  "Heritage",
  "Nature",
  "Beach",
  "Hotel",
  "Restaurant",
] as const;
const noop = () => {};

/** Resting state: no search, no category, everything at its default. */
export function Default() {
  return (
    <FilterToolbar
      searchTerm=""
      onSearchChange={noop}
      categories={[...CATEGORIES]}
      selectedCategory="All"
      onCategoryChange={noop}
      towns={TOWNS}
      selectedTown="All"
      onTownChange={noop}
      sortBy="name"
      onSortChange={noop}
      viewMode="grid"
      onViewModeChange={noop}
      resultCount={8}
    />
  );
}

/** Filters applied — the state that has to look visibly different from rest. */
export function Filtered() {
  return (
    <FilterToolbar
      searchTerm="tavares"
      onSearchChange={noop}
      categories={[...CATEGORIES]}
      selectedCategory="Heritage"
      onCategoryChange={noop}
      towns={TOWNS}
      selectedTown="Nova Sintra"
      onTownChange={noop}
      sortBy="rating"
      onSortChange={noop}
      viewMode="list"
      onViewModeChange={noop}
      resultCount={2}
    />
  );
}

/**
 * Zero results. With only 8 entries in the archive this is easy to reach, so
 * the count treatment matters more here than in a full catalogue.
 */
export function NoResults() {
  return (
    <FilterToolbar
      searchTerm="xxxxx"
      onSearchChange={noop}
      categories={[...CATEGORIES]}
      selectedCategory="Beach"
      onCategoryChange={noop}
      towns={TOWNS}
      selectedTown="Furna"
      onTownChange={noop}
      sortBy="name"
      onSortChange={noop}
      viewMode="grid"
      onViewModeChange={noop}
      resultCount={0}
    />
  );
}
