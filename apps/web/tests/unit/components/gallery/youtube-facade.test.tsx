import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

const mockVideo: MediaItem = {
  id: "v1",
  type: "VIDEO",
  url: "https://www.youtube.com/embed/abc123",
  thumbnailUrl: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
  title: "Test Video",
  description: "A test video",
  category: "Culture",
  date: "Jan 2025",
};

describe("YouTubeFacade", () => {
  it("renders thumbnail with play button, not iframe", () => {
    render(<YouTubeFacade video={mockVideo} />);

    expect(
      screen.getByRole("button", { name: /play test video/i })
    ).toBeInTheDocument();
    expect(screen.getByAltText("Test Video")).toBeInTheDocument();
    expect(screen.queryByTitle("Test Video")).not.toBeInTheDocument();
  });

  it("activates iframe with autoplay on click", async () => {
    const user = userEvent.setup();
    render(<YouTubeFacade video={mockVideo} />);

    await user.click(screen.getByRole("button", { name: /play test video/i }));

    const iframe = screen.getByTitle("Test Video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123?autoplay=1"
    );
  });

  it("appends autoplay=1 correctly with existing query params", async () => {
    const user = userEvent.setup();
    const videoWithParams: MediaItem = {
      ...mockVideo,
      url: "https://www.youtube.com/embed/abc123?rel=0",
    };
    render(<YouTubeFacade video={videoWithParams} />);

    await user.click(screen.getByRole("button", { name: /play test video/i }));

    const iframe = screen.getByTitle("Test Video");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123?rel=0&autoplay=1"
    );
  });

  it("has correct aria-label on play button", () => {
    render(<YouTubeFacade video={mockVideo} />);

    expect(
      screen.getByRole("button", { name: "Play Test Video" })
    ).toBeInTheDocument();
  });

  it("falls back to generic label when title is missing", () => {
    const videoNoTitle: MediaItem = {
      ...mockVideo,
      title: "",
    };
    render(<YouTubeFacade video={videoNoTitle} />);

    expect(
      screen.getByRole("button", { name: "Play video" })
    ).toBeInTheDocument();
  });
});
