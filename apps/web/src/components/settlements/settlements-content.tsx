"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FilterChip } from "@/components/ui/filter-chip";
import type { TownStatusSummary } from "@/types/town";

import { SettlementCard } from "./settlement-card";
import {
  SETTLEMENT_FILTERS,
  filterSettlements,
  parseSettlementFilter,
  settlementChipCounts,
  settlementStandfirst,
  type SettlementFilterKey,
} from "./settlements-copy";

/**
 * The settlements index. Spec 034 FR-007.
 *
 * The filter lives in `?filter=` so a view of the empty settlements is a link someone
 * can send. The chips write it with `replace`, not `push`: flipping a filter is not a
 * place in history, and Back should leave the screen rather than walk the chips.
 *
 * The URL is read, not mirrored into state. Navigating to the same route with
 * different params does not remount this component — and under `cacheComponents` a
 * hidden route is kept alive rather than unmounted — so a copy in `useState` would
 * stay on the old filter while the address bar showed the new one. `initialFilter` is
 * only the server's first paint, before `useSearchParams` has anything to read.
 */
export function SettlementsContent({
  towns,
  initialFilter,
}: {
  towns: TownStatusSummary[];
  initialFilter: SettlementFilterKey;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const filter = params.has("filter")
    ? parseSettlementFilter(params.get("filter") ?? undefined)
    : initialFilter;

  const counts = settlementChipCounts(towns);
  const visible = filterSettlements(towns, filter);

  function choose(next: SettlementFilterKey) {
    router.replace(
      next === "all" ? "/settlements" : `/settlements?filter=${next}`,
      {
        scroll: false,
      }
    );
  }

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "40px 22px 80px",
      }}
    >
      <h1
        className="font-serif"
        style={{
          fontWeight: 400,
          fontSize: "46px",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}
      >
        Settlements
      </h1>
      <p
        style={{
          margin: "0 0 26px",
          color: "var(--foreground-secondary)",
          fontSize: "15px",
          maxWidth: "620px",
          lineHeight: 1.55,
        }}
      >
        {settlementStandfirst(towns)}
      </p>

      <div
        className="flex flex-wrap gap-2 border-b"
        style={{
          paddingBottom: "18px",
          borderBottomColor: "var(--border-subtle)",
          marginBottom: "24px",
        }}
      >
        {SETTLEMENT_FILTERS.map((chip) => (
          <FilterChip
            key={chip.key}
            label={chip.label}
            count={counts[chip.key]}
            // Zero is the answer on an archive this sparse, so the chip shows it
            // rather than looking like a chip whose count failed to load.
            showZero
            active={filter === chip.key}
            onClick={() => choose(chip.key)}
          />
        ))}
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
        }}
      >
        {visible.map((town) => (
          <SettlementCard key={town.slug} town={town} />
        ))}
      </div>
    </div>
  );
}
