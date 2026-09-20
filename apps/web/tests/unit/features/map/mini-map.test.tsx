import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MiniMap } from "@/features/map/components/mini-map";
import { MiniMapCanvas } from "@/features/map/components/mini-map-canvas";
import { STATUS_CONFIG } from "@/lib/status";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

/**
 * The real map is mocked: this test is about what the MiniMap asks for — its basemap,
 * its marker colour and whether it remounts on a theme change — not about MapLibre.
 */
const mapRenders = vi.fn();
const mapMounts = vi.fn();

vi.mock("@/features/map/shared", () => ({
  BaseMap: ({
    children,
    style,
    center,
    zoom,
    mapProps,
  }: {
    children?: React.ReactNode;
    style?: string;
    center?: { lat: number; lng: number };
    zoom?: number;
    mapProps?: Record<string, unknown>;
  }) => {
    mapRenders({ style, center, zoom, mapProps });
    // A mount-only effect: this fires once per real mount, so it distinguishes a
    // rebuilt map from a re-rendered one — which the theme `key` is there to force.
    useEffect(() => {
      mapMounts();
    }, []);
    return (
      <div data-testid="base-map" data-style={style} data-zoom={zoom}>
        {children}
      </div>
    );
  },
}));

vi.mock("react-map-gl/maplibre", () => ({
  Marker: ({
    children,
    latitude,
    longitude,
  }: {
    children?: React.ReactNode;
    latitude: number;
    longitude: number;
  }) => (
    <div data-testid="marker" data-lat={latitude} data-lng={longitude}>
      {children}
    </div>
  ),
}));

describe("MiniMapCanvas", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "light" });
    mapRenders.mockClear();
    mapMounts.mockClear();
  });

  afterEach(() => {
    media.restore();
  });

  const props = {
    lat: 14.858,
    lng: -24.718,
    status: "documented" as const,
  };

  it("centres on the given point at the given zoom", () => {
    render(<MiniMapCanvas {...props} zoom={13} />);

    expect(mapRenders).toHaveBeenCalledWith(
      expect.objectContaining({
        center: { lat: 14.858, lng: -24.718 },
        zoom: 13,
      })
    );
    const marker = screen.getByTestId("marker");
    expect(marker).toHaveAttribute("data-lat", "14.858");
    expect(marker).toHaveAttribute("data-lng", "-24.718");
  });

  it("holds the requested height open before the map has loaded", () => {
    const { container } = render(<MiniMap {...props} height={180} />);

    // The wrapper is what page code renders; the canvas inside is loaded lazily,
    // so the placeholder must not be shorter than the map that replaces it.
    expect(container.firstElementChild).toHaveStyle({ height: "180px" });
  });

  it("defaults to a 160px box", () => {
    const { container } = render(<MiniMap {...props} />);

    expect(container.firstElementChild).toHaveStyle({ height: "160px" });
  });

  describe("basemap", () => {
    it("uses positron in light", () => {
      render(<MiniMapCanvas {...props} />);

      expect(
        screen.getByTestId("base-map").getAttribute("data-style")
      ).toContain("positron");
    });

    it("uses dark-matter in dark", () => {
      useUiStore.setState({ theme: "dark" });
      render(<MiniMapCanvas {...props} />);

      expect(
        screen.getByTestId("base-map").getAttribute("data-style")
      ).toContain("dark-matter");
    });
  });

  describe("marker", () => {
    it.each(["documented", "partial", "name"] as const)(
      "colours a %s point from the one status table",
      (status) => {
        render(<MiniMapCanvas {...props} status={status} />);

        const dot = screen.getByTestId("mini-map-marker");
        expect(dot).toHaveStyle({
          background: `var(${STATUS_CONFIG[status].token})`,
        });
      }
    );

    it("rings the marker with a tint of the same status colour", () => {
      render(<MiniMapCanvas {...props} status="partial" />);

      const dot = screen.getByTestId("mini-map-marker");
      // color-mix keeps the ring on the same token, so it follows the theme too
      expect(dot.style.boxShadow).toContain("color-mix");
      expect(dot.style.boxShadow).toContain(STATUS_CONFIG.partial.token);
    });
  });

  /**
   * Spec 034 T-24, found in the browser during Wave 5: `BaseMap` renders
   * `position: absolute; inset: 0`, which resolves against the nearest *positioned*
   * ancestor. With none, the map sized itself to the viewport and covered the whole
   * page — and the sized box's `overflow-hidden` could not clip it, because clipping
   * only reaches descendants whose containing block is inside the clipper.
   */
  it("gives the map a positioned ancestor to size against", () => {
    const { container } = render(<MiniMapCanvas {...props} />);
    const box = container.querySelector("[data-theme-key]") as HTMLElement;

    expect(box.className).toContain("relative");
  });

  it("is not interactive: every handler is off and attribution is hidden", () => {
    render(<MiniMapCanvas {...props} />);

    const { mapProps } = mapRenders.mock.calls[0][0];
    for (const handler of [
      "interactive",
      "dragPan",
      "dragRotate",
      "scrollZoom",
      "boxZoom",
      "doubleClickZoom",
      "keyboard",
      "touchZoomRotate",
      "attributionControl",
    ]) {
      expect(mapProps[handler]).toBe(false);
    }
  });

  /**
   * Counting mounts, not reading an attribute: `data-theme-key` is computed from the
   * same value as the `key`, so an earlier version of this test stayed green with
   * `key={resolvedTheme}` deleted — the exact thing it was meant to guard.
   * MapLibre's `setStyle` drops layers the incoming style does not declare, and the
   * two CARTO styles do not share a layer set, so the map must be rebuilt.
   */
  it("remounts on a theme change, so the basemap is rebuilt not repainted", () => {
    const { rerender } = render(<MiniMapCanvas {...props} />);
    expect(mapMounts).toHaveBeenCalledTimes(1);

    useUiStore.setState({ theme: "dark" });
    rerender(<MiniMapCanvas {...props} />);

    expect(mapMounts).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("base-map").getAttribute("data-style")).toContain(
      "dark-matter"
    );
  });

  it("does not remount when nothing about the theme changed", () => {
    const { rerender } = render(<MiniMapCanvas {...props} />);
    expect(mapMounts).toHaveBeenCalledTimes(1);

    rerender(<MiniMapCanvas {...props} zoom={15} />);

    expect(mapMounts).toHaveBeenCalledTimes(1);
  });
});
