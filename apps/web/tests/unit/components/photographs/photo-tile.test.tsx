import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PhotoTile } from "@/components/photographs/photo-tile";
import type { PublicUserUploadMedia } from "@/types/gallery";

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "p1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/DJI_0177.JPG",
    originalName: "DJI_0177.JPG",
    width: 388,
    height: 287,
    ...overrides,
  };
}

/** Spec 034 T-30 / FR-009, FR-019 — a tile holds its shape and names its gaps. */
describe("PhotoTile", () => {
  it("reserves the stored aspect ratio before the image loads", () => {
    const { container } = render(<PhotoTile media={upload()} />);
    const frame = container.querySelector(
      '[style*="aspect-ratio"]'
    ) as HTMLElement;

    expect(frame.style.aspectRatio).toBe("388 / 287");
  });

  it("falls back for a row that predates the dimension backfill", () => {
    const { container } = render(
      <PhotoTile media={upload({ width: null, height: null })} />
    );
    const frame = container.querySelector(
      '[style*="aspect-ratio"]'
    ) as HTMLElement;

    expect(frame.style.aspectRatio).toBe("388 / 300");
  });

  it("prints the filename and opens the record", () => {
    render(<PhotoTile media={upload()} />);

    expect(screen.getByText("DJI_0177.JPG")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/photographs/p1");
  });

  it("labels a located record On map", () => {
    render(
      <PhotoTile media={upload({ latitude: 14.86, longitude: -24.71 })} />
    );
    expect(screen.getByText("On map")).toBeInTheDocument();
  });

  it("does not claim a record is on the map without coordinates", () => {
    render(<PhotoTile media={upload()} />);
    expect(screen.queryByText("On map")).not.toBeInTheDocument();
  });

  it("shows Untitled in italic for a record with no title", () => {
    render(<PhotoTile media={upload()} />);
    const title = screen.getByText("Untitled");

    expect(title).toHaveStyle({ fontStyle: "italic" });
  });

  it("pills every missing field and every known one", () => {
    render(
      <PhotoTile
        media={upload({
          title: "Lomba Tantun",
          category: "Landscape",
          dateTaken: "2024-07-12T10:00:00Z",
          latitude: 14.86,
          longitude: -24.71,
        })}
      />
    );

    const tile = screen.getByRole("link");
    expect(within(tile).getByText("no photographer")).toBeInTheDocument();
    expect(within(tile).getByText("July 12, 2024")).toBeInTheDocument();
    expect(within(tile).getByText("Landscape")).toBeInTheDocument();
    expect(within(tile).queryByText("no place")).not.toBeInTheDocument();
    expect(within(tile).queryByText("no title")).not.toBeInTheDocument();
  });
});
