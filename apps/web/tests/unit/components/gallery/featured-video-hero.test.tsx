import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FeaturedVideoHero } from "@/components/gallery/featured-video-hero";
import type { MediaItem } from "@/types/media";

// Mock YouTubeFacade
vi.mock("@/components/gallery/youtube-facade", () => ({
  YouTubeFacade: ({ autoPlay }: { video: MediaItem; autoPlay?: boolean }) => (
    <div data-testid="youtube-facade" data-autoplay={autoPlay ? "true" : "false"} />
  ),
}));

const mockHeroVideo: MediaItem = {
  id: "hero-video-1",
  type: "VIDEO",
  title: "Featured Brava Festival Morna",
  category: "Culture",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  duration: 240, // 4:00
  author: "Brava Heritage Ensemble",
  date: "2026-03-01T12:00:00Z",
};

describe("FeaturedVideoHero", () => {
  it("renders null if no video is provided", () => {
    const { container } = render(<FeaturedVideoHero video={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders default 'Featured Video' label when not promoted", () => {
    render(<FeaturedVideoHero video={mockHeroVideo} isPromoted={false} />);

    expect(screen.getByText("Featured Video")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Featured Brava Festival Morna" })).toBeInTheDocument();
    expect(screen.getByText("4:00")).toBeInTheDocument();
    expect(screen.getByTestId("youtube-facade")).toHaveAttribute("data-autoplay", "false");
  });

  it("renders 'Now Playing' label and enables autoPlay when promoted", () => {
    render(<FeaturedVideoHero video={mockHeroVideo} isPromoted={true} />);

    expect(screen.getByText("Now Playing")).toBeInTheDocument();
    expect(screen.getByTestId("youtube-facade")).toHaveAttribute("data-autoplay", "true");
  });

  it("renders native iframe for mobile view when nativePlayer is true", () => {
    render(<FeaturedVideoHero video={mockHeroVideo} nativePlayer={true} />);

    const iframe = screen.getByTitle("Featured Brava Festival Morna");
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe("IFRAME");
  });
});
