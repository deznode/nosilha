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
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: vi.fn() }),
    error: () => ({ show: vi.fn() }),
  }),
}));

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
    missing: { photographer: true, date: false },
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

  it("steps on a one-finger swipe but not on a pinch", () => {
    renderViewer("nova-sintra");
    const stage = screen.getByRole("region", { name: "Photograph" });

    // One finger: 100px to the left steps to the next photograph.
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 90 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 100, clientY: 90 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 100, clientY: 90 });
    expect(replaceState).toHaveBeenCalledTimes(1);

    // Two fingers spreading apart: the first one lifting is not a swipe, even though
    // it ends 60px left of where the second one landed.
    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 100, clientY: 90 });
    fireEvent.pointerDown(stage, { pointerId: 3, clientX: 250, clientY: 90 });
    fireEvent.pointerMove(stage, { pointerId: 2, clientX: 40, clientY: 90 });
    fireEvent.pointerUp(stage, { pointerId: 2, clientX: 40, clientY: 90 });
    fireEvent.pointerUp(stage, { pointerId: 3, clientX: 320, clientY: 90 });
    expect(replaceState).toHaveBeenCalledTimes(1);
  });

  it("lets a vertical drag scroll the page until zoomed or full screen", () => {
    renderViewer("nova-sintra");
    const stage = screen.getByRole("region", { name: "Photograph" });
    expect(stage.className).toContain("touch-pan-y");
    expect(stage.className).not.toContain("touch-none");

    fireEvent.click(screen.getByRole("button", { name: "Zoom" }));
    expect(stage.className).toContain("touch-none");
    fireEvent.click(screen.getByRole("button", { name: "Fit" }));

    fireEvent.click(screen.getByRole("button", { name: "Full screen" }));
    expect(stage.className).toContain("touch-none");
  });

  it("cancels a swipe the browser takes over for scrolling", () => {
    renderViewer("nova-sintra");
    const stage = screen.getByRole("region", { name: "Photograph" });

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 90 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 190, clientY: 160 });
    fireEvent.pointerCancel(stage, { pointerId: 1 });
    expect(replaceState).not.toHaveBeenCalled();
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

  it("shows the credit and place name the record holds", () => {
    pathname = "/photographs/e";
    render(
      <PhotoViewer
        photos={[
          makePhoto("e", {
            credit: "Ana Lopes",
            placeName: "Fajã d'Água, by the harbour",
            missing: { photographer: false, date: false },
          }),
        ]}
        initialId="e"
        place={undefined}
      />
    );
    expect(screen.getByText("Photograph by Ana Lopes")).toBeInTheDocument();
    expect(screen.getByText("Fajã d'Água, by the harbour")).toBeInTheDocument();
    // A named place is a recorded place: nothing is asked for.
    expect(screen.queryByText(/Not yet recorded/)).not.toBeInTheDocument();
  });

  it("hands focus to the new record after a More from pick", async () => {
    renderViewer("nova-sintra");
    await userEvent.click(
      screen.getByRole("button", { name: "Near Nova Sintra" })
    );
    expect(replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/photographs/b?place=nova-sintra"
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
  });

  it("follows the URL after a replaceState step", () => {
    const { rerender } = renderViewer();
    pathname = "/photographs/c";
    rerender(<PhotoViewer photos={PHOTOS} initialId="a" place={undefined} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Near Furna" })
    ).toBeInTheDocument();
  });

  describe("arriving on an ask link", () => {
    function renderAsk(photos = PHOTOS, initialId = "a") {
      pathname = `/photographs/${initialId}`;
      return render(
        <PhotoViewer
          photos={photos}
          initialId={initialId}
          place={undefined}
          ask
        />
      );
    }

    it("asks the question without opening the sheet", () => {
      renderAsk();

      expect(
        screen.getByText("Do you recognise this photograph?")
      ).toBeInTheDocument();
      expect(useIdentifyStore.getState().context).toBeNull();
    });

    it("opens the sheet on the first missing field from Tell us", async () => {
      renderAsk();
      await userEvent.click(screen.getByRole("button", { name: "Tell us" }));

      expect(useIdentifyStore.getState().context).toMatchObject({
        contentType: "media",
        contentId: "a",
        mediaId: "a",
        field: "photographerCredit",
      });
    });

    it("shows no bar without the ask flag", () => {
      renderViewer();

      expect(
        screen.queryByRole("button", { name: "Tell us" })
      ).not.toBeInTheDocument();
    });

    it("shows no bar for a record that is now complete", () => {
      renderAsk(
        [
          makePhoto("z", {
            located: true,
            credit: "Ana",
            dateLabel: "July 12, 2024",
            missing: { photographer: false, date: false },
          }),
        ],
        "z"
      );

      expect(
        screen.queryByRole("button", { name: "Tell us" })
      ).not.toBeInTheDocument();
    });

    it("removes the bar once the reader steps to another photograph", () => {
      const view = renderAsk();
      pathname = "/photographs/b";
      view.rerender(
        <PhotoViewer photos={PHOTOS} initialId="a" place={undefined} ask />
      );

      expect(
        screen.queryByRole("button", { name: "Tell us" })
      ).not.toBeInTheDocument();
    });
  });

  describe("sharing", () => {
    it("offers Share and Copy link on every photograph", () => {
      renderViewer();

      expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Copy link" })
      ).toBeInTheDocument();
    });

    it("offers to ask someone when the record is missing something", () => {
      renderViewer();

      expect(
        screen.getByRole("button", { name: "Ask someone who might know" })
      ).toBeInTheDocument();
    });

    it("does not offer to ask about a complete record", () => {
      pathname = "/photographs/z";
      render(
        <PhotoViewer
          photos={[
            makePhoto("z", {
              located: true,
              credit: "Ana",
              dateLabel: "July 12, 2024",
              missing: { photographer: false, date: false },
            }),
          ]}
          initialId="z"
          place={undefined}
        />
      );

      expect(
        screen.queryByRole("button", { name: "Ask someone who might know" })
      ).not.toBeInTheDocument();
    });
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
