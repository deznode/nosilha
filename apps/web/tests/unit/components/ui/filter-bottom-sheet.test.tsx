import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterBottomSheet } from "@/components/ui/filter-bottom-sheet";

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

/**
 * Coverage for the sheet's modal behaviour, which now comes from the shared
 * `useSheetModal` hook rather than this component's own copy of it.
 *
 * The component had no tests when that copy was removed, so these exist to pin
 * the behaviour the hook is responsible for: scroll lock, focus-in, focus
 * restore, and Escape. `MoreSheet` exercises the same hook through
 * `BottomSheet`, so a regression in either consumer is caught here or there.
 */
describe("FilterBottomSheet", () => {
  const open = (props: Partial<Parameters<typeof FilterBottomSheet>[0]> = {}) =>
    render(
      <FilterBottomSheet isOpen onClose={() => {}} title="Filters" {...props}>
        <button type="button">A filter</button>
      </FilterBottomSheet>
    );

  it("renders as a modal dialog named by its title", () => {
    open();

    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("button", { name: "A filter" })
    ).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(
      <FilterBottomSheet isOpen={false} onClose={() => {}} title="Filters">
        <button type="button">A filter</button>
      </FilterBottomSheet>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks body scroll while open and releases it on unmount", () => {
    const { unmount } = open();
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    open({ onClose });

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // The hook reads `onClose` through a ref, so an inline arrow that changes
  // identity on every parent render must still reach the current handler.
  it("calls the latest onClose after a re-render", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <FilterBottomSheet isOpen onClose={first} title="Filters">
        <button type="button">A filter</button>
      </FilterBottomSheet>
    );
    rerender(
      <FilterBottomSheet isOpen onClose={second} title="Filters">
        <button type="button">A filter</button>
      </FilterBottomSheet>
    );

    await user.keyboard("{Escape}");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("moves focus into the sheet and restores it on close", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open filters";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = open();
    const dialog = await screen.findByRole("dialog", { name: "Filters" });
    await vi.waitFor(() => expect(dialog).toHaveFocus());

    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("shows the result count on Apply when there are active filters", () => {
    open({ onApply: () => {}, onClear: () => {}, activeCount: 7 });

    expect(
      screen.getByRole("button", { name: "Show 7 results" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear All" })
    ).toBeInTheDocument();
  });

  it("omits Clear and Apply when no handlers are given", () => {
    open();

    expect(
      screen.queryByRole("button", { name: /Apply|Show/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear All" })
    ).not.toBeInTheDocument();
  });
});
