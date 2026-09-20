import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  MapLegend,
  PhotographsNote,
} from "@/features/map/components/map-legend";
import {
  recordItems,
  settlementItems,
  statusCounts,
} from "@/features/map/data/locations-adapter";
import { legendRows } from "@/features/map/data/map-copy";
import type { DirectoryEntry } from "@/types/directory";
import type { TownStatusSummary } from "@/types/town";

function rows() {
  return within(
    screen.getByRole("list", { name: "Pin colour key" })
  ).getAllByRole("listitem");
}

function dotColours() {
  return rows().map(
    (row) =>
      (row.querySelector("[data-legend-dot]") as HTMLElement).style.background
  );
}

function town(slug: string, status: TownStatusSummary["status"]) {
  return {
    id: slug,
    slug,
    name: slug,
    description: "",
    latitude: 14.86,
    longitude: -24.7,
    entryCount: status === "NAME_ONLY" ? 0 : 1,
    hasPhotograph: status === "DOCUMENTED",
    status,
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
  } satisfies TownStatusSummary;
}

function entry(slug: string, imageUrl: string | null) {
  return {
    id: slug,
    slug,
    name: slug,
    category: "Heritage",
    imageUrl,
    town: "Nova Sintra",
    townId: "nova",
    latitude: 14.86,
    longitude: -24.7,
    description: "",
    tags: [],
  } as unknown as DirectoryEntry;
}

describe("MapLegend", () => {
  it("keys settlements by the status table, with live counts", () => {
    const items = settlementItems([
      town("a", "DOCUMENTED"),
      town("b", "PARTIAL"),
      town("c", "NAME_ONLY"),
      town("d", "NAME_ONLY"),
    ]);
    render(
      <MapLegend
        rows={legendRows("settlements", statusCounts(items), [], 0)}
        bottom={14}
      />
    );

    expect(rows().map((row) => row.textContent)).toEqual([
      "documented 1",
      "records, no photograph 1",
      "name only 2",
    ]);
  });

  it("colours each key from the token its pins read, not a resolved hex", () => {
    render(
      <MapLegend
        rows={legendRows(
          "settlements",
          { documented: 0, partial: 0, name: 0 },
          [],
          0
        )}
        bottom={14}
      />
    );
    expect(dotColours()).toEqual([
      "var(--brand-valley-green)",
      "var(--brand-ocean-blue)",
      "var(--brand-sobrado-ochre)",
    ]);
  });

  it("agrees with the adapter about records, zero name-only included", () => {
    // Built through the adapter, so the legend fails if the two ever disagree about
    // what state a record is in.
    const items = recordItems(
      [
        entry("igreja", "https://r2.example/igreja.jpg"),
        entry("nos-raiz", null),
        entry("furna-pools", null),
      ],
      { nova: "nova-sintra" }
    );
    render(
      <MapLegend
        rows={legendRows("records", statusCounts(items), [], 0)}
        bottom={14}
      />
    );

    expect(rows().map((row) => row.textContent)).toEqual([
      "documented 1",
      "records, no photograph 2",
      "name only 0",
    ]);
  });

  it("sits at the offset it is given", () => {
    render(<MapLegend rows={[]} bottom={146} />);
    expect(
      screen.getByRole("list", { name: "Pin colour key" }).style.bottom
    ).toBe("146px");
  });
});

describe("PhotographsNote", () => {
  it("states the count and links to the no-place tray", () => {
    render(
      <PhotographsNote
        note="Six photographs carry no coordinates and cannot appear here."
        bottom={62}
      />
    );

    expect(
      screen.getByText(
        "Six photographs carry no coordinates and cannot appear here."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the no-place tray" })
    ).toHaveAttribute("href", "/photographs?filter=noplace");
  });
});
