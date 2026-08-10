import { FilterBottomSheet, FilterChip } from "frontend";

const noop = () => {};

/**
 * Brief §6 case 7 — the mobile filter sheet in its open state.
 *
 * Rendered open because a closed sheet is an empty card. Uses cardMode
 * "single" with a tall viewport (see cfg.overrides) so the panel renders
 * inside the card instead of escaping it.
 */
export function Open() {
  return (
    /*
     * The sheet is `fixed inset-0` with the panel `absolute bottom-0` inside
     * it. The preview card's own root is already a containing block for fixed
     * positioning AND has zero height, so without a wrapper the panel resolves
     * against a 0px box and lands above the viewport — the card captures as a
     * sliver.
     *
     * translateZ(0) makes this wrapper the containing block instead, so
     * inset-0 resolves to its 820px box and the sheet sits at the bottom the
     * way it does on a phone.
     */
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 820, transform: "translateZ(0)" }}
    >
      <FilterBottomSheet
      isOpen
      onClose={noop}
      title="Filter places"
      activeCount={2}
      onApply={noop}
      onClear={noop}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-body mb-3 text-sm font-semibold">Category</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Heritage" count={3} active />
            <FilterChip label="Nature" count={2} />
            <FilterChip label="Beach" count={1} />
            <FilterChip label="Hotel" count={3} />
            <FilterChip label="Restaurant" count={1} active />
          </div>
        </div>
        <div>
          <p className="text-body mb-3 text-sm font-semibold">Town</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Nova Sintra" count={5} />
            <FilterChip label="Fajã d'Água" count={2} />
            <FilterChip label="Nossa Senhora do Monte" count={1} />
          </div>
        </div>
      </div>
      </FilterBottomSheet>
    </div>
  );
}
