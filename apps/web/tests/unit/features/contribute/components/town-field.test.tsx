import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DESKTOP_QUERY } from "@/features/contribute/components/responsive-sheet";
import {
  TownField,
  type PlaceValue,
} from "@/features/contribute/components/town-field";
import { getTowns, getTownFirstPhoto } from "@/lib/api";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import type { PublicGalleryMedia } from "@/types/gallery";
import type { Town } from "@/types/town";

import { mockMatchMedia } from "../../../../setup/match-media-mock";

vi.mock("@/lib/api", () => ({
  getTowns: vi.fn(),
  getTownFirstPhoto: vi.fn(),
}));

vi.mock("@/lib/gallery-mappers", () => ({
  resolvePublicImageUrl: vi.fn(),
}));

vi.mock("@/features/map/components/mini-map", () => ({
  MiniMap: ({ lat, lng, zoom, status }: Record<string, unknown>) => (
    <div
      data-testid="mini-map"
      data-lat={lat}
      data-lng={lng}
      data-zoom={zoom}
      data-status={status}
    />
  ),
}));

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

const NOVA_SINTRA = makeTown({
  id: "1",
  slug: "nova-sintra",
  name: "Nova Sintra",
});
const FAJA = makeTown({ id: "2", slug: "faja-dagua", name: "Fajã d’Água" });
const TOWNS = [NOVA_SINTRA, FAJA];

const EMPTY_VALUE: PlaceValue = {
  townId: null,
  townName: null,
  detail: "",
  mode: "town",
};

let media: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  vi.mocked(getTowns).mockResolvedValue(TOWNS);
  vi.mocked(getTownFirstPhoto).mockResolvedValue(null);
  vi.mocked(resolvePublicImageUrl).mockReturnValue(null);
  media = mockMatchMedia({ [DESKTOP_QUERY]: true });
});

afterEach(() => media.restore());

function renderField(
  overrides: Partial<{ kind: "photo" | "film"; value: PlaceValue }> = {}
) {
  const onChange = vi.fn();
  render(
    <TownField
      kind={overrides.kind ?? "photo"}
      value={overrides.value ?? EMPTY_VALUE}
      onChange={onChange}
      label="Where was it taken?"
    />
  );
  return { onChange };
}

describe("TownField", () => {
  it("shows the empty placeholder and opens the picker", async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByText("Choose a town"));

    expect(
      await screen.findByRole("dialog", { name: "Where was it taken?" })
    ).toBeInTheDocument();
  });

  it("picking a town in the picker calls onChange with the town id", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField();

    await user.click(screen.getByText("Choose a town"));
    await user.click(await screen.findByText("Nova Sintra"));

    expect(onChange).toHaveBeenCalledWith({
      townId: "1",
      townName: "Nova Sintra",
      detail: "",
      mode: "town",
    });
  });

  it("finds 'Fajã d'Água' by searching accent-insensitively for 'faja'", async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByText("Choose a town"));
    await user.type(
      await screen.findByPlaceholderText("Search Brava's towns"),
      "faja"
    );

    expect(screen.getByText("Fajã d’Água")).toBeInTheDocument();
    expect(screen.queryByText("Nova Sintra")).not.toBeInTheDocument();
  });

  it("switches to free text from the empty state", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField();

    await user.click(screen.getByText("describe the place in your own words"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_VALUE, mode: "free" });
  });

  it("free mode shows the free-text copy and 'Choose a town as well' reopens the picker", async () => {
    const user = userEvent.setup();
    renderField({
      value: {
        townId: null,
        townName: null,
        detail: "By the harbour",
        mode: "free",
      },
    });

    expect(screen.getByDisplayValue("By the harbour")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, node) =>
          node?.tagName === "P" &&
          node.textContent ===
            "In your words. It won't be linked to a town page. Choose a town as well"
      )
    ).toBeInTheDocument();

    await user.click(screen.getByText("Choose a town as well"));

    expect(
      await screen.findByRole("dialog", { name: "Where was it taken?" })
    ).toBeInTheDocument();
  });

  it("free text wraps in a textarea and keeps a pasted line break as a space", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({
      value: { townId: null, townName: null, detail: "", mode: "free" },
    });

    const field = screen.getByRole("textbox");
    expect(field.tagName).toBe("TEXTAREA");

    await user.click(field);
    await user.paste("Above the harbour,\nbehind the old school");

    expect(onChange).toHaveBeenLastCalledWith({
      townId: null,
      townName: null,
      detail: "Above the harbour, behind the old school",
      mode: "free",
    });
  });

  it("picking a town from the picker's free-text link switches to free mode and clears the town", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    await user.click(screen.getByText("Change"));
    await user.click(
      await screen.findByText("Describe it in my own words instead")
    );

    expect(onChange).toHaveBeenCalledWith({
      townId: null,
      townName: null,
      detail: "",
      mode: "free",
    });
  });

  it("after a pick, shows the chip, the map, the town caption and the 'More exactly' field for a photo", async () => {
    renderField({
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    expect(screen.getByText("Nova Sintra")).toBeInTheDocument();
    expect(screen.getByText("Change")).toBeInTheDocument();
    expect(
      screen.getByText("It will also appear on the Nova Sintra page.")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("More exactly, in your own words")
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId("mini-map")).toHaveAttribute("data-zoom", "14")
    );
    expect(screen.getByTestId("mini-map")).toHaveAttribute(
      "data-status",
      "documented"
    );
  });

  it("the film variant omits the 'More exactly' field and the town-page caption", async () => {
    renderField({
      kind: "film",
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    await waitFor(() =>
      expect(screen.getByTestId("mini-map")).toBeInTheDocument()
    );

    expect(
      screen.queryByText("It will also appear on the Nova Sintra page.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("More exactly, in your own words")
    ).not.toBeInTheDocument();
  });

  it("falls back to a full-width map when the town has no first photo", async () => {
    vi.mocked(getTownFirstPhoto).mockResolvedValue(null);
    renderField({
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    await waitFor(() => expect(getTownFirstPhoto).toHaveBeenCalledWith("1"));
    const map = await screen.findByTestId("mini-map");
    expect(map.parentElement?.className).toContain("col-span-2");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to a full-width map when the first-photo call fails", async () => {
    vi.mocked(getTownFirstPhoto).mockRejectedValue(new Error("network"));
    renderField({
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    const map = await screen.findByTestId("mini-map");
    await waitFor(() =>
      expect(map.parentElement?.className).toContain("col-span-2")
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the town's first photo beside the map when one is found", async () => {
    const photo: PublicGalleryMedia = {
      id: "media-1",
      mediaSource: "USER_UPLOAD",
      publicUrl: "https://example.com/photo.jpg",
    } as unknown as PublicGalleryMedia;
    vi.mocked(getTownFirstPhoto).mockResolvedValue(photo);
    vi.mocked(resolvePublicImageUrl).mockReturnValue(
      "https://example.com/photo.jpg"
    );

    renderField({
      value: { townId: "1", townName: "Nova Sintra", detail: "", mode: "town" },
    });

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "https://example.com/photo.jpg");
    const map = screen.getByTestId("mini-map");
    expect(map.parentElement?.className).not.toContain("col-span-2");
  });
});
