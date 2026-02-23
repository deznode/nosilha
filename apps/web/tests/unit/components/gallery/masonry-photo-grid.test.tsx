import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MasonryPhotoGrid,
  MasonryPhotoGridSkeleton,
} from "@/components/gallery/masonry-photo-grid";
import type { MediaItem } from "@/types/media";

// Mock ImageLightbox to avoid deep dependency chain (ShareButton → useToast → ToastProvider)
vi.mock("@/components/ui/image-lightbox", () => ({
  ImageLightbox: () => null,
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...filterMotionProps(props)}>{children}</div>
      ),
    },
    useReducedMotion: () => true,
  };
});

// Filter out framer-motion specific props that shouldn't go to DOM
function filterMotionProps(props: Record<string, unknown>) {
  const motionKeys = [
    "variants",
    "initial",
    "animate",
    "exit",
    "whileHover",
    "whileTap",
    "layout",
    "layoutId",
    "transition",
  ];
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionKeys.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

const mockPhotos: MediaItem[] = [
  {
    id: "1",
    type: "IMAGE",
    url: "https://example.com/photo1.jpg",
    title: "Heritage Building",
    description: "An old colonial building",
    category: "Heritage",
    date: "Jan 2025",
    author: "Maria Silva",
    locationName: "Nova Sintra",
  },
  {
    id: "2",
    type: "IMAGE",
    url: "https://example.com/photo2.jpg",
    title: "Mountain Trail",
    description: "Hiking in the highlands",
    category: "Nature",
    date: "Feb 2025",
    author: "João Costa",
    locationName: "Monte Fontainhas",
  },
  {
    id: "3",
    type: "IMAGE",
    url: "https://example.com/photo3.jpg",
    title: "Festival Dance",
    category: "Culture",
    date: "Mar 2025",
  },
];

describe("MasonryPhotoGrid", () => {
  describe("mediaItemToPhoto bridge (tested via rendering)", () => {
    it("renders photo titles from MediaItem data", () => {
      render(<MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />);

      expect(screen.getByText("Heritage Building")).toBeInTheDocument();
      expect(screen.getByText("Mountain Trail")).toBeInTheDocument();
      expect(screen.getByText("Festival Dance")).toBeInTheDocument();
    });

    it("renders author credit, falling back to Anonymous", () => {
      render(<MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />);

      // Photos with authors show credit
      expect(screen.getByText("Maria Silva")).toBeInTheDocument();
      expect(screen.getByText("João Costa")).toBeInTheDocument();
      // Photo without author falls back to "Anonymous"
      expect(screen.getByText("Anonymous")).toBeInTheDocument();
    });

    it("renders descriptions when present", () => {
      render(<MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />);

      expect(screen.getByText("An old colonial building")).toBeInTheDocument();
      expect(screen.getByText("Hiking in the highlands")).toBeInTheDocument();
    });

    it("renders date badges when present", () => {
      render(<MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />);

      expect(screen.getByText("Jan 2025")).toBeInTheDocument();
      expect(screen.getByText("Feb 2025")).toBeInTheDocument();
    });
  });

  describe("rendering with server-side filtered data", () => {
    it("renders all provided photos (server returns unfiltered)", () => {
      render(<MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />);

      expect(screen.getByText("Heritage Building")).toBeInTheDocument();
      expect(screen.getByText("Mountain Trail")).toBeInTheDocument();
      expect(screen.getByText("Festival Dance")).toBeInTheDocument();
    });

    it("renders only the photos passed in (server pre-filters by category)", () => {
      const heritageOnly = mockPhotos.filter((p) => p.category === "Heritage");
      render(
        <MasonryPhotoGrid photos={heritageOnly} categoryFilter="Heritage" />
      );

      expect(screen.getByText("Heritage Building")).toBeInTheDocument();
      expect(screen.queryByText("Mountain Trail")).not.toBeInTheDocument();
      expect(screen.queryByText("Festival Dance")).not.toBeInTheDocument();
    });

    it("renders empty state with category heading when no photos provided", () => {
      render(<MasonryPhotoGrid photos={[]} categoryFilter="Event" />);

      expect(screen.getByText("No Event photos yet")).toBeInTheDocument();
    });
  });
});

describe("MasonryPhotoGridSkeleton", () => {
  it("renders card skeletons", () => {
    const { container } = render(<MasonryPhotoGridSkeleton />);

    // Should render skeleton cards with varying heights
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
