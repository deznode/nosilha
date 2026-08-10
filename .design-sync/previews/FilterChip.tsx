import { FilterChip } from "frontend";
import { MapPin, Landmark } from "lucide-react";

const noop = () => {};

/** Inactive and active side by side — the contrast is the whole component. */
export function ActiveAndInactive() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterChip label="Heritage" active />
      <FilterChip label="Nature" />
      <FilterChip label="Beach" />
      <FilterChip label="Hotel" />
    </div>
  );
}

/** With counts — how the directory shows how many entries a filter yields. */
export function WithCounts() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterChip label="Heritage" count={3} active />
      <FilterChip label="Nature" count={2} />
      <FilterChip label="Beach" count={1} />
      <FilterChip label="Restaurant" count={0} />
    </div>
  );
}

export function WithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterChip label="Nova Sintra" icon={<MapPin className="h-4 w-4" />} active />
      <FilterChip label="Heritage" icon={<Landmark className="h-4 w-4" />} />
    </div>
  );
}

/** The pink scheme, and the clearable variant. */
export function SchemesAndClearable() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterChip label="Ocean" colorScheme="ocean" active />
      <FilterChip label="Pink" colorScheme="pink" active />
      <FilterChip label="Nova Sintra" active onClear={noop} />
    </div>
  );
}
