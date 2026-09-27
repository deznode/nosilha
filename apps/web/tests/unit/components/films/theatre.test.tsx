import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HostCallbacks } from "@/components/films/hosts/types";
import { FilmTheatre } from "@/components/films/theatre/film-theatre";
import { upNextTag } from "@/components/films/theatre/up-next";
import type { Film } from "@/lib/films";

import { makeFilm } from "./film-fixture";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

/** Every mounted host's callbacks and handle, newest last. */
const hosts: {
  cb: HostCallbacks;
  handle: Record<string, ReturnType<typeof vi.fn>>;
}[] = [];
function fakeMount(
  _c: HTMLElement,
  _id: string,
  _t: string,
  cb: HostCallbacks
) {
  const handle = {
    play: vi.fn(),
    pause: vi.fn(),
    setMuted: vi.fn(),
    seek: vi.fn(),
    destroy: vi.fn(),
  };
  hosts.push({ cb, handle });
  return handle;
}
vi.mock("@/components/films/hosts/youtube", () => ({
  mountYouTube: fakeMount,
}));
vi.mock("@/components/films/hosts/vimeo", () => ({ mountVimeo: fakeMount }));
vi.mock("@/components/films/hosts/file", () => ({ mountFile: fakeMount }));

const last = () => hosts[hosts.length - 1];
const NS = { slug: "nova-sintra", name: "Nova Sintra" };

const CURRENT = makeFilm("cur", {
  displayTitle: "Walking Nova Sintra",
  sourceTitle: "[4K] NOVA SINTRA HIKE",
  description: "A walk through the town.",
  place: NS,
});
const SAME = makeFilm("same", {
  displayTitle: "Nova Sintra in August",
  place: NS,
});
const OTHER = makeFilm("other", { displayTitle: "Pesca na Brava" });
const BLOCKED = makeFilm("blocked", {
  displayTitle: "Cliffs above the inlet",
  playback: null,
  source: "Archive file",
});
const FILMS = [CURRENT, BLOCKED, OTHER, SAME];

/** `autoStart` arrives the way the app sends it: `?play=1` on the live URL. */
function renderTheatre(
  film = CURRENT,
  autoStart = false,
  films: readonly Film[] | null = FILMS
) {
  if (autoStart)
    window.history.replaceState(null, "", `/films/${film.id}?play=1`);
  return render(<FilmTheatre film={film} films={films} hasPlacePhotos />);
}

