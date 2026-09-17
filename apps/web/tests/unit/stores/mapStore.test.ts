import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMapStore, initialMapState } from "@/stores/mapStore";
import {
  getEntriesForMap,
  getGalleryFacets,
  getGalleryMedia,
  getTownStatusSummary,
} from "@/lib/api";
import type { TownStatusSummary } from "@/types/town";

vi.mock("@/lib/api", () => ({
  getEntriesForMap: vi.fn(),
  getTownStatusSummary: vi.fn(),
  getGalleryMedia: vi.fn(),
  getGalleryFacets: vi.fn(),
}));

const town: TownStatusSummary = {
  id: "town-faja",
  slug: "faja-de-agua",
  name: "Fajã d'Água",
  description: "",
  latitude: 14.87306,
  longitude: -24.73194,
  entryCount: 1,
  hasPhotograph: false,
  status: "PARTIAL",
  population: null,
  elevation: null,
  photographCount: 0,
  unconfirmedPhotographCount: 0,
};

function mockApi() {
  vi.mocked(getTownStatusSummary).mockResolvedValue([town]);
  vi.mocked(getEntriesForMap).mockResolvedValue({
    items: [
      {
        id: "e1",
        slug: "nos-raiz",
        name: "Nos Raiz",
        category: "Hotel",
        imageUrl: null,
        town: "Fajã d'Água",
        townId: "town-faja",
        latitude: 14.87306,
        longitude: -24.73194,
        description: "",
        tags: [],
      },
    ],
    pagination: { page: 0, size: 100, totalElements: 1, totalPages: 1 },
  } as never);
  vi.mocked(getGalleryMedia).mockResolvedValue({
    items: [
      {
        id: "m1",
        title: null,
        description: null,
        category: null,
        displayOrder: 0,
        mediaSource: "USER_UPLOAD",
        altText: null,
        createdAt: "2024-01-01T00:00:00Z",
        publicUrl: "https://r2.example/a.jpg",
        latitude: 14.86,
        longitude: -24.71,
      },
    ],
    totalItems: 1,
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

describe("mapStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMapStore.setState(initialMapState);
  });

  describe("initial state", () => {
    it("opens on settlements, unfiltered, with nothing selected", () => {
      const s = useMapStore.getState();
      expect(s.mode).toBe("settlements");
      expect(s.status).toBe("all");
      expect(s.query).toBe("");
      expect(s.selectedKey).toBeNull();
      expect(s.expandedGroupKey).toBeNull();
      expect(s.satellite).toBe(false);
      expect(s.is3D).toBe(false);
      expect(s.sheetOpen).toBe(false);
      expect(s.isLoading).toBe(true);
    });
  });

  describe("mode", () => {
    it("clears the selection and the fan, as prototyped, and keeps the filter", () => {
      useMapStore.setState({
        status: "name",
        query: "furna",
        selectedKey: "s:furna",
        expandedGroupKey: "g",
      });

      useMapStore.getState().setMode("records");

      const s = useMapStore.getState();
      expect(s.mode).toBe("records");
      expect(s.selectedKey).toBeNull();
      expect(s.expandedGroupKey).toBeNull();
      expect(s.status).toBe("name");
      expect(s.query).toBe("furna");
    });
  });

  describe("status", () => {
    it("clears the selection", () => {
      useMapStore.setState({ selectedKey: "s:furna" });
      useMapStore.getState().setStatus("documented");

      expect(useMapStore.getState().status).toBe("documented");
      expect(useMapStore.getState().selectedKey).toBeNull();
    });
  });

  describe("selection", () => {
    it("selects and clears by key", () => {
      useMapStore.getState().select("r:nos-raiz");
      expect(useMapStore.getState().selectedKey).toBe("r:nos-raiz");

      useMapStore.getState().clearSelection();
      expect(useMapStore.getState().selectedKey).toBeNull();
    });

    it("closes the fan when the selection is cleared", () => {
      useMapStore.setState({ selectedKey: "r:a", expandedGroupKey: "g" });
      useMapStore.getState().clearSelection();
      expect(useMapStore.getState().expandedGroupKey).toBeNull();
    });
  });

  describe("hydrate", () => {
    it("sets mode, filter, query and selection in one step", () => {
      useMapStore.getState().hydrate({
        mode: "settlements",
        status: "name",
        query: "fur",
        selectedKey: "s:furna",
      });

      const s = useMapStore.getState();
      expect(s.mode).toBe("settlements");
      expect(s.status).toBe("name");
      expect(s.query).toBe("fur");
      // setMode would have cleared this; hydrate must not.
      expect(s.selectedKey).toBe("s:furna");
    });
  });

  describe("toggles", () => {
    it("flips satellite, 3D and the sheet", () => {
      const s = useMapStore.getState();
      s.toggleSatellite();
      s.toggle3D();
      s.toggleSheet();

      const next = useMapStore.getState();
      expect(next.satellite).toBe(true);
      expect(next.is3D).toBe(true);
      expect(next.sheetOpen).toBe(true);
    });

    it("resetTransient closes the sheet and the fan, and nothing else", () => {
      useMapStore.setState({
        sheetOpen: true,
        expandedGroupKey: "g",
        selectedKey: "s:a",
        mode: "records",
      });
      useMapStore.getState().resetTransient();

      const s = useMapStore.getState();
      expect(s.sheetOpen).toBe(false);
      expect(s.expandedGroupKey).toBeNull();
      expect(s.selectedKey).toBe("s:a");
      expect(s.mode).toBe("records");
    });
  });

  describe("fetchData", () => {
    it("builds items for all three modes and keeps the unlocated count", async () => {
      mockApi();
      await useMapStore.getState().fetchData();

      const s = useMapStore.getState();
      expect(s.isLoading).toBe(false);
      expect(s.fetchError).toBeNull();
      expect(s.settlements.map((i) => i.key)).toEqual(["s:faja-de-agua"]);
      expect(s.records.map((i) => i.key)).toEqual(["r:nos-raiz"]);
      // Records link under the settlement the summary names.
      expect(s.records[0].href).toBe("/faja-de-agua/nos-raiz");
      expect(s.photos.map((i) => i.key)).toEqual(["p:m1"]);
      expect(s.unlocatedCount).toBe(6);
    });

    it("asks the gallery for located photographs only", async () => {
      mockApi();
      await useMapStore.getState().fetchData();

      expect(getGalleryMedia).toHaveBeenCalledWith(
        expect.objectContaining({ hasPlace: true })
      );
    });

    it("loads again on a return visit, and says so while it does", async () => {
      mockApi();
      await useMapStore.getState().fetchData();

      const pending = useMapStore.getState().fetchData();
      expect(useMapStore.getState().isLoading).toBe(true);
      await pending;

      expect(useMapStore.getState().isLoading).toBe(false);
      expect(getTownStatusSummary).toHaveBeenCalledTimes(2);
    });

    it("clears an earlier failure when a new load starts", async () => {
      useMapStore.setState({ fetchError: "earlier", isLoading: false });
      mockApi();

      const pending = useMapStore.getState().fetchData();
      expect(useMapStore.getState().fetchError).toBeNull();
      await pending;
    });

    it("keeps the newest load when an older one answers last", async () => {
      mockApi();
      let answerFirst!: (value: TownStatusSummary[]) => void;
      vi.mocked(getTownStatusSummary).mockReturnValueOnce(
        new Promise((resolve) => (answerFirst = resolve))
      );
      const first = useMapStore.getState().fetchData();
      await useMapStore.getState().fetchData();

      answerFirst([{ ...town, slug: "stale" }]);
      await first;

      expect(useMapStore.getState().settlements.map((i) => i.key)).toEqual([
        "s:faja-de-agua",
      ]);
      expect(useMapStore.getState().isLoading).toBe(false);
    });

    it("reports a failure instead of showing empty modes as fact", async () => {
      mockApi();
      vi.mocked(getGalleryFacets).mockRejectedValue(new Error("down"));
      vi.spyOn(console, "error").mockImplementation(() => {});

      await useMapStore.getState().fetchData();

      const s = useMapStore.getState();
      expect(s.isLoading).toBe(false);
      expect(s.fetchError).toMatch(/could not load/i);
      expect(s.settlements).toEqual([]);
    });
  });
});
