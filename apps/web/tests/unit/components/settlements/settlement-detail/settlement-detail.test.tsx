import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettlementDetail } from "@/components/settlements/settlement-detail/settlement-detail";
import { useIdentifyStore } from "@/stores/identifyStore";
import type { DirectoryEntry } from "@/types/directory";
import type { Town, TownStatusSummary } from "@/types/town";

vi.mock("@/features/map/components/mini-map", () => ({
  MiniMap: ({
    lat,
    lng,
    status,
  }: {
    lat: number;
    lng: number;
    status: string;
  }) => (
    <div
      data-testid="mini-map"
      data-lat={lat}
      data-lng={lng}
      data-status={status}
    />
  ),
}));

function summary(
  overrides: Partial<TownStatusSummary> = {}
): TownStatusSummary {
  return {
    id: "town-uuid",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
    entryCount: 2,
    hasPhotograph: false,
    status: "PARTIAL",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 3,
    ...overrides,
  };
}

function town(overrides: Partial<Town> = {}): Town {
  return {
    id: "town-uuid",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
    population: null,
    elevation: null,
    founded: null,
    highlights: [],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

function entry(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "e1",
    slug: "praca-eugenio-tavares",
    name: "Praça Eugénio Tavares",
    category: "Heritage",
    imageUrl: null,
    town: "Nova Sintra",
    latitude: 14.8632,
    longitude: -24.7183,
    description: "",
    rating: null,
    reviewCount: 0,
    createdAt: "",
    updatedAt: "",
    tags: [],
    details: null,
    ...overrides,
  } as DirectoryEntry;
}

const ENTRIES = [
  entry(),
  entry({
    id: "e2",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Church",
    imageUrl: "https://cdn.example/igreja.jpg",
  }),
];

/** Spec 034 T-27 / FR-008 — one settlement, with its gaps named. */
describe("SettlementDetail", () => {
  beforeEach(() => {
    useIdentifyStore.setState({ context: null });
  });

  it("heads the page and links back to the index", () => {
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Nova Sintra" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← All settlements" })
    ).toHaveAttribute("href", "/settlements");
    expect(
      screen.getByText("Two place records · no photograph of the town itself")
    ).toBeInTheDocument();
  });

  it("names the unconfirmed photographs and links them to the region filter", () => {
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    expect(screen.getByText("Photographs of Nova Sintra")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "None yet" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "See the three unconfirmed photographs",
      })
    ).toHaveAttribute("href", "/photographs?region=nova-sintra");
  });

  it("hides the unconfirmed action when there are none", () => {
    render(
      <SettlementDetail
        town={town()}
        summary={summary({ unconfirmedPhotographCount: 0 })}
        entries={ENTRIES}
      />
    );

    expect(
      screen.queryByRole("link", { name: /unconfirmed/ })
    ).not.toBeInTheDocument();
  });

  it("opens the identify sheet for a photograph of the town", async () => {
    const user = userEvent.setup();
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    await user.click(
      screen.getByRole("button", { name: "Give a photograph of Nova Sintra" })
    );

    expect(useIdentifyStore.getState().context).toEqual({
      contentType: "town",
      contentId: "town-uuid",
      field: "photograph",
      pageTitle: "Nova Sintra",
    });
  });

  it("asks each missing field with the town as the subject", async () => {
    const user = userEvent.setup();
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    await user.click(
      screen.getByRole("button", { name: "How high above the sea is it?" })
    );

    expect(useIdentifyStore.getState().context).toMatchObject({
      contentType: "town",
      contentId: "town-uuid",
      field: "elevation",
    });
  });

  it("drops the Not recorded panel once every field is recorded", () => {
    render(
      <SettlementDetail
        town={town({ founded: "1573", highlights: ["The praça"] })}
        summary={summary({ population: "1,069", elevation: "530m" })}
        entries={ENTRIES}
      />
    );

    expect(screen.queryByText("Not recorded")).not.toBeInTheDocument();
  });

  it("lists each record with its category and marks the ones with no photograph", () => {
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    const row = screen.getByRole("link", { name: /Praça Eugénio Tavares/ });
    expect(row).toHaveAttribute("href", "/nova-sintra/praca-eugenio-tavares");
    expect(within(row).getByText("Heritage")).toBeInTheDocument();
    expect(within(row).getByText("no photograph")).toBeInTheDocument();

    const documented = screen.getByRole("link", { name: /Igreja/ });
    expect(
      within(documented).queryByText("no photograph")
    ).not.toBeInTheDocument();
  });

  it("drops the Recorded here section when the settlement holds nothing", () => {
    render(
      <SettlementDetail
        town={town()}
        summary={summary({ entryCount: 0, unconfirmedPhotographCount: 0 })}
        entries={[]}
      />
    );

    expect(screen.queryByText("Recorded here")).not.toBeInTheDocument();
  });

  it("locates the settlement and offers the full map", () => {
    render(
      <SettlementDetail town={town()} summary={summary()} entries={ENTRIES} />
    );

    const map = screen.getByTestId("mini-map");
    expect(map).toHaveAttribute("data-status", "partial");
    expect(map).toHaveAttribute("data-lat", "14.8632");
    expect(screen.getByText("14.8632, −24.7183")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open in the map explorer" })
    ).toHaveAttribute("href", "/map?mode=settlements&sel=s%3Anova-sintra");
  });
});
