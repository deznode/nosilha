import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocationSheetDetail } from "@/features/map/components/location-sheet-detail";
import type { MapItem } from "@/features/map/data/types";

const photo: MapItem = {
  key: "p:1",
  kind: "photo",
  name: "Untitled",
  eyebrow: "Photograph",
  description: "A building with a tiled roof. ".repeat(30),
  coordinates: { lat: 14.86, lng: -24.71 },
  status: "partial",
  hasRecords: false,
  href: "/photographs/1",
  regionSlug: "nova-sintra",
  placeName: null,
  credit: null,
};

function renderDetail() {
  const onClose = vi.fn();
  render(<LocationSheetDetail item={photo} onClose={onClose} />);
  return { onClose };
}

describe("LocationSheetDetail", () => {
  it("names its region after the selection", () => {
    renderDetail();
    expect(
      screen.getByRole("region", { name: "Selected: Untitled" })
    ).toBeInTheDocument();
  });

  it("keeps Close in the header row, outside the scrolling body", () => {
    renderDetail();
    const close = screen.getByRole("button", { name: "Close" });
    expect(close.className).toContain("size-11");
    expect(close.closest(".overflow-y-auto")).toBeNull();
  });

  it("closes", () => {
    const { onClose } = renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clamps the description and offers both actions", () => {
    renderDetail();
    expect(screen.getByText(/tiled roof/).className).toContain("line-clamp-3");
    expect(
      screen.getByRole("link", { name: "Open photograph" })
    ).toHaveAttribute("href", "/photographs/1");
    expect(
      screen.getByRole("link", { name: "Filter photographs to this area" })
    ).toHaveAttribute("href", "/photographs?region=nova-sintra");
  });

  it("renders only one Close, not the body's own", () => {
    renderDetail();
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
  });
});
