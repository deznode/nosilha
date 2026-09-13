import type { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Landmark } from "lucide-react";
import { CoincidentFan } from "@/features/map/components/coincident-fan";
import type { Location } from "@/features/map/data/types";

function loc(id: string, name: string): Location {
  return {
    id,
    name,
    namePortuguese: name,
    category: "Historic",
    description: "",
    coordinates: { lat: 14.873, lng: -24.732 },
    elevation: 0,
    tags: [],
    icon: Landmark,
    color: "#836548",
    status: { status: "gap", label: "no photograph" },
  };
}

const faja = loc("faja", "Faja d'Agua");
const nosRaiz = loc("nos-raiz", "Nos Raiz");

function renderFan(props: Partial<ComponentProps<typeof CoincidentFan>> = {}) {
  const handlers = {
    onToggle: vi.fn(),
    onSelect: vi.fn(),
    onCollapse: vi.fn(),
  };
  render(
    <CoincidentFan
      locations={[faja, nosRaiz]}
      expanded={false}
      selectedId={null}
      {...handlers}
      {...props}
    />
  );
  return handlers;
}

const ring = () =>
  screen.getByRole("button", { name: "2 records at one point" });

describe("CoincidentFan", () => {
  it("collapsed, names how many records share the point and hides them", () => {
    renderFan();

    expect(ring()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /Nos Raiz/ })).toBeNull();
  });

  it("toggles from the ring", () => {
    const { onToggle } = renderFan();

    fireEvent.click(ring());

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("expanded, makes every record its own button", () => {
    const { onSelect } = renderFan({ expanded: true });

    expect(ring()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: /Faja d'Agua/ }));
    expect(onSelect).toHaveBeenLastCalledWith(faja);
    fireEvent.click(screen.getByRole("button", { name: /Nos Raiz/ }));
    expect(onSelect).toHaveBeenLastCalledWith(nosRaiz);
  });

  it("marks the selected record", () => {
    renderFan({ expanded: true, selectedId: "nos-raiz" });

    expect(screen.getByRole("button", { name: /Nos Raiz/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /Faja d'Agua/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("collapses on Escape", () => {
    const { onCollapse } = renderFan({ expanded: true });

    fireEvent.keyDown(screen.getByRole("button", { name: /Nos Raiz/ }), {
      key: "Escape",
    });

    expect(onCollapse).toHaveBeenCalledTimes(1);
  });
});
