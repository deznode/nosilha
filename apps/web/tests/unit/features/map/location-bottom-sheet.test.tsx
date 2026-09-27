import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  LocationBottomSheet,
  type SheetView,
} from "@/features/map/components/location-bottom-sheet";

function renderSheet(view: SheetView = "peek") {
  const props = {
    onToggle: vi.fn(),
    onSetOpen: vi.fn(),
    onDismiss: vi.fn(),
  };
  render(
    <LocationBottomSheet view={view} {...props}>
      {(grabber, handle) => (view === "detail" ? handle : grabber)}
    </LocationBottomSheet>
  );
  return props;
}

/** A drag from y=500 by `dy`, ending in the click a real pointer would produce. */
function drag(target: HTMLElement, dy: number) {
  fireEvent.pointerDown(target, { pointerId: 1, clientY: 500 });
  fireEvent.pointerMove(target, { pointerId: 1, clientY: 500 + dy });
  fireEvent.pointerUp(target, { pointerId: 1, clientY: 500 + dy });
  fireEvent.click(target);
}

function grabber() {
  return screen.getByRole("button", { name: /Filters and list|Hide the list/ });
}

describe("LocationBottomSheet", () => {
  it("sets its height from the view", () => {
    renderSheet("peek");
    expect(screen.getByTestId("map-sheet").style.maxHeight).toBe("160px");
  });

  it("toggles on a click or key press of the grabber", () => {
    const { onToggle } = renderSheet();
    fireEvent.click(grabber());
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("opens on a drag up past the threshold, without also toggling", () => {
    const { onSetOpen, onToggle } = renderSheet("peek");
    drag(grabber(), -80);
    expect(onSetOpen).toHaveBeenCalledWith(true);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("shuts on a drag down past the threshold", () => {
    const { onSetOpen } = renderSheet("open");
    drag(grabber(), 80);
    expect(onSetOpen).toHaveBeenCalledWith(false);
  });

  it("settles back on a short drag, and the next click still toggles", () => {
    const { onSetOpen, onToggle } = renderSheet("peek");
    drag(grabber(), -20);
    expect(onSetOpen).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.click(grabber());
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("follows the finger while dragging, without the easing", () => {
    renderSheet("peek");
    const sheet = screen.getByTestId("map-sheet");
    fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 500 });
    fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 490 });
    // jsdom lays nothing out, so the sheet starts at 0px tall.
    expect(sheet.style.maxHeight).toBe("0px");
    expect(sheet.className).not.toContain("transition-[max-height]");

    fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 490 });
    expect(sheet.style.maxHeight).toBe("160px");
    expect(sheet.className).toContain("transition-[max-height]");
  });

  it("closes a selection on a drag down its handle, and opens the list on a drag up", () => {
    const first = renderSheet("detail");
    drag(screen.getByTestId("map-sheet-handle"), 80);
    expect(first.onDismiss).toHaveBeenCalledTimes(1);
    expect(first.onSetOpen).not.toHaveBeenCalled();

    drag(screen.getByTestId("map-sheet-handle"), -80);
    expect(first.onSetOpen).toHaveBeenCalledWith(true);
  });
});
