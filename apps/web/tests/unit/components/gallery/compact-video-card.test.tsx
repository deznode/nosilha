import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CompactVideoCard } from "@/components/gallery/compact-video-card";
import type { MediaItem } from "@/types/media";

// Mock framer-motion to avoid animation issues in unit tests.
// next/image is mocked globally in tests/setup/vitest.setup.tsx.
vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

const mockVideoItem: MediaItem = {
  id: "video-1",
  type: "VIDEO",
  title: "Morna de Brava Performance",
  category: "Culture",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  duration: 215, // 3:35
  author: "Eugénio Tavares Ensemble",
  date: "2026-03-01T12:00:00Z",
};

const mockPodcastItem: MediaItem = {
  id: "podcast-1",
  type: "VIDEO",
  title: "Brava Diaspora Podcast Episode 4",
  category: "Interview",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  duration: 1845, // 30:45
  author: "Brava Cultural Radio",
  date: "2026-03-02T12:00:00Z",
};

describe("CompactVideoCard", () => {
  it("renders video card details correctly", () => {
    render(<CompactVideoCard item={mockVideoItem} />);

    expect(screen.getByText("Morna de Brava Performance")).toBeInTheDocument();
    expect(screen.getByText("Eugénio Tavares Ensemble")).toBeInTheDocument();
    expect(screen.getByText("3:35")).toBeInTheDocument();
    expect(screen.getByText("Culture")).toBeInTheDocument();
  });

  it("renders podcast styling badge and accent border for podcast items", () => {
    render(<CompactVideoCard item={mockPodcastItem} />);

    expect(screen.getByText("Podcast")).toBeInTheDocument();
    expect(screen.getByText("30:45")).toBeInTheDocument();
  });

  it("triggers onSelect callback when promoted", () => {
    const handleSelect = vi.fn();
    render(<CompactVideoCard item={mockVideoItem} onSelect={handleSelect} />);

    const button = screen.getByRole("button", {
      name: /play morna de brava performance/i,
    });
    fireEvent.click(button);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockVideoItem);
  });

  it("applies active ring highlight when isActive is true", () => {
    const { container } = render(
      <CompactVideoCard item={mockVideoItem} isActive={true} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("ring-bougainvillea-pink");
  });
});
