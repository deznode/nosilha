import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  MapHoverCard,
  MapHoverPopup,
} from "@/features/map/components/map-hover-popup";
import type { MapItem } from "@/features/map/data/types";

const popupProps = vi.fn();

vi.mock("react-map-gl/maplibre", () => ({
  Popup: ({
    children,
    ...props
  }: { children?: React.ReactNode } & Record<string, unknown>) => {
    popupProps(props);
    return <div data-testid="popup">{children}</div>;
  },
}));

const photo: MapItem = {
  key: "p:1",
  kind: "photo",
  name: "Untitled",
  eyebrow: "Photograph",
  description: "",
  coordinates: { lat: 14.86, lng: -24.71 },
  status: "partial",
  hasRecords: false,
  href: "/photographs/1",
  regionSlug: "nova-sintra",
  image: "https://r2.example/DJI_0047.JPG",
  filename: "DJI_0047.JPG",
  placeName: null,
  credit: null,
};

const church: MapItem = {
  key: "r:igreja",
  kind: "record",
  name: "Igreja Nossa Senhora do Monte",
  eyebrow: "Heritage",
  description: "",
  coordinates: { lat: 14.856, lng: -24.728 },
  status: "documented",
  hasRecords: false,
  href: "/nossa-senhora-do-monte/igreja",
  regionSlug: "nossa-senhora-do-monte",
};

describe("MapHoverCard", () => {
  it("shows a photograph's image, title, filename and status", () => {
    const { container } = render(<MapHoverCard item={photo} />);

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://r2.example/DJI_0047.JPG"
    );
    expect(screen.getByText("Untitled")).toBeInTheDocument();
    expect(screen.getByText("DJI_0047.JPG").className).toContain("font-mono");
    expect(screen.getByText("coordinates, no place name")).toBeInTheDocument();
  });

  it("shows a place's eyebrow and status, with no image", () => {
    const { container } = render(<MapHoverCard item={church} />);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Heritage").className).toContain("uppercase");
    expect(screen.getByText("documented")).toBeInTheDocument();
    const dot = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(dot.style.background).toBe("var(--brand-valley-green)");
  });

  it("is 220px wide", () => {
    render(<MapHoverCard item={church} />);
    expect(screen.getByTestId("map-hover-card").className).toContain(
      "w-[220px]"
    );
  });
});

describe("MapHoverPopup", () => {
  it("opens at the pin with no close button, no tip and an 18px offset", () => {
    render(<MapHoverPopup item={church} />);

    expect(popupProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        longitude: -24.728,
        latitude: 14.856,
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        maxWidth: "240px",
        className: "map-hover-popup",
      })
    );
  });
});
