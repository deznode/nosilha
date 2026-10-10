import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ShareArrivalLine,
  ShareArrivalStrip,
} from "@/components/share/share-arrival";
import { useShareArrivalStore } from "@/stores/shareArrivalStore";

const trackEvent = vi.fn();
vi.mock("@/lib/ga", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

const LINE = {
  moment: "photo" as const,
  text: "From the Brava archive · 2 more photographs near Furna",
  href: "/photographs?place=furna",
};

function page(text = LINE.text) {
  return (
    <>
      <ShareArrivalStrip />
      <ShareArrivalLine {...LINE} text={text} />
    </>
  );
}

function renderPage(search: string) {
  window.history.replaceState(null, "", `/photographs/abc${search}`);
  return render(page());
}

describe("share arrival strip", () => {
  beforeEach(() => {
    trackEvent.mockReset();
    useShareArrivalStore.setState(useShareArrivalStore.getInitialState());
  });

  it("shows the page's line on a visit from a shared link", () => {
    renderPage("?utm_source=share&utm_campaign=photo");

    expect(
      screen.getByRole("link", { name: /2 more photographs near Furna/ })
    ).toHaveAttribute("href", "/photographs?place=furna");
  });

  it("shows nothing on an ordinary visit", () => {
    renderPage("?place=furna");

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows nothing on a page that registers no line", () => {
    window.history.replaceState(null, "", "/about?utm_source=share");
    render(<ShareArrivalStrip />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("goes away when dismissed and stays away", async () => {
    const view = renderPage("?utm_source=share");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalled();

    view.rerender(page("Another line"));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("counts a visitor who follows the link, then goes away", async () => {
    renderPage("?utm_source=share");
    const link = screen.getByRole("link");
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);

    expect(trackEvent).toHaveBeenCalledWith({
      action: "share_arrival_next",
      content_type: "photo",
    });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("follows the page as its line changes, and clears when the page leaves", () => {
    const view = renderPage("?utm_source=share");
    view.rerender(page("From the Brava archive · 9 more films"));
    expect(
      screen.getByRole("link", { name: /9 more films/ })
    ).toBeInTheDocument();

    view.rerender(<ShareArrivalStrip />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("stays an arrival after the URL loses its tags", () => {
    renderPage("?utm_source=share");
    act(() => window.history.replaceState(null, "", "/photographs/def"));

    expect(useShareArrivalStore.getState().arrived).toBe(true);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
