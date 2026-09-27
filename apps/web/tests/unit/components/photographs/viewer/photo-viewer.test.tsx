import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoViewer } from "@/components/photographs/viewer/photo-viewer";
import {
  originWithin,
  swipeDirection,
} from "@/components/photographs/viewer/use-stage-gestures";
import { PANEL_KEY } from "@/lib/viewer-storage";
import { useIdentifyStore } from "@/stores/identifyStore";

import { FURNA, NOVA_SINTRA, makePhoto } from "../archive-photo-fixture";

const push = vi.fn();
let pathname = "/photographs/a";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => pathname,
}));

let pointerFine = true;
vi.mock("@/hooks/use-pointer-fine", () => ({
  usePointerFine: () => pointerFine,
}));

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

const PHOTOS = [
  makePhoto("a", {
    near: NOVA_SINTRA,
    title: "Lomba",
    description: "Houses on the ridge.",
    category: "Landscape",
    dateLabel: "July 12, 2024",
    camera: "DJI FC3582",
    missing: { photographer: true, place: false, date: false },
  }),
  makePhoto("b", { near: NOVA_SINTRA }),
  makePhoto("c", { near: FURNA }),
  makePhoto("d"),
];

function renderViewer(place?: string, initialId = "a") {
  pathname = `/photographs/${initialId}`;
  return render(
    <PhotoViewer photos={PHOTOS} initialId={initialId} place={place} />
  );
}

/** Spec 038 FR-020 to FR-026 — the viewing room. */
describe("PhotoViewer", () => {
  let replaceState: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    push.mockClear();
    pointerFine = true;
    window.localStorage.clear();
    replaceState = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});
  });
  afterEach(() => {
    replaceState.mockRestore();
    useIdentifyStore.getState().close();
  });

  it("shows the details panel in the handoff's order", () => {
    renderViewer("nova-sintra");
    expect(
      screen.getByRole("link", { name: "← Photographs · Nova Sintra" })
    ).toHaveAttribute("href", "/photographs?place=nova-sintra");
    expect(screen.getByText("Photograph · Landscape")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Lomba" })
    ).toBeInTheDocument();
    expect(screen.getByText("Houses on the ridge.")).toBeInTheDocument();
    expect(screen.getByText("July 12, 2024 · DJI FC3582")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Near Nova Sintra" })
    ).toHaveAttribute("href", "/photographs?place=nova-sintra");
    expect(screen.getByRole("link", { name: "Show on map" })).toHaveAttribute(
      "href",
      "/map?mode=photographs&sel=p%3Aa"
    );
    expect(screen.getByText("More from Nova Sintra")).toBeInTheDocument();
    expect(
      screen.getByText("Not yet recorded: who took it.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Help complete this record" })
    ).toBeInTheDocument();
    expect(screen.queryByText("What we know")).not.toBeInTheDocument();
  });

  it("counts within the filter and hints for the pointer", () => {
    renderViewer("nova-sintra");
    expect(
      screen.getByText("1 of 2 · Nova Sintra · ← → to move · Esc to go back")
    ).toBeInTheDocument();
  });

  it("hints swipe on a touch device", () => {
    pointerFine = false;
    renderViewer();
    expect(screen.getByText("1 of 4 · swipe to move")).toBeInTheDocument();
  });

  it("steps with the arrows and keys, wrapping within the filter", async () => {
    renderViewer("nova-sintra");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/photographs/b?place=nova-sintra"
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/photographs/b?place=nova-sintra"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Next photograph" })
    );
    expect(replaceState).toHaveBeenCalledTimes(3);
  });

  it("falls back to All when the photograph is outside the filter", () => {
    renderViewer("furna");
    expect(screen.getByText(/^1 of 4/)).toBeInTheDocument();
  });

  it("orders Esc: full screen, then zoom, then the index", async () => {
    renderViewer("nova-sintra");
    fireEvent.keyDown(window, { key: "f" });
    expect(
      screen.getByRole("button", { name: "Exit full screen" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✕ Close" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Zoom" }));
    expect(screen.getByRole("button", { name: "Fit" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Full screen" })
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Zoom" })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(push).toHaveBeenCalledWith("/photographs?place=nova-sintra", {
      scroll: false,
    });
  });

  it("remembers the panel with I", () => {
    renderViewer();
    expect(
      screen.getByRole("button", { name: "Hide details" })
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "i" });
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
    expect(window.localStorage.getItem(PANEL_KEY)).toBe("0");
  });

  it("reads a closed panel from storage", () => {
    window.localStorage.setItem(PANEL_KEY, "0");
    renderViewer();
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
  });

  it("ignores keys while the identify sheet is open or an input has focus", () => {
    renderViewer();
    act(() =>
      useIdentifyStore.getState().open({
        contentType: "media",
        contentId: "a",
        field: "photographerCredit",
        pageTitle: "Lomba",
      })
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(replaceState).not.toHaveBeenCalled();
    act(() => useIdentifyStore.getState().close());

    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(replaceState).not.toHaveBeenCalled();
    input.remove();
  });

  it("shows the unplaced wording for a photograph with no place", () => {
    renderViewer(undefined, "d");
    expect(
      screen.getByRole("heading", { level: 1, name: "A photograph of Brava" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Show on map")).not.toBeInTheDocument();
    expect(
      screen.getByText("Not yet recorded: who took it, where and when.")
    ).toBeInTheDocument();
  });

  it("follows the URL after a replaceState step", () => {
    const { rerender } = renderViewer();
    pathname = "/photographs/c";
    rerender(<PhotoViewer photos={PHOTOS} initialId="a" place={undefined} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Near Furna" })
    ).toBeInTheDocument();
  });
});

describe("full screen", () => {
  it("makes the details inert and focuses Close", () => {
    pathname = "/photographs/a";
    render(<PhotoViewer photos={PHOTOS} initialId="a" place={undefined} />);
    fireEvent.keyDown(window, { key: "f" });
    expect(screen.getByRole("complementary", { hidden: true })).toHaveAttribute(
      "inert"
    );
    expect(screen.getByRole("button", { name: "✕ Close" })).toHaveFocus();
  });
});

describe("stage gestures", () => {
  it("steps only past 60px", () => {
    expect(swipeDirection(-61)).toBe(1);
    expect(swipeDirection(61)).toBe(-1);
    expect(swipeDirection(60)).toBe(0);
    expect(swipeDirection(-10)).toBe(0);
  });

  it("puts the zoom origin at the pointer", () => {
    expect(
      originWithin({ left: 100, top: 50, width: 200, height: 100 }, 150, 75)
    ).toBe("25.0% 25.0%");
    expect(originWithin({ left: 0, top: 0, width: 0, height: 0 }, 1, 1)).toBe(
      "50% 50%"
    );
  });
});
