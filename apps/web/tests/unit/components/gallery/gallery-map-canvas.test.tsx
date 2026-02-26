import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MediaItem } from "@/types/media";

// --- Mocks ---

// Mock react-map-gl/mapbox — render children for Marker/Popup
vi.mock("react-map-gl/mapbox", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
}));

// Mock shared map primitives — BaseMap renders children, useMapClustering passes through
vi.mock("@/features/map/shared", () => ({
  BaseMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-map">{children}</div>
  ),
  useMapClustering: ({ points }: { points: unknown[] }) => ({
    clusters: points ?? [],
    expandCluster: () => 14,
  }),
}));

// Mock MAP_CONFIG to avoid importing zone/trail GeoJSON files
vi.mock("@/features/map/data/constants", () => ({
  MAP_CONFIG: {
    DEFAULT_CENTER: { lng: -24.7, lat: 14.86 },
    DEFAULT_ZOOM: 12.5,
    LOCATION_ZOOM: 15,
    EASE_DURATION: 500,
    ANIMATION_DURATION: 2000,
  },
}));

import { GalleryMapCanvas } from "@/components/gallery/gallery-map-canvas";

// --- Fixtures ---

const geoPhotos: MediaItem[] = [
  {
    id: "photo-1",
    type: "IMAGE",
    url: "https://media.nosilha.com/photo1.jpg",
    thumbnailUrl: "https://media.nosilha.com/photo1_thumb.jpg",
    title: "Church of São João Baptista",
    category: "Heritage",
    latitude: 14.868,
    longitude: -24.696,
  },
  {
    id: "photo-2",
    type: "IMAGE",
    url: "https://media.nosilha.com/photo2.jpg",
    thumbnailUrl: "https://media.nosilha.com/photo2_thumb.jpg",
    title: "Fajã d'Água Viewpoint",
    category: "Nature",
    latitude: 14.851,
    longitude: -24.713,
  },
];

const noGeoPhotos: MediaItem[] = [
  {
    id: "photo-3",
    type: "IMAGE",
    url: "https://media.nosilha.com/photo3.jpg",
    title: "Old Town Square",
    category: "Heritage",
  },
];

// --- Tests ---

describe("GalleryMapCanvas", () => {
  describe("populated state", () => {
    it("renders markers for geo-tagged photos", () => {
      render(<GalleryMapCanvas photos={geoPhotos} onPhotoSelect={vi.fn()} />);

      const markers = screen.getAllByTestId("map-marker");
      expect(markers).toHaveLength(2);
    });

    it("renders marker buttons with correct aria-labels", () => {
      render(<GalleryMapCanvas photos={geoPhotos} onPhotoSelect={vi.fn()} />);

      expect(
        screen.getByRole("button", {
          name: "View photo: Church of São João Baptista",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "View photo: Fajã d'Água Viewpoint",
        })
      ).toBeInTheDocument();
    });

    it("excludes photos without coordinates from markers", () => {
      const mixed = [...geoPhotos, ...noGeoPhotos];
      render(<GalleryMapCanvas photos={mixed} onPhotoSelect={vi.fn()} />);

      const markers = screen.getAllByTestId("map-marker");
      expect(markers).toHaveLength(2);
    });

    it("shows photo count badge with correct count", () => {
      render(<GalleryMapCanvas photos={geoPhotos} onPhotoSelect={vi.fn()} />);

      expect(
        screen.getByText("2 photos with locations")
      ).toBeInTheDocument();
    });

    it("shows singular 'photo' for single geo-tagged item", () => {
      render(
        <GalleryMapCanvas photos={[geoPhotos[0]]} onPhotoSelect={vi.fn()} />
      );

      expect(
        screen.getByText("1 photo with locations")
      ).toBeInTheDocument();
    });

    it("renders map container with correct ARIA attributes", () => {
      render(<GalleryMapCanvas photos={geoPhotos} onPhotoSelect={vi.fn()} />);

      const mapContainer = screen.getByRole("application");
      expect(mapContainer).toHaveAttribute(
        "aria-label",
        "Gallery photo map of Brava Island"
      );
    });
  });

  describe("empty state — no geo-tagged photos", () => {
    it("renders empty message when photos array is empty", () => {
      render(<GalleryMapCanvas photos={[]} onPhotoSelect={vi.fn()} />);

      expect(
        screen.getByText("No photos with location data yet")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Photos taken with GPS-enabled cameras will appear on this map."
        )
      ).toBeInTheDocument();
    });

    it("renders empty message when no photos have coordinates", () => {
      render(
        <GalleryMapCanvas photos={noGeoPhotos} onPhotoSelect={vi.fn()} />
      );

      expect(
        screen.getByText("No photos with location data yet")
      ).toBeInTheDocument();
    });

    it("renders 'Switch to Grid View' button when onViewChange provided", () => {
      render(
        <GalleryMapCanvas
          photos={[]}
          onPhotoSelect={vi.fn()}
          onViewChange={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: "Switch to Grid View" })
      ).toBeInTheDocument();
    });

    it("does not render 'Clear Filters' in unfiltered empty state", () => {
      render(
        <GalleryMapCanvas
          photos={[]}
          onPhotoSelect={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      expect(
        screen.queryByRole("button", { name: "Clear Filters" })
      ).not.toBeInTheDocument();
    });
  });

  describe("empty state — filtered, no geo matches", () => {
    it("renders filtered empty message when hasActiveFilters is true", () => {
      render(
        <GalleryMapCanvas
          photos={noGeoPhotos}
          onPhotoSelect={vi.fn()}
          hasActiveFilters
        />
      );

      expect(
        screen.getByText("No photos with locations match your filters")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters to see more results.")
      ).toBeInTheDocument();
    });

    it("renders 'Clear Filters' button when hasActiveFilters and onClearFilters", () => {
      render(
        <GalleryMapCanvas
          photos={noGeoPhotos}
          onPhotoSelect={vi.fn()}
          hasActiveFilters
          onClearFilters={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: "Clear Filters" })
      ).toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onViewChange with 'grid' when 'Switch to Grid View' clicked", async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <GalleryMapCanvas
          photos={[]}
          onPhotoSelect={vi.fn()}
          onViewChange={onViewChange}
        />
      );

      await user.click(
        screen.getByRole("button", { name: "Switch to Grid View" })
      );

      expect(onViewChange).toHaveBeenCalledWith("grid");
    });

    it("calls onClearFilters when 'Clear Filters' clicked", async () => {
      const user = userEvent.setup();
      const onClearFilters = vi.fn();

      render(
        <GalleryMapCanvas
          photos={noGeoPhotos}
          onPhotoSelect={vi.fn()}
          hasActiveFilters
          onClearFilters={onClearFilters}
        />
      );

      await user.click(
        screen.getByRole("button", { name: "Clear Filters" })
      );

      expect(onClearFilters).toHaveBeenCalledOnce();
    });
  });
});
