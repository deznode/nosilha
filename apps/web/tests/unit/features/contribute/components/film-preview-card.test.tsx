import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FilmPreviewCard } from "@/features/contribute/components/film-preview-card";

describe("FilmPreviewCard", () => {
  it("shows the YouTube thumbnail from i.ytimg.com and the recognised caption", () => {
    render(<FilmPreviewCard platform="YOUTUBE" externalId="k3Zq8XfT0aE" />);

    const img = screen.getByAltText("YouTube thumbnail");
    expect(img).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/k3Zq8XfT0aE/hqdefault.jpg"
    );
    expect(screen.getByText(/YouTube link recognised/)).toBeInTheDocument();
    expect(screen.getByText("k3Zq8XfT0aE")).toBeInTheDocument();
  });

  it("shows the ochre frame for Vimeo and makes no image request", () => {
    const { container } = render(
      <FilmPreviewCard platform="VIMEO" externalId="218447301" />
    );

    expect(screen.getByText("Vimeo")).toBeInTheDocument();
    expect(
      screen.getByText("Vimeo doesn't share a preview image")
    ).toBeInTheDocument();
    expect(screen.getByText(/Vimeo link recognised/)).toBeInTheDocument();
    expect(screen.getByText("218447301")).toBeInTheDocument();
    // No <img> at all — Vimeo has no thumbnail endpoint, so no image request.
    expect(container.querySelector("img")).toBeNull();
  });
});
