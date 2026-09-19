import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FilmPlayer } from "@/components/films/film-player";
import type { HostCallbacks } from "@/components/films/hosts/types";
import type { Film } from "@/lib/films";

/**
 * Spec 035 FR-008 — the player's states, with the hosts replaced by stubs that let a
 * test say what the host reported.
 */
const hosts = vi.hoisted(() => ({
  callbacks: [] as HostCallbacks[],
  pause: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("@/components/films/hosts/youtube", () => ({
  mountYouTube: (
    _el: HTMLElement,
    _id: string,
    _t: string,
    cb: HostCallbacks
  ) => {
    hosts.callbacks.push(cb);
    return { pause: hosts.pause, destroy: hosts.destroy };
  },
}));
vi.mock("@/components/films/hosts/vimeo", () => ({
  mountVimeo: (
    _el: HTMLElement,
    _id: string,
    _t: string,
    cb: HostCallbacks
  ) => {
    hosts.callbacks.push(cb);
    return { pause: hosts.pause, destroy: hosts.destroy };
  },
}));

function film(overrides: Partial<Film> = {}): Film {
  return {
    id: "f1",
    title: "Nova Sintra em Agosto",
    source: "YouTube",
    thumbnailUrl: "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
    durationSeconds: null,
    place: null,
    filmmaker: null,
    featured: false,
    playback: { kind: "youtube", id: "abc" },
    watchUrl: "https://www.youtube.com/watch?v=abc",
    ...overrides,
  };
}

const lastHost = () => hosts.callbacks[hosts.callbacks.length - 1];

beforeEach(() => {
  hosts.callbacks = [];
  hosts.pause.mockClear();
  hosts.destroy.mockClear();
});

describe("FilmPlayer", () => {
  it("starts idle with the thumbnail and a play button, no outbound link", () => {
    const { container } = render(<FilmPlayer film={film()} size="hero" />);

    expect(
      screen.getByRole("button", { name: "Play Nova Sintra em Agosto" })
    ).toBeInTheDocument();
    expect(container.querySelector("img")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(hosts.callbacks).toHaveLength(0);
  });

  it("goes idle → loading → playing", () => {
    render(<FilmPlayer film={film()} size="page" />);

    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading from YouTube"
    );

    act(() => lastHost().onPlaying());
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull();
  });

  it("offers 'Watch on YouTube' only when the host blocks the embed", () => {
    render(<FilmPlayer film={film()} size="page" />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));

    expect(screen.queryByRole("link")).toBeNull();
    act(() => lastHost().onBlocked());
    // The refusing host is torn down; the frame stays.
    expect(hosts.destroy).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText(
        "This film will not play here. The host restricts where it can be embedded."
      )
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Watch on YouTube" });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=abc");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows the removed state with no link", () => {
    render(
      <FilmPlayer
        film={film({ source: "Vimeo", playback: { kind: "vimeo", id: "7" } })}
        size="page"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading from Vimeo");

    act(() => lastHost().onRemoved());

    expect(
      screen.getByText(
        "This film is no longer available from its host. Its record stays in the archive."
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("plays an archive file in a native video and reads its error as removed", () => {
    const { container } = render(
      <FilmPlayer
        film={film({
          source: "Archive file",
          playback: { kind: "file", url: "https://media.nosilha.com/a.mp4" },
        })}
        size="page"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /play/i }));

    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("src", "https://media.nosilha.com/a.mp4");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading from Archive file"
    );

    fireEvent.error(video);
    expect(
      screen.getByText(/no longer available from its host/)
    ).toBeInTheDocument();
    expect(hosts.callbacks).toHaveLength(0);
  });

  it("lets only one film play at a time", () => {
    render(
      <>
        <FilmPlayer film={film({ id: "a", title: "First" })} size="page" />
        <FilmPlayer film={film({ id: "b", title: "Second" })} size="page" />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Play First" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Second" }));

    // The first returns to idle and its host is torn down.
    expect(
      screen.getByRole("button", { name: "Play First" })
    ).toBeInTheDocument();
    expect(hosts.pause).toHaveBeenCalled();
    expect(hosts.destroy).toHaveBeenCalledTimes(1);
  });

  it("pauses and tears down the host when unmounted (Activity hide)", () => {
    const { unmount } = render(<FilmPlayer film={film()} size="page" />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    act(() => lastHost().onPlaying());

    unmount();
    expect(hosts.pause).toHaveBeenCalledTimes(1);
    expect(hosts.destroy).toHaveBeenCalledTimes(1);
  });

  it("renders the slot while idle and loading only", () => {
    render(<FilmPlayer film={film()} size="page" slot={<span>pill</span>} />);
    expect(screen.getByText("pill")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByText("pill")).toBeInTheDocument();

    act(() => lastHost().onPlaying());
    expect(screen.queryByText("pill")).toBeNull();
  });

  it("cannot be played when nothing the record holds can play it", () => {
    render(
      <FilmPlayer film={film({ source: null, playback: null })} size="hero" />
    );

    expect(
      screen.getByRole("button", { name: /cannot be played here/ })
    ).toBeDisabled();
  });
});
