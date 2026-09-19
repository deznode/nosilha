import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VideoGrid } from "@/components/gallery/video-grid";
import type { MediaItem } from "@/types/media";

const motion = vi.hoisted(() => ({ reduced: true }));

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return {
    ...(await createFramerMotionMock()),
    useReducedMotion: () => motion.reduced,
  };
});

const items: MediaItem[] = ["a", "b", "c"].map((id) => ({
  id,
  type: "VIDEO",
  title: `Film ${id}`,
  url: `https://www.youtube-nocookie.com/embed/${id}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
}));

describe.each([
  ["reduced motion", true],
  ["animated", false],
])("VideoGrid (%s)", (_label, reduced) => {
  beforeEach(() => {
    motion.reduced = reduced;
  });

  it("embeds iframes in the mobile carousel by default", () => {
    const { container } = render(
      <VideoGrid items={items} categoryFilter={null} />
    );

    expect(container.querySelectorAll("iframe")).toHaveLength(3);
  });

  it("renders selectable cards and no iframe in cards layout", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <VideoGrid
        items={items}
        categoryFilter={null}
        featuredVideoId="a"
        onVideoSelect={onSelect}
        mobileLayout="cards"
      />
    );

    expect(container.querySelectorAll("iframe")).toHaveLength(0);
    // Desktop grid drops the featured film; the carousel keeps all three.
    const buttons = screen.getAllByRole("button", { name: /play film b/i });
    expect(buttons).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /play film a/i })
    ).toHaveLength(1);

    fireEvent.click(buttons[1]);
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it("renders every card as a link when given videoHref", () => {
    render(
      <VideoGrid
        items={items}
        categoryFilter={null}
        videoHref={(item) => `/films/${item.id}`}
        mobileLayout="cards"
      />
    );

    const links = screen.getAllByRole("link", { name: "Film b" });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/films/b");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
