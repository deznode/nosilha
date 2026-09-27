import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect, type RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BravaMap from "@/features/map/components/brava-map";
import type { MapItem } from "@/features/map/data/types";
import { NARROW_QUERY } from "@/hooks/use-narrow";
import {
  getEntriesForMap,
  getGalleryFacets,
  getGalleryMedia,
  getTownStatusSummary,
} from "@/lib/api";
import { initialMapState, useMapStore } from "@/stores/mapStore";
import { useUiStore } from "@/stores/uiStore";
import type { TownStatusSummary } from "@/types/town";
import { mockMatchMedia } from "../../../setup/match-media-mock";

vi.mock("@/lib/api", () => ({
  getEntriesForMap: vi.fn(),
  getTownStatusSummary: vi.fn(),
  getGalleryMedia: vi.fn(),
  getGalleryFacets: vi.fn(),
}));

const easeTo = vi.fn();
const canvasMounts = vi.fn();
/** The canvas's pin click, as the map would call it. */
let tapPin: (item: MapItem) => void = () => {};

/** The canvas stands in for MapLibre: it hands over a camera and reports a load. */
vi.mock("@/features/map/components/map-canvas", () => ({
  MapCanvas: ({
    mapRef,
    onLoad,
    onSelect,
  }: {
    mapRef: RefObject<unknown>;
    onLoad: () => void;
    onSelect: (item: MapItem) => void;
  }) => {
    tapPin = onSelect;
    useEffect(() => {
      canvasMounts();
      mapRef.current = {
        easeTo,
        getContainer: () => ({ clientHeight: 700 }),
      };
      onLoad();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <div data-testid="canvas" />;
  },
}));

function town(
  slug: string,
  name: string,
  status: TownStatusSummary["status"]
): TownStatusSummary {
  return {
    id: slug,
    slug,
    name,
    description: "",
    latitude: 14.88,
    longitude: -24.68,
    entryCount: status === "NAME_ONLY" ? 0 : 2,
    hasPhotograph: status === "DOCUMENTED",
    status,
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
  };
}

function mockApi() {
  vi.mocked(getTownStatusSummary).mockResolvedValue([
    town("nova-sintra", "Nova Sintra", "DOCUMENTED"),
    town("furna", "Furna", "NAME_ONLY"),
  ]);
  vi.mocked(getEntriesForMap).mockResolvedValue({
    items: [],
    pagination: { page: 0, size: 100, totalElements: 0, totalPages: 1 },
  } as never);
  vi.mocked(getGalleryMedia).mockResolvedValue({
    items: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 0,
  });
  vi.mocked(getGalleryFacets).mockResolvedValue({
    total: 26,
    photographs: 17,
    films: 9,
    withPlace: 11,
    withoutPlace: 6,
    withoutDate: 3,
    uncredited: 17,
  });
}

async function renderMap() {
  render(<BravaMap />);
  // Let fetchData resolve.
  await act(async () => {});
}

function legend() {
  return screen.getByRole("list", { name: "Pin colour key" });
}

describe("BravaMap", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [NARROW_QUERY]: false });
    easeTo.mockClear();
    canvasMounts.mockClear();
    useUiStore.setState({ theme: "light" });
    useMapStore.setState(initialMapState);
    window.history.replaceState(null, "", "/map");
    mockApi();
  });

  afterEach(() => media.restore());

  describe("wide", () => {
    it("puts the sidebar beside the canvas, with no sheet", async () => {
      await renderMap();

      expect(
        screen.getByRole("complementary", { name: "Filters and list" })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("map-sheet")).toBeNull();
      expect(legend().style.bottom).toBe("14px");
    });

    it("keys the legend from live settlement counts", async () => {
      await renderMap();
      expect(
        within(legend())
          .getAllByRole("listitem")
          .map((row) => row.textContent)
      ).toEqual(["documented 1", "records, no photograph 0", "name only 1"]);
    });

    it("floats the selection card 62px up", async () => {
      await renderMap();
      act(() => useMapStore.getState().select("s:furna"));

      expect(
        screen.getByRole("region", { name: "Selected: Furna" }).style.bottom
      ).toBe("62px");
    });

    it("eases to a row's pin at zoom 14.2", async () => {
      await renderMap();
      fireEvent.click(screen.getByRole("button", { name: /^Furna/ }));

      expect(useMapStore.getState().selectedKey).toBe("s:furna");
      expect(easeTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [-24.68, 14.88],
          zoom: 14.2,
          duration: 900,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        })
      );
    });

    it("shows the photographs note only in photographs mode", async () => {
      await renderMap();
      expect(screen.queryByText(/carry no coordinates/)).toBeNull();

      act(() => useMapStore.getState().setMode("photographs"));
      expect(
        screen.getByText(
          "Six photographs carry no coordinates and cannot appear here."
        )
      ).toBeInTheDocument();
      // Clear of MapLibre's zoom buttons in the same corner.
      expect(
        screen.getByText(/cannot appear here/).parentElement!.style.bottom
      ).toBe("122px");
      expect(
        within(legend())
          .getAllByRole("listitem")
          .map((row) => row.textContent)
      ).toEqual(["coordinates, no place name 0", "no coordinates 6"]);
    });
  });

  describe("controls", () => {
    it("tilts to 58° for 3D and back", async () => {
      await renderMap();
      fireEvent.click(screen.getByRole("button", { name: "3D terrain" }));

      expect(useMapStore.getState().is3D).toBe(true);
      expect(easeTo).toHaveBeenLastCalledWith(
        expect.objectContaining({ pitch: 58 })
      );
      expect(
        screen.getByRole("button", { name: "3D terrain" })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("resets to the prototype's view and clears the selection", async () => {
      await renderMap();
      act(() => useMapStore.getState().select("s:furna"));

      fireEvent.click(screen.getByRole("button", { name: "Reset view" }));

      expect(useMapStore.getState().selectedKey).toBeNull();
      expect(easeTo).toHaveBeenLastCalledWith(
        expect.objectContaining({
          center: [-24.718, 14.859],
          zoom: 12.1,
          pitch: 0,
        })
      );
    });

    it("toggles satellite", async () => {
      await renderMap();
      fireEvent.click(screen.getByRole("button", { name: "Satellite" }));
      expect(useMapStore.getState().satellite).toBe(true);
    });

    it("eases to the reader's location", async () => {
      const getCurrentPosition = vi.fn((success: PositionCallback) =>
        success({
          coords: { latitude: 14.85, longitude: -24.7 },
        } as GeolocationPosition)
      );
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: { getCurrentPosition },
      });

      await renderMap();
      fireEvent.click(screen.getByRole("button", { name: "My location" }));

      expect(easeTo).toHaveBeenLastCalledWith(
        expect.objectContaining({ center: [-24.7, 14.85], zoom: 14 })
      );
    });
  });

  describe("narrow", () => {
    beforeEach(() => media.setMatches(NARROW_QUERY, true));

    it("puts the list and the pin key in a peeking sheet, with nothing over the map", async () => {
      await renderMap();

      expect(
        screen.queryByRole("complementary", { name: "Filters and list" })
      ).toBeNull();
      const sheet = screen.getByTestId("map-sheet");
      expect(sheet.style.maxHeight).toBe("160px");
      expect(sheet).toHaveAttribute("data-view", "peek");
      expect(sheet.className).toContain("duration-[260ms]");
      expect(sheet.className).toContain("ease-[cubic-bezier(.4,.14,.3,1)]");
      expect(
        screen.getByRole("button", { name: "Filters and list" })
      ).toHaveAttribute("aria-expanded", "false");
      // The key sits in the sheet's peek rather than floating over the canvas.
      expect(sheet).toContainElement(legend());
      expect(legend().style.bottom).toBe("");
    });

    it("shows a selection as a detail view in the sheet, not over the map", async () => {
      await renderMap();
      act(() => useMapStore.getState().select("s:furna"));

      const sheet = screen.getByTestId("map-sheet");
      expect(sheet).toHaveAttribute("data-view", "detail");
      expect(sheet.style.maxHeight).toBe("50%");
      expect(sheet).toContainElement(
        screen.getByRole("region", { name: "Selected: Furna" })
      );
      expect(
        screen.getAllByRole("region", { name: /^Selected:/ })
      ).toHaveLength(1);
      expect(
        screen.queryByRole("button", { name: "Filters and list" })
      ).toBeNull();
    });

    it("closes the detail view back to the peeking list", async () => {
      await renderMap();
      act(() => useMapStore.getState().select("s:furna"));

      const close = screen.getByRole("button", { name: "Close" });
      expect(close.className).toContain("size-11");
      fireEvent.click(close);

      expect(useMapStore.getState().selectedKey).toBeNull();
      expect(screen.getByTestId("map-sheet")).toHaveAttribute(
        "data-view",
        "peek"
      );
      expect(
        screen.getByRole("button", { name: "Filters and list" })
      ).toBeInTheDocument();
    });

    it("expands to 85% over a selection and shows the list", async () => {
      await renderMap();
      act(() => {
        useMapStore.getState().select("s:furna");
        useMapStore.getState().setSheetOpen(true);
      });

      const sheet = screen.getByTestId("map-sheet");
      expect(sheet.style.maxHeight).toBe("85%");
      expect(sheet).toHaveAttribute("data-view", "open");
      expect(
        screen.getByRole("button", { name: "Hide the list" })
      ).toHaveAttribute("aria-expanded", "true");
      expect(screen.queryByRole("region", { name: /^Selected:/ })).toBeNull();
    });

    it("drops the sheet to the selection and eases the pin above it", async () => {
      await renderMap();
      fireEvent.click(screen.getByRole("button", { name: "Filters and list" }));

      fireEvent.click(screen.getByRole("button", { name: /^Furna/ }));

      expect(useMapStore.getState().selectedKey).toBe("s:furna");
      expect(useMapStore.getState().sheetOpen).toBe(false);
      expect(screen.getByTestId("map-sheet")).toHaveAttribute(
        "data-view",
        "detail"
      );
      expect(easeTo).toHaveBeenLastCalledWith(
        expect.objectContaining({
          zoom: 14.2,
          padding: { top: 0, right: 0, bottom: 420, left: 0 },
        })
      );
    });

    it("pans a tapped pin clear of the sheet without changing the zoom", async () => {
      await renderMap();
      act(() => useMapStore.getState().setSheetOpen(true));
      const furna = useMapStore
        .getState()
        .settlements.find((item) => item.key === "s:furna")!;

      act(() => tapPin(furna));

      expect(useMapStore.getState().selectedKey).toBe("s:furna");
      expect(useMapStore.getState().sheetOpen).toBe(false);
      const call = easeTo.mock.lastCall![0];
      expect(call).not.toHaveProperty("zoom");
      expect(call.padding).toEqual({ top: 0, right: 0, bottom: 420, left: 0 });
    });

    it("heads the sheet's list with the photographs note", async () => {
      await renderMap();
      act(() => {
        useMapStore.getState().setMode("photographs");
        useMapStore.getState().setSheetOpen(true);
      });

      const note = screen.getByText(/cannot appear here/).parentElement!;
      expect(screen.getByTestId("map-sheet")).toContainElement(note);
      expect(note.style.bottom).toBe("");
    });

    it("keeps the same map when the breakpoint is crossed", async () => {
      await renderMap();
      expect(canvasMounts).toHaveBeenCalledTimes(1);

      act(() => media.setMatches(NARROW_QUERY, false));
      expect(
        screen.getByRole("complementary", { name: "Filters and list" })
      ).toBeInTheDocument();
      expect(canvasMounts).toHaveBeenCalledTimes(1);
    });

    it("closes the sheet when the route is shown again", async () => {
      useMapStore.setState({ sheetOpen: true });
      await renderMap();
      expect(screen.getByTestId("map-sheet").style.maxHeight).toBe("160px");
    });
  });

  describe("deep links", () => {
    it("restores the filter and selection, then flies to the pin once loaded", async () => {
      window.history.replaceState(
        null,
        "",
        "/map?mode=settlements&status=name&sel=s:furna"
      );
      await renderMap();

      expect(useMapStore.getState().status).toBe("name");
      expect(
        screen.getByRole("region", { name: "Selected: Furna" })
      ).toBeInTheDocument();
      expect(easeTo).toHaveBeenCalledTimes(1);
      expect(easeTo).toHaveBeenCalledWith(
        expect.objectContaining({ center: [-24.68, 14.88], zoom: 14.2 })
      );
    });

    it("on a return visit, waits for this visit's data before acting on a link", async () => {
      const first = render(<BravaMap />);
      await act(async () => {});
      first.unmount();
      easeTo.mockClear();

      // The archive gained a settlement since the last visit; the link names it.
      vi.mocked(getTownStatusSummary).mockResolvedValue([
        town("nova-sintra", "Nova Sintra", "DOCUMENTED"),
        town("furna", "Furna", "NAME_ONLY"),
        town("lima-doce", "Lima Doce", "NAME_ONLY"),
      ]);
      window.history.replaceState(null, "", "/map?sel=s:lima-doce");
      await renderMap();

      expect(useMapStore.getState().selectedKey).toBe("s:lima-doce");
      expect(easeTo).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("region", { name: "Selected: Lima Doce" })
      ).toBeInTheDocument();
    });

    it("drops a selection the archive does not hold", async () => {
      window.history.replaceState(null, "", "/map?sel=s:atlantis");
      await renderMap();

      expect(useMapStore.getState().selectedKey).toBeNull();
      expect(easeTo).not.toHaveBeenCalled();
      expect(window.location.search).toBe("");
    });

    it("waits out a failed load rather than dropping the selection", async () => {
      vi.mocked(getGalleryFacets).mockRejectedValue(new Error("down"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      window.history.replaceState(null, "", "/map?sel=s:furna");
      await renderMap();

      expect(useMapStore.getState().selectedKey).toBe("s:furna");
      expect(screen.getByRole("alert")).toHaveTextContent(/could not load/);
    });
  });
});
