import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MapPin, pinSize } from "@/features/map/components/map-pin";
import type { MapItem } from "@/features/map/data/types";

function item(overrides: Partial<MapItem> = {}): MapItem {
  return {
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
    ...overrides,
  };
}

function renderPin(props: Partial<Parameters<typeof MapPin>[0]> = {}) {
  const handlers = { onSelect: vi.fn(), onHover: vi.fn() };
  render(
    <MapPin
      item={item()}
      selected={false}
      showLabel={false}
      {...handlers}
      {...props}
    />
  );
  const pin = screen.getByRole("button");
  const dot = pin.querySelector("[data-pin-dot]") as HTMLElement;
  return { pin, dot, ...handlers };
}

describe("MapPin", () => {
  it("paints the dot from the status token, so a theme switch repaints it", () => {
    const { dot } = renderPin();
    expect(dot.style.background).toBe("var(--brand-sobrado-ochre)");
    expect(dot.style.border).toBe("2px solid var(--background)");
    // No resolved colour anywhere on the pin.
    expect(dot.getAttribute("style")).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("is 22px for a place and 26px for a photograph", () => {
    expect(pinSize({ kind: "settlement" })).toBe(22);
    expect(pinSize({ kind: "record" })).toBe(22);
    expect(pinSize({ kind: "photo" })).toBe(26);

    const { dot } = renderPin();
    expect(dot.style.width).toBe("22px");
  });

  it("marks the selected pin with a foreground edge and a halo", () => {
    const { pin, dot } = renderPin({ selected: true });
    expect(pin).toHaveAttribute("aria-pressed", "true");
    expect(dot.style.border).toBe("3px solid var(--foreground)");
    expect(dot.style.boxShadow).toContain("0 0 0 6px");
  });

  it("scales on hover through CSS, with the handoff's easing", () => {
    const { dot } = renderPin();
    expect(dot.className).toContain("group-hover:scale-[1.18]");
    expect(dot.className).toContain("ease-[cubic-bezier(.4,.14,.3,1)]");
  });

  it("shows a photograph as a thumbnail over its status colour", () => {
    const { dot } = renderPin({
      item: item({
        key: "p:1",
        kind: "photo",
        status: "partial",
        image: "https://r2.example/a.jpg",
      }),
    });
    expect(dot.style.width).toBe("26px");
    expect(dot.querySelector("img")).toHaveAttribute(
      "src",
      "https://r2.example/a.jpg"
    );
  });

  it("labels the pin only when asked, and keeps the label out of the pointer's way", () => {
    renderPin();
    expect(screen.queryByText("Furna")).not.toBeInTheDocument();
  });

  it("renders a label that the pointer passes through", () => {
    renderPin({ showLabel: true });
    const label = screen.getByText("Furna");
    expect(label.className).toContain("pointer-events-none");
  });

  it("selects on click without letting the click travel further", () => {
    const outer = vi.fn();
    const onSelect = vi.fn();
    render(
      <div onClick={outer}>
        <MapPin
          item={item()}
          selected={false}
          showLabel={false}
          onSelect={onSelect}
          onHover={vi.fn()}
        />
      </div>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(item());
    expect(outer).not.toHaveBeenCalled();
  });

  it("selects from the keyboard", () => {
    const { pin, onSelect } = renderPin();
    fireEvent.keyDown(pin, { key: "Enter" });
    fireEvent.keyDown(pin, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("reports hover and focus so the preview can follow", () => {
    const { pin, onHover } = renderPin();
    fireEvent.mouseEnter(pin);
    expect(onHover).toHaveBeenLastCalledWith(item());
    fireEvent.mouseLeave(pin);
    expect(onHover).toHaveBeenLastCalledWith(null);
    fireEvent.focus(pin);
    expect(onHover).toHaveBeenLastCalledWith(item());
  });
});
