import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilteredLocations } from "@/features/map/hooks/useFilteredLocations";
import { useMapStore } from "@/stores/mapStore";
import type { Location } from "@/features/map/data/types";
import { Building, Mountain, Sun, Church } from "lucide-react";

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Monte Fontainhas",
    namePortuguese: "Monte Fontainhas",
    category: "Nature",
    description: "Highest peak on Brava Island",
    coordinates: { lat: 14.851, lng: -24.708 },
    elevation: 976,
    image: "/images/fontainhas.jpg",
    tags: ["hiking", "viewpoint"],
    icon: Mountain,
    color: "#3e7d5a",
    status: { status: "documented", label: "has a photograph" },
  },
  {
    id: "2",
    name: "Praia Fajã d'Água",
    namePortuguese: "Praia Fajã d'Água",
    category: "Beach",
    description: "Famous black sand beach",
    coordinates: { lat: 14.865, lng: -24.72 },
    elevation: 0,
    image: "/images/faja.jpg",
    tags: ["beach", "swimming"],
    icon: Sun,
    color: "#f7b801",
    status: { status: "documented", label: "has a photograph" },
  },
  {
    id: "3",
    name: "Nossa Senhora do Monte",
    namePortuguese: "Nossa Senhora do Monte",
    category: "Church",
    description: "Historic church in Nova Sintra",
    coordinates: { lat: 14.867, lng: -24.706 },
    elevation: 450,
    image: "/images/church.jpg",
    tags: ["church", "heritage"],
    icon: Church,
    color: "#8b5cf6",
    status: { status: "documented", label: "has a photograph" },
  },
];

const mockSettlements: Location[] = [
  {
    id: "nova-sintra",
    name: "Nova Sintra",
    namePortuguese: "Nova Sintra",
    category: "Town",
    description: "The island's main town",
    coordinates: { lat: 14.87111, lng: -24.69611 },
    elevation: 0,
    tags: [],
    icon: Building,
    color: "#4F6E63",
    status: { status: "documented", label: "documented" },
  },
  {
    id: "minhoto",
    name: "Minhoto",
    namePortuguese: "Minhoto",
    category: "Town",
    description: "A hamlet in the north-east",
    coordinates: { lat: 14.8784, lng: -24.6958 },
    elevation: 0,
    tags: [],
    icon: Building,
    color: "#836548",
    status: { status: "gap", label: "name only" },
  },
];

function resetStore() {
  useMapStore.setState({
    mapMode: "places",
    settlements: mockSettlements,
    locations: mockLocations,
    activeCategory: "All",
    searchQuery: "",
    layerVisibility: "all",
  });
}

describe("useFilteredLocations", () => {
  beforeEach(() => {
    resetStore();
  });

  it("returns all locations when no filters are active", () => {
    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(3);
  });

  it("filters by category", () => {
    useMapStore.setState({ activeCategory: "Beach" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Praia Fajã d'Água");
  });

  it("filters by search query matching name", () => {
    useMapStore.setState({ searchQuery: "Fontainhas" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");
  });

  it("filters by search query matching description", () => {
    useMapStore.setState({ searchQuery: "black sand" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("2");
  });

  it("returns empty when layer visibility is 'none'", () => {
    useMapStore.setState({ layerVisibility: "none" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(0);
  });

  it("returns locations when layer visibility is 'all'", () => {
    useMapStore.setState({ layerVisibility: "all" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(3);
  });

  it("combines category and search filters", () => {
    useMapStore.setState({ activeCategory: "Nature", searchQuery: "peak" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Monte Fontainhas");
  });

  it("shows settlements, not place records, in Settlements mode", () => {
    useMapStore.setState({ mapMode: "settlements" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current.map((l) => l.id)).toEqual(["nova-sintra", "minhoto"]);
  });

  it("ignores a category left over from Place records in Settlements mode", () => {
    useMapStore.setState({ mapMode: "settlements", activeCategory: "Beach" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(2);
  });

  it("searches settlements in Settlements mode", () => {
    useMapStore.setState({ mapMode: "settlements", searchQuery: "hamlet" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current.map((l) => l.id)).toEqual(["minhoto"]);
  });

  it("returns empty when combined filters match nothing", () => {
    useMapStore.setState({ activeCategory: "Beach", searchQuery: "church" });

    const { result } = renderHook(() => useFilteredLocations());
    expect(result.current).toHaveLength(0);
  });
});
