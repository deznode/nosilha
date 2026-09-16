import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MapPin } from "lucide-react";
import { MapLegend } from "@/features/map/components/map-legend";
import {
  STATUS_PIN_COLOR,
  transformEntries,
} from "@/features/map/data/locations-adapter";
import type { Location } from "@/features/map/data/types";
import type { DocumentationStatus } from "@/lib/status";
import type { DirectoryEntry } from "@/types/directory";

function loc(id: string, status: DocumentationStatus): Location {
  return {
    id,
    name: id,
    namePortuguese: id,
    category: "Town",
    description: "",
    coordinates: { lat: 14.86, lng: -24.7 },
    elevation: 0,
    tags: [],
    icon: MapPin,
    color: STATUS_PIN_COLOR[status],
    status: { status, label: status },
  };
}

function rows() {
  return within(
    screen.getByRole("list", { name: "Pin colour key" })
  ).getAllByRole("listitem");
}

function expectRows(expected: [string, string][]) {
  const found = rows();
  expect(found).toHaveLength(expected.length);
  expected.forEach(([label, count], i) => {
    expect(within(found[i]).getByText(label)).toBeInTheDocument();
    expect(within(found[i]).getByText(count)).toBeInTheDocument();
  });
}

describe("MapLegend", () => {
  it("keys settlements by documentation status, with live counts", () => {
    render(
      <MapLegend
        mode="settlements"
        locations={[
          loc("a", "documented"),
          loc("b", "partial"),
          loc("c", "name"),
          loc("d", "name"),
        ]}
      />
    );

    expectRows([
      ["documented", "1 settlement"],
      ["records, no photograph", "1 settlement"],
      ["name only", "2 settlements"],
    ]);
  });

  it("keys place records by whether they carry a photograph", () => {
    // Built through the adapter, not hand-stamped with a status: the legend's job is
    // to explain the pins the adapter produces, and a fixture that invents its own
    // status stays green against a key production can no longer emit.
    const entry = (id: string, imageUrl: string | null): DirectoryEntry =>
      ({
        id,
        slug: id,
        name: id,
        category: "Heritage",
        imageUrl,
        town: "Nova Sintra",
        latitude: 14.86,
        longitude: -24.7,
        description: "",
        rating: null,
        reviewCount: 0,
        createdAt: "",
        updatedAt: "",
        tags: [],
        details: null,
      }) as DirectoryEntry;

    render(
      <MapLegend
        mode="places"
        locations={transformEntries([
          entry("a", "/images/igreja.jpg"),
          entry("b", null),
          entry("c", null),
        ])}
      />
    );

    expectRows([
      ["has a photograph", "1 record"],
      ["no photograph", "2 records"],
    ]);
  });

  it("states a zero count rather than hiding the key", () => {
    render(<MapLegend mode="settlements" locations={[]} />);

    expectRows([
      ["documented", "0 settlements"],
      ["records, no photograph", "0 settlements"],
      ["name only", "0 settlements"],
    ]);
  });

  it("paints each key dot with the colour its pins use", () => {
    render(<MapLegend mode="settlements" locations={[]} />);

    const dots = rows().map((row) => row.querySelector("[data-legend-dot]"));
    expect(dots[0]).toHaveStyle({
      backgroundColor: STATUS_PIN_COLOR.documented,
    });
    expect(dots[1]).toHaveStyle({ backgroundColor: STATUS_PIN_COLOR.partial });
    expect(dots[2]).toHaveStyle({ backgroundColor: STATUS_PIN_COLOR.name });
  });
});
