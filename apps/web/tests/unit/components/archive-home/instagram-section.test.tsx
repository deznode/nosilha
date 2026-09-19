import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  InstagramSectionLoading,
  InstagramSectionView,
} from "@/components/archive-home/instagram-section";
import type { InstagramPost } from "@/lib/instagram";

const NOW = Date.parse("2026-09-19T12:00:00Z");

function post(
  id: string,
  overrides: Partial<InstagramPost> = {}
): InstagramPost {
  return {
    id,
    caption: "Praça de Nova Sintra, domingo de manhã",
    media_type: "IMAGE",
    media_url: `https://scontent.cdninstagram.com/${id}.jpg`,
    timestamp: "2026-09-16T12:00:00+0000",
    permalink: `https://instagram.com/p/${id}`,
    ...overrides,
  };
}

const FOUR = [
  post("a", {
    caption: "Furna at first light. Barco di Praia ta txiga 7 hora.",
  }),
  post("b", {
    media_type: "VIDEO",
    thumbnail_url: "https://scontent.cdninstagram.com/b-thumb.jpg",
    timestamp: "2026-09-12T12:00:00+0000",
  }),
  post("c", { media_type: "CAROUSEL_ALBUM", caption: undefined }),
  post("d", { caption: "Fajã d’Água. Nos terra, nos gente." }),
];

function renderView(feed: Parameters<typeof InstagramSectionView>[0]["feed"]) {
  return render(<InstagramSectionView feed={feed} now={NOW} />);
}

/** Spec 036 — "From Instagram" on the archive home. */
describe("InstagramSectionView", () => {
  it("names the section and links out to the account in a new tab", () => {
    renderView({ status: "ok", posts: FOUR });

    expect(
      screen.getByRole("heading", { level: 2, name: "From Instagram" })
    ).toBeInTheDocument();
    const follow = screen.getAllByRole("link", {
      name: "Follow on Instagram →",
    });
    // One in the header (desktop), one under the ask (mobile).
    expect(follow).toHaveLength(2);
    for (const link of follow) {
      expect(link).toHaveAttribute("href", "https://instagram.com/nosilha");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener");
    }
  });

  it("renders four tiles, the fourth hidden on wide screens", () => {
    renderView({ status: "ok", posts: FOUR });

    const tiles = screen.getAllByRole("link", { name: /^Instagram post/ });
    expect(tiles).toHaveLength(4);
    expect(tiles[3]).toHaveClass("min-[700px]:hidden");
    expect(tiles[0]).not.toHaveClass("min-[700px]:hidden");
    expect(tiles[1]).toHaveAttribute("href", "https://instagram.com/p/b");
    expect(tiles[1]).toHaveAttribute("target", "_blank");
  });

  it("gives each tile an accessible name from its date and caption", () => {
    renderView({ status: "ok", posts: FOUR });

    expect(
      screen.getByRole("link", {
        name: "Instagram post, 3 days ago: Furna at first light. Barco di Praia ta txiga 7 hora.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Instagram post, 3 days ago" })
    ).toBeInTheDocument();
  });

  it("shows a caption only when its first line fits", () => {
    renderView({ status: "ok", posts: FOUR });

    expect(
      screen.getByText("Fajã d’Água. Nos terra, nos gente.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Furna at first light. Barco di Praia ta txiga 7 hora."
      )
    ).not.toBeInTheDocument();
  });

  it("badges videos and albums with text, described on the tile", () => {
    renderView({ status: "ok", posts: FOUR });

    const video = screen.getByRole("link", { name: /1 week ago/ });
    expect(within(video).getByText("Video")).toBeInTheDocument();
    expect(video).toHaveAccessibleDescription("Video");
    expect(screen.getByText("Album")).toBeInTheDocument();
    const image = screen.getAllByRole("link", { name: /^Instagram post/ })[0];
    expect(image).not.toHaveAttribute("aria-describedby");
  });

  it("uses the video's poster frame, and hides every image from assistive tech", () => {
    const { container } = renderView({ status: "ok", posts: FOUR });

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(4);
    expect(images[1].getAttribute("src")).toContain("b-thumb.jpg");
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
      expect(img).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("carries the standfirst and the closing ask to the contribute flow", () => {
    renderView({ status: "ok", posts: FOUR });

    expect(
      screen.getByText(
        "The account, not the archive: notices, festas, and whatever we are working on that week."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "send it to the archive →" })
    ).toHaveAttribute("href", "/contribute/media");
  });

  it("does not hide when Instagram is unreachable", () => {
    renderView({ status: "unavailable" });

    expect(
      screen.getByText(
        "We could not reach Instagram just now. The posts are still there."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "send it to the archive →" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Instagram post/ })
    ).not.toBeInTheDocument();
  });

  it("says so when the account has no posts", () => {
    renderView({ status: "ok", posts: [] });

    expect(screen.getByText("Nothing posted yet.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "send it to the archive →" })
    ).toBeInTheDocument();
  });

  it("lays a single post out beside its full caption", () => {
    renderView({ status: "ok", posts: [FOUR[0]] });

    expect(screen.getByText("One post so far.")).toBeInTheDocument();
    // The whole caption, not the fitted first line.
    expect(
      screen.getByText("Furna at first light. Barco di Praia ta txiga 7 hora.")
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /^Instagram post/ })
    ).toHaveLength(1);
  });
});

describe("InstagramSectionLoading", () => {
  it("renders the header at once, without the link out", () => {
    render(<InstagramSectionLoading />);

    expect(
      screen.getByRole("heading", { name: "From Instagram" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The account, not the archive.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
