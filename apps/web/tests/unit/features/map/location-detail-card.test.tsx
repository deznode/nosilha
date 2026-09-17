import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LocationDetailCard } from "@/features/map/components/location-detail-card";
import type { MapItem } from "@/features/map/data/types";

const furna: MapItem = {
  key: "s:furna",
  kind: "settlement",
  name: "Furna",
  eyebrow: "Settlement",
  description: "",
  coordinates: { lat: 14.88, lng: -24.68 },
  status: "name",
  hasRecords: false,
  href: "/furna",
  regionSlug: "furna",
  recordCount: 0,
};

const record: MapItem = {
  key: "r:nos-raiz",
  kind: "record",
  name: "Nos Raiz",
  eyebrow: "Stay",
  description: "A guesthouse by the pools.",
  coordinates: { lat: 14.873, lng: -24.732 },
  status: "partial",
  hasRecords: false,
  href: "/faja-de-agua/nos-raiz",
  regionSlug: "faja-de-agua",
};

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
  filename: "DJI_0047.JPG",
  placeName: null,
  credit: null,
};

function renderCard(item: MapItem, bottom = 62) {
  const onClose = vi.fn();
  render(<LocationDetailCard item={item} bottom={bottom} onClose={onClose} />);
  return { onClose, card: screen.getByRole("region") };
}

describe("LocationDetailCard", () => {
  it("words a name-only settlement and offers both actions", () => {
    const { card } = renderCard(furna);

    expect(card).toHaveAccessibleName("Selected: Furna");
    expect(screen.getByText("Settlement")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Furna" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("name only · nothing recorded here yet")
    ).toBeInTheDocument();
    expect(screen.getByText(/the archive is listening/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open settlement" })
    ).toHaveAttribute("href", "/furna");
    expect(
      screen.getByRole("link", { name: "Filter photographs to this area" })
    ).toHaveAttribute("href", "/photographs?region=furna");
  });

  it("words a record and opens it under its settlement", () => {
    renderCard(record);

    expect(screen.getByText("Stay")).toBeInTheDocument();
    expect(screen.getByText("no photograph recorded")).toBeInTheDocument();
    expect(screen.getByText("A guesthouse by the pools.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open record" })).toHaveAttribute(
      "href",
      "/faja-de-agua/nos-raiz"
    );
    expect(
      screen.getByRole("link", { name: "Filter photographs to this area" })
    ).toHaveAttribute("href", "/photographs?region=faja-de-agua");
  });

  it("words a photograph with its filename in the eyebrow", () => {
    renderCard(photo);

    expect(screen.getByText("Photograph · DJI_0047.JPG")).toBeInTheDocument();
    expect(
      screen.getByText("coordinates from the file · no place name")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open photograph" })
    ).toHaveAttribute("href", "/photographs/1");
  });

  it("offers neither action for a record whose settlement has not resolved", () => {
    renderCard({ ...record, href: null, regionSlug: null });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("sits at the offset it is given, 62px on a wide screen", () => {
    const { card } = renderCard(furna);
    expect(card.style.bottom).toBe("62px");
  });

  it("uses the primary token for its main action, so it passes contrast in both themes", () => {
    renderCard(furna);
    expect(
      screen.getByRole("link", { name: "Open settlement" }).className
    ).toContain("bg-primary");
  });

  it("closes", () => {
    const { onClose } = renderCard(furna);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
