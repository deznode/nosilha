import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettlementsContent } from "@/components/settlements/settlements-content";
import type { TownStatusSummary } from "@/types/town";

const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

function town(overrides: Partial<TownStatusSummary> = {}): TownStatusSummary {
  return {
    id: "t",
    slug: "slug",
    name: "Name",
    description: "",
    latitude: 14.86,
    longitude: -24.71,
    entryCount: 0,
    hasPhotograph: false,
    status: "NAME_ONLY",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
    ...overrides,
  };
}

const TOWNS: TownStatusSummary[] = [
  town({
    slug: "nova-sintra",
    name: "Nova Sintra",
    status: "PARTIAL",
    entryCount: 5,
    population: "1,069 (2010 census)",
    elevation: "530m",
  }),
  town({
    slug: "monte",
    name: "Monte",
    status: "DOCUMENTED",
    entryCount: 1,
    hasPhotograph: true,
    photographCount: 2,
  }),
  town({ slug: "cova-joana", name: "Cova Joana" }),
];

/** Spec 034 T-26 / FR-007 — the index of every name on the island. */
describe("SettlementsContent", () => {
  beforeEach(() => {
    replace.mockClear();
    searchParams = new URLSearchParams();
  });

  it("heads the page and states the split in words", () => {
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Settlements" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Three places carry a name on Brava. One is documented, one holds records " +
          "without a photograph, and one is a name and a coordinate."
      )
    ).toBeInTheDocument();
  });

  it("offers the three chips with live counts", () => {
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    for (const [label, count] of [
      ["All settlements", "3"],
      ["Has records", "2"],
      ["Nothing yet", "1"],
    ]) {
      const chip = screen.getByRole("button", { name: new RegExp(label) });
      expect(within(chip).getByText(count)).toBeInTheDocument();
    }
  });

  it("shows a zero count rather than hiding the chip's number", () => {
    render(
      <SettlementsContent
        towns={[town({ slug: "a", entryCount: 2, status: "PARTIAL" })]}
        initialFilter="all"
      />
    );

    const chip = screen.getByRole("button", { name: /Nothing yet/ });
    expect(within(chip).getByText("0")).toBeInTheDocument();
  });

  it("follows the URL when it changes without a remount", () => {
    // Arriving at `?filter=` on a route already on screen does not remount this
    // component, and under `cacheComponents` a hidden route stays alive rather than
    // unmounting. A mirrored `useState` would keep showing the first filter.
    const { rerender } = render(
      <SettlementsContent towns={TOWNS} initialFilter="all" />
    );
    expect(screen.getByText("Nova Sintra")).toBeInTheDocument();

    searchParams = new URLSearchParams("filter=none");
    rerender(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    expect(screen.queryByText("Nova Sintra")).not.toBeInTheDocument();
    expect(screen.getByText("Cova Joana")).toBeInTheDocument();
  });

  it("starts filtered when the URL asked for it", () => {
    searchParams = new URLSearchParams("filter=none");
    render(<SettlementsContent towns={TOWNS} initialFilter="none" />);

    expect(screen.getByText("Cova Joana")).toBeInTheDocument();
    expect(screen.queryByText("Nova Sintra")).not.toBeInTheDocument();
  });

  it("writes the chosen filter into the URL", async () => {
    const user = userEvent.setup();
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    await user.click(screen.getByRole("button", { name: /Has records/ }));

    expect(replace).toHaveBeenCalledWith("/settlements?filter=has", {
      scroll: false,
    });
  });

  it("drops the parameter again when everything is shown", async () => {
    const user = userEvent.setup();
    searchParams = new URLSearchParams("filter=none");
    render(<SettlementsContent towns={TOWNS} initialFilter="none" />);

    await user.click(screen.getByRole("button", { name: /All settlements/ }));

    expect(replace).toHaveBeenCalledWith("/settlements", { scroll: false });
  });

  it("opens a settlement that holds records, and the map for one that does not", () => {
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    expect(screen.getByRole("link", { name: /Nova Sintra/ })).toHaveAttribute(
      "href",
      "/nova-sintra"
    );
    expect(screen.getByRole("link", { name: /Cova Joana/ })).toHaveAttribute(
      "href",
      "/map?mode=settlements&sel=s%3Acova-joana"
    );
  });

  it("says what a card does not record, and shows what it does", () => {
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    expect(screen.getByText("1,069 (2010 census)")).toBeInTheDocument();
    expect(screen.getByText("530m")).toBeInTheDocument();
    expect(screen.getAllByText("population not recorded")).toHaveLength(2);
  });

  it("states each settlement's holdings on its card", () => {
    render(<SettlementsContent towns={TOWNS} initialFilter="all" />);

    expect(
      screen.getByText("Five records · no photograph")
    ).toBeInTheDocument();
    expect(
      screen.getByText("One record · two photographs")
    ).toBeInTheDocument();
    expect(
      screen.getByText("a name and a coordinate, nothing else")
    ).toBeInTheDocument();
  });
});
