import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapCanvas, labelPriority } from "@/features/map/components/map-canvas";
import { MAP_STYLES, SATELLITE_STYLE } from "@/features/map/data/constants";
import type { MapItem } from "@/features/map/data/types";
import { initialMapState, useMapStore } from "@/stores/mapStore";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../../setup/match-media-mock";

vi.mock("@/lib/api", () => ({}));

/** What the mocked map reports as its zoom when asked. */
let mapZoom = 12.1;
const baseMapProps = vi.fn();

vi.mock("@/features/map/shared", () => ({
  BaseMap: forwardRef(function BaseMap(
    {
      children,
      style,
      onLoad,
      onClick,
      mapProps,
    }: {
      children?: React.ReactNode;
      style?: unknown;
      onLoad?: () => void;
      onClick?: (event: unknown) => void;
      mapProps?: Record<string, unknown>;
    },
    ref
  ) {
    useImperativeHandle(ref, () => ({
      getMap: () => ({ getZoom: () => mapZoom }),
    }));
    baseMapProps({ style, onClick, mapProps });
    // MapLibre's load is always asynchronous, after every mount effect has run.
    useEffect(() => {
      void Promise.resolve().then(() => onLoad?.());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div
        data-testid="base-map"
        data-style={typeof style === "string" ? style : "inline"}
      >
        {children}
      </div>
    );
  }),
}));

vi.mock("react-map-gl/maplibre", () => ({
  Marker: ({
    children,
    offset,
    anchor,
    style,
  }: {
    children?: React.ReactNode;
    offset?: [number, number];
    anchor?: string;
    style?: React.CSSProperties;
  }) => (
    <div
      className="maplibregl-marker"
      data-testid="marker"
      data-offset={offset ? offset.join(",") : "0,0"}
      data-anchor={anchor ?? "center"}
      style={style}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  NavigationControl: () => null,
  Source: () => null,
}));

const DARK_SCHEME = "(prefers-color-scheme: dark)";

function settlement(
  slug: string,
  status: MapItem["status"],
  overrides: Partial<MapItem> = {}
): MapItem {
  return {
    key: `s:${slug}`,
    kind: "settlement",
    name: slug,
    eyebrow: "Settlement",
    description: "",
    coordinates: { lat: 14.8 + slug.length / 100, lng: -24.7 },
    status,
    hasRecords: status !== "name",
    href: `/${slug}`,
    regionSlug: slug,
    ...overrides,
  };
}

const nova = settlement("nova-sintra", "documented");
const faja = settlement("faja", "partial");
const furna = settlement("furna", "name");

function Harness() {
  const mapRef = useRef(null);
  return (
    <MapCanvas
      mapRef={mapRef}
      onSelect={(item) => useMapStore.getState().select(item.key)}
      onLoad={vi.fn()}
      userLocation={null}
    />
  );
}

async function renderCanvas() {
  render(<Harness />);
  await act(async () => {});
}

function pin(name: string) {
  return screen.getByRole("button", { name: new RegExp(`^${name},`) });
}

function marker(name: string) {
  return pin(name).closest("[data-testid=marker]") as HTMLElement;
}

function lastMapProps() {
  return baseMapProps.mock.calls.at(-1)![0] as {
    style: unknown;
    onClick: (event: unknown) => void;
    mapProps: Record<string, unknown>;
  };
}

describe("labelPriority", () => {
  it("labels the selected pin at any zoom", () => {
    expect(labelPriority(furna, true, false)).toBe(3);
  });

  it("labels nothing else below the zoom floor", () => {
    expect(labelPriority(nova, false, false)).toBeNull();
    expect(labelPriority(faja, false, false)).toBeNull();
  });

  it("labels documented pins and settlements with records above it", () => {
    expect(labelPriority(nova, false, true)).toBe(2);
    expect(labelPriority(faja, false, true)).toBe(1);
    expect(labelPriority(furna, false, true)).toBeNull();
  });
});

describe("MapCanvas", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    mapZoom = 12.1;
    baseMapProps.mockClear();
    useUiStore.setState({ theme: "light" });
    useMapStore.setState({
      ...initialMapState,
      isLoading: false,
      settlements: [nova, faja, furna],
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  });

  afterEach(() => {
    media.restore();
    vi.restoreAllMocks();
  });

  it("follows the theme with positron and dark-matter", async () => {
    await renderCanvas();
    expect(screen.getByTestId("base-map")).toHaveAttribute(
      "data-style",
      MAP_STYLES.positron
    );

    act(() => useUiStore.setState({ theme: "dark" }));
    expect(screen.getByTestId("base-map")).toHaveAttribute(
      "data-style",
      MAP_STYLES.darkMatter
    );
  });

  it("switches to the satellite raster and back", async () => {
    await renderCanvas();
    act(() => useMapStore.getState().toggleSatellite());
    expect(lastMapProps().style).toBe(SATELLITE_STYLE);

    act(() => useMapStore.getState().toggleSatellite());
    expect(lastMapProps().style).toBe(MAP_STYLES.positron);
  });

  it("repaints pins on a theme switch without rebuilding them", async () => {
    await renderCanvas();
    const before = pin("nova-sintra");

    act(() => useUiStore.setState({ theme: "dark" }));

    // The same DOM node: the marker was not torn down, and its colour is a
    // variable the `.dark` class re-points.
    expect(pin("nova-sintra")).toBe(before);
    expect(
      (before.querySelector("[data-pin-dot]") as HTMLElement).style.background
    ).toBe("var(--brand-valley-green)");
  });

  it("pins every visible item, and only those", async () => {
    await renderCanvas();
    expect(screen.getAllByTestId("marker")).toHaveLength(3);

    act(() => useMapStore.getState().setStatus("name"));
    expect(screen.getAllByTestId("marker")).toHaveLength(1);
    expect(pin("furna")).toBeInTheDocument();
  });

  it("anchors each pin at its dot, so a label never moves it", async () => {
    await renderCanvas();
    expect(marker("furna")).toHaveAttribute("data-anchor", "top");
    expect(marker("furna")).toHaveAttribute("data-offset", "0,-11");
  });

  it("labels nothing at the opening zoom but the selected pin", async () => {
    await renderCanvas();
    expect(document.querySelectorAll("[data-pin-label]")).toHaveLength(0);

    act(() => useMapStore.getState().select("s:furna"));
    const labels = document.querySelectorAll("[data-pin-label]");
    expect(labels).toHaveLength(1);
    expect(labels[0]).toHaveTextContent("furna");
    expect(marker("furna").style.zIndex).toBe("3");
  });

  it("labels documented pins and settlements with records past zoom 13", async () => {
    await renderCanvas();
    const onZoomEnd = lastMapProps().mapProps.onZoomEnd as (e: unknown) => void;

    act(() => onZoomEnd({ target: { getZoom: () => 14 } }));

    const labelled = [...document.querySelectorAll("[data-pin-label]")].map(
      (label) => label.textContent
    );
    expect(labelled).toEqual(["nova-sintra", "faja"]);

    act(() => onZoomEnd({ target: { getZoom: () => 13 } }));
    expect(document.querySelectorAll("[data-pin-label]")).toHaveLength(0);
  });

  it("reads the zoom floor from the map once it loads", async () => {
    mapZoom = 14.5;
    await renderCanvas();
    expect(document.querySelectorAll("[data-pin-label]")).toHaveLength(2);
  });

  describe("coincident records", () => {
    const shared = { lat: 14.87306, lng: -24.73194 };
    const pool = settlement("pools", "partial", {
      key: "r:pools",
      kind: "record",
      coordinates: shared,
    });
    const hotel = settlement("hotel", "partial", {
      key: "r:hotel",
      kind: "record",
      coordinates: shared,
    });

    beforeEach(() => {
      useMapStore.setState({ mode: "records", records: [pool, hotel] });
    });

    it("draws one ring with the count instead of stacked pins", async () => {
      await renderCanvas();
      expect(
        screen.getByRole("button", { name: "2 records at one point" })
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^pools,/ })).toBeNull();
    });

    it("fans them 34px apart on click", async () => {
      await renderCanvas();
      fireEvent.click(
        screen.getByRole("button", { name: "2 records at one point" })
      );

      expect(
        screen.queryByRole("button", { name: /records at one point/ })
      ).toBeNull();
      expect(marker("pools")).toHaveAttribute("data-offset", "-34,-17");
      expect(marker("hotel")).toHaveAttribute("data-offset", "34,-17");
    });

    it("keeps the fan open around a selected member", async () => {
      useMapStore.setState({ selectedKey: "r:hotel" });
      await renderCanvas();
      expect(pin("hotel")).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("previews a hovered pin and drops the preview on leave", async () => {
    await renderCanvas();
    fireEvent.mouseEnter(pin("faja"));

    const popup = screen.getByTestId("popup");
    expect(within(popup).getByText("faja")).toBeInTheDocument();
    expect(
      within(popup).getByText("records, no photograph")
    ).toBeInTheDocument();
    expect(marker("faja").style.zIndex).toBe("2");

    fireEvent.mouseLeave(pin("faja"));
    expect(screen.queryByTestId("popup")).toBeNull();
  });

  it("selects on a pin click", async () => {
    await renderCanvas();
    fireEvent.click(pin("faja"));
    expect(useMapStore.getState().selectedKey).toBe("s:faja");
  });

  describe("map clicks", () => {
    it("ignore clicks that started on a marker", async () => {
      await renderCanvas();
      act(() => useMapStore.getState().select("s:faja"));

      act(() =>
        lastMapProps().onClick({ originalEvent: { target: pin("faja") } })
      );
      expect(useMapStore.getState().selectedKey).toBe("s:faja");
    });

    it("clear the selection and the fan on the open map", async () => {
      await renderCanvas();
      act(() => {
        useMapStore.getState().select("s:faja");
        useMapStore.getState().setExpandedGroup("g");
      });

      act(() =>
        lastMapProps().onClick({
          originalEvent: { target: screen.getByTestId("base-map") },
        })
      );
      expect(useMapStore.getState().selectedKey).toBeNull();
      expect(useMapStore.getState().expandedGroupKey).toBeNull();
    });
  });
});