/** Spec 038 FR-040 to FR-043 — the film page. */
describe("FilmTheatre", () => {
  beforeEach(() => {
    hosts.length = 0;
    push.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("shows the record without empty rows", () => {
    renderTheatre();
    expect(screen.getByRole("link", { name: "← All films" })).toHaveAttribute(
      "href",
      "/films"
    );
    expect(screen.getByText("Film · YouTube")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Walking Nova Sintra" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Filmed near Nova Sintra", {
        selector: "span.text-\\[15px\\]",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Photographs from here →" })
    ).toHaveAttribute("href", "/photographs?place=nova-sintra");
    expect(screen.getByText("A walk through the town.")).toBeInTheDocument();
    expect(
      screen.getByText("Listed on YouTube as “[4K] NOVA SINTRA HIKE”")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Not yet recorded: who filmed it.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Not recorded/)).not.toBeInTheDocument();
  });

  it("orders Up next and tags each row", () => {
    renderTheatre();
    const list = within(screen.getByRole("list"));
    const links = list.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/films/same?play=1",
      "/films/other?play=1",
      "/films/blocked",
    ]);
    expect(list.getByText("Same place")).toBeInTheDocument();
    expect(list.getByText("Can’t play here")).toBeInTheDocument();
  });

  it("plays from idle and draws its own bar", async () => {
    renderTheatre();
    await userEvent.click(
      screen.getByRole("button", { name: "Play Walking Nova Sintra" })
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading from YouTube"
    );
    act(() => last().cb.onPlaying());
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(last().handle.setMuted).toHaveBeenCalledWith(true);
    expect(screen.getByText("Sound off")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: " " });
    expect(last().handle.pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("hides the bar when the host shows its own controls", async () => {
    renderTheatre();
    await userEvent.click(
      screen.getByRole("button", { name: "Play Walking Nova Sintra" })
    );
    act(() => {
      last().cb.onControls?.("host");
      last().cb.onPlaying();
    });
    expect(
      screen.queryByRole("button", { name: "Pause" })
    ).not.toBeInTheDocument();
  });

  it("starts on arrival with ?play=1, and drops it so Back doesn't replay", () => {
    renderTheatre(CURRENT, true);
    expect(hosts).toHaveLength(1);
    expect(window.location.pathname).toBe("/films/cur");
    expect(window.location.search).toBe("");
  });

  it("does not start the film on Space while idle", () => {
    renderTheatre();
    fireEvent.keyDown(window, { key: " " });
    expect(hosts).toHaveLength(0);
  });

  it("leaves Space alone while the host is still loading", async () => {
    renderTheatre();
    await userEvent.click(
      screen.getByRole("button", { name: "Play Walking Nova Sintra" })
    );
    fireEvent.keyDown(window, { key: " " });
    expect(last().handle.pause).not.toHaveBeenCalled();
  });

  it("offers full screen where the browser supports it", async () => {
    const enabled = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "fullscreenEnabled"
    );
    Object.defineProperty(document, "fullscreenEnabled", {
      configurable: true,
      value: true,
    });
    const request = vi.fn(() => Promise.resolve());
    HTMLElement.prototype.requestFullscreen = request;
    try {
      renderTheatre();
      await userEvent.click(
        screen.getByRole("button", { name: "Play Walking Nova Sintra" })
      );
      act(() => last().cb.onPlaying());
      await userEvent.click(
        screen.getByRole("button", { name: "Full screen" })
      );
      expect(request).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(window, { key: "f" });
      expect(request).toHaveBeenCalledTimes(2);
    } finally {
      delete (document as { fullscreenEnabled?: boolean }).fullscreenEnabled;
      if (enabled) {
        Object.defineProperty(Document.prototype, "fullscreenEnabled", enabled);
      }
      delete (HTMLElement.prototype as { requestFullscreen?: unknown })
        .requestFullscreen;
    }
  });

  it("leaves Up next out when the film list is unavailable", () => {
    renderTheatre(CURRENT, true, null);
    expect(
      screen.queryByRole("heading", { name: "Up next" })
    ).not.toBeInTheDocument();
    act(() => last().cb.onPlaying());
    act(() => last().cb.onEnded?.());
    expect(
      screen.queryByText("That was the last film")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Watch again" })
    ).toBeInTheDocument();
  });

  it("counts down to the next playable film at the end", () => {
    vi.useFakeTimers();
    renderTheatre(CURRENT, true);
    act(() => last().cb.onPlaying());
    act(() => last().cb.onEnded?.());
    expect(screen.getByText("Up next in 5")).toBeInTheDocument();
    expect(
      screen.getByText("Nova Sintra in August", {
        selector: "span.text-\\[22px\\]",
      })
    ).toBeInTheDocument();
    // One second per act: each tick schedules the next after React commits.
    for (let i = 0; i < 4; i++) act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Up next in 1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(push).toHaveBeenCalledWith("/films/same?play=1");
  });

  it("cancels the countdown, and waits when autoplay is off", () => {
    vi.useFakeTimers();
    renderTheatre(CURRENT, true);
    act(() => last().cb.onEnded?.());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByText("Up next", { selector: "[aria-live]" })
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(6000));
    expect(push).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Watch again" }));
    expect(last().handle.seek).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByRole("switch", { name: "Autoplay" }));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    act(() => last().cb.onEnded?.());
    expect(screen.queryByText(/Up next in/)).not.toBeInTheDocument();
  });

  it("draws can't-play with a way to help and no play button", () => {
    renderTheatre(BLOCKED);
    expect(
      screen.getByText("Can’t play here", { selector: "span" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The source file is missing from the archive")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send a copy" })).toHaveAttribute(
      "href",
      "/contribute/media"
    );
    expect(
      screen.queryByRole("button", { name: /^Play/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Film · Archive file")).toBeInTheDocument();
  });

  it("offers the host when it refuses the embed", async () => {
    renderTheatre(
      makeFilm("x", { watchUrl: "https://www.youtube.com/watch?v=x" })
    );
    await userEvent.click(screen.getByRole("button", { name: /^Play/ }));
    act(() => last().cb.onBlocked());
    expect(
      screen.getByRole("link", { name: "Watch on YouTube" })
    ).toBeInTheDocument();
  });
});

describe("upNextTag", () => {
  it("tags can't-play, same place and next", () => {
    expect(upNextTag(BLOCKED, CURRENT, SAME)?.text).toBe("Can’t play here");
    expect(upNextTag(SAME, CURRENT, SAME)?.text).toBe("Same place");
    expect(upNextTag(OTHER, OTHER, OTHER)?.text).toBe("Next");
    expect(upNextTag(OTHER, CURRENT, SAME)).toBeNull();
  });
});
