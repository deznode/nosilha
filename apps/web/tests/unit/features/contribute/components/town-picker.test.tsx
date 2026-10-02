import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DESKTOP_QUERY } from "@/features/contribute/components/responsive-sheet";
import { TownPicker } from "@/features/contribute/components/town-picker";
import type { Town } from "@/types/town";

import { mockMatchMedia } from "../../../../setup/match-media-mock";

let media: ReturnType<typeof mockMatchMedia>;

afterEach(() => media?.restore());

function makeTown(overrides: Partial<Town>): Town {
  return {
    id: "town-id",
    slug: "town",
    name: "Town",
    description: "",
    latitude: 14.86,
    longitude: -24.72,
    population: null,
    elevation: null,
    founded: null,
    highlights: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const TOWNS: Town[] = [
  makeTown({ id: "1", slug: "nova-sintra", name: "Nova Sintra" }),
  makeTown({ id: "2", slug: "faja-dagua", name: "Fajã d’Água" }),
  makeTown({ id: "3", slug: "furna", name: "Furna" }),
];

function renderPicker(
  overrides: Partial<ComponentProps<typeof TownPicker>> = {}
) {
  const onClose = vi.fn();
  const onSelect = vi.fn();
  const onFreeText = vi.fn();
  render(
    <TownPicker
      open
      onClose={onClose}
      onSelect={onSelect}
      onFreeText={onFreeText}
      towns={TOWNS}
      label="Where was it taken?"
      {...overrides}
    />
  );
  return { onClose, onSelect, onFreeText };
}

describe("TownPicker", () => {
  it("renders a bottom sheet on phones", () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: false });
    renderPicker();

    const dialog = screen.getByRole("dialog", { name: "Where was it taken?" });
    expect(dialog.className).toContain("rounded-t-[16px]");
  });

  it("renders a 460px dialog on desktop", () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    renderPicker();

    const dialog = screen.getByRole("dialog", { name: "Where was it taken?" });
    const panel = dialog.querySelector('[class*="w-[460px]"]');
    expect(panel).not.toBeNull();
  });

  it("lists every town before a search", () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    renderPicker();

    expect(screen.getByText("Nova Sintra")).toBeInTheDocument();
    expect(screen.getByText("Fajã d’Água")).toBeInTheDocument();
    expect(screen.getByText("Furna")).toBeInTheDocument();
  });

  it("filters ignoring accents: 'faja' finds 'Fajã d'Água'", async () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    const user = userEvent.setup();
    renderPicker();

    await user.type(
      screen.getByPlaceholderText("Search Brava's towns"),
      "faja"
    );

    expect(screen.getByText("Fajã d’Água")).toBeInTheDocument();
    expect(screen.queryByText("Nova Sintra")).not.toBeInTheDocument();
    expect(screen.queryByText("Furna")).not.toBeInTheDocument();
  });

  it("calls onSelect with the picked town", async () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    const user = userEvent.setup();
    const { onSelect } = renderPicker();

    await user.click(screen.getByText("Nova Sintra"));

    expect(onSelect).toHaveBeenCalledWith(TOWNS[0]);
  });

  it("calls onFreeText from 'Describe it in my own words instead'", async () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    const user = userEvent.setup();
    const { onFreeText } = renderPicker();

    await user.click(screen.getByText("Describe it in my own words instead"));

    expect(onFreeText).toHaveBeenCalled();
  });

  it("calls onClose from 'Close'", async () => {
    media = mockMatchMedia({ [DESKTOP_QUERY]: true });
    const user = userEvent.setup();
    const { onClose } = renderPicker();

    await user.click(screen.getByText("Close"));

    expect(onClose).toHaveBeenCalled();
  });
});
