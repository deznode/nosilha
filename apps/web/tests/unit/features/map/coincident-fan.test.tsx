import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  CoincidentRing,
  FAN_RADIUS,
  fanOffsets,
} from "@/features/map/components/coincident-fan";

describe("fanOffsets", () => {
  it("puts a pair 34px either side, lifted 6px, as prototyped", () => {
    expect(FAN_RADIUS).toBe(34);
    expect(fanOffsets(2)).toEqual([
      [-34, -6],
      [34, -6],
    ]);
  });

  it("spreads more than two on a 34px circle, starting at nine o'clock", () => {
    const offsets = fanOffsets(4);
    expect(offsets).toHaveLength(4);
    expect(offsets[0]).toEqual([-34, 0]);
    for (const [x, y] of offsets) {
      expect(Math.round(Math.hypot(x, y))).toBe(34);
    }
    // Every record gets its own spot.
    expect(new Set(offsets.map((o) => o.join(","))).size).toBe(4);
  });
});

describe("CoincidentRing", () => {
  it("shows the count and names what it holds", () => {
    render(<CoincidentRing count={3} onExpand={vi.fn()} />);

    const ring = screen.getByRole("button", { name: "3 records at one point" });
    expect(ring).toHaveTextContent("3");
    expect(ring).toHaveAttribute("aria-expanded", "false");
  });

  it("draws a dashed ring in the records colour, following the theme", () => {
    render(<CoincidentRing count={2} onExpand={vi.fn()} />);

    const ring = screen.getByRole("button");
    expect(ring.style.border).toBe("2px dashed var(--brand-ocean-blue)");
    expect(ring.style.color).toBe("var(--brand-ocean-blue)");
    expect(ring.className).toContain("size-10");
  });

  it("fans out on click", () => {
    const onExpand = vi.fn();
    render(<CoincidentRing count={2} onExpand={onExpand} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
