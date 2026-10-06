import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DuplicateCard } from "@/features/contribute/components/duplicate-card";
import { ApiError } from "@/lib/api-error";

const submitMediaCorrection = vi.fn();
vi.mock("@/lib/api", () => ({
  submitMediaCorrection: (...args: unknown[]) => submitMediaCorrection(...args),
}));

describe("DuplicateCard", () => {
  beforeEach(() => {
    submitMediaCorrection.mockReset();
  });

  describe("public (F5)", () => {
    it("shows the archive link, media and correction form", () => {
      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="k3Zq8XfT0aE"
          media={{ id: "media-1", url: "https://nosilha.com/films/media-1" }}
        />
      );

      expect(screen.getByText("Already in the archive")).toBeInTheDocument();
      expect(
        screen.getByText(/already in the archive, so there's no need/)
      ).toBeInTheDocument();

      const link = screen.getByRole("link", {
        name: "See it in the archive →",
      });
      expect(link).toHaveAttribute("href", "https://nosilha.com/films/media-1");

      expect(
        screen.getByText("Know something about it we don't?")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send what you know" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "A person reads it before anything on the record changes."
        )
      ).toBeInTheDocument();
    });

    it("names the film by its title, with the host, place and date beneath", () => {
      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="k3Zq8XfT0aE"
          media={{
            id: "media-1",
            url: "/films/media-1",
            title: "Festa de São João",
            place: "Nova Sintra",
            approximateDate: "1987",
          }}
        />
      );

      expect(screen.getByText("Festa de São João")).toBeInTheDocument();
      expect(
        screen.getByText("YouTube · Nova Sintra · 1987")
      ).toBeInTheDocument();
    });

    it("leaves out whatever the record doesn't hold", () => {
      render(
        <DuplicateCard
          status="public"
          platform="VIMEO"
          externalId="218447301"
          media={{
            id: "media-1",
            url: "/films/media-1",
            title: "Brava 1975",
            approximateDate: "1975",
          }}
        />
      );

      expect(screen.getByText("Brava 1975")).toBeInTheDocument();
      expect(screen.getByText("Vimeo · 1975")).toBeInTheDocument();
    });

    it("calls a film with no recorded title untitled, not by its host", () => {
      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="k3Zq8XfT0aE"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      expect(screen.getByText("Untitled film")).toBeInTheDocument();
    });

    it("omits the archive link and the correction form when the film isn't known", () => {
      render(
        <DuplicateCard
          status="public"
          platform="VIMEO"
          externalId="218447301"
        />
      );

      expect(
        screen.queryByRole("link", { name: "See it in the archive →" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Send what you know" })
      ).not.toBeInTheDocument();
    });

    it("disables the send button until the correction is non-empty", async () => {
      const user = userEvent.setup();
      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      const button = screen.getByRole("button", { name: "Send what you know" });
      expect(button).toBeDisabled();

      await user.type(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        ),
        "A better title would be..."
      );
      expect(button).toBeEnabled();
    });

    it("flags a correction over 2000 characters and keeps the button disabled", async () => {
      const user = userEvent.setup();
      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "A better title, who is in it, where or when it was filmed"
      );
      await user.click(textarea);
      await user.paste("x".repeat(2001));

      expect(
        screen.getByText("Keep it under 2000 characters.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send what you know" })
      ).toBeDisabled();
    });

    it("posts the correction and shows an inline confirmation on success", async () => {
      const user = userEvent.setup();
      submitMediaCorrection.mockResolvedValue({ id: "c1", message: "ok" });

      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      await user.type(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        ),
        "She's my grandmother, on the left."
      );
      await user.click(
        screen.getByRole("button", { name: "Send what you know" })
      );

      expect(submitMediaCorrection).toHaveBeenCalledWith(
        "media-1",
        "She's my grandmother, on the left."
      );
      expect(
        await screen.findByText("Thank you. A person will read it.")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Send what you know" })
      ).not.toBeInTheDocument();
    });

    it("hides the correction block on a 404", async () => {
      const user = userEvent.setup();
      submitMediaCorrection.mockRejectedValue(new ApiError("not found", 404));

      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      await user.type(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        ),
        "Some correction text"
      );
      await user.click(
        screen.getByRole("button", { name: "Send what you know" })
      );

      await waitFor(() =>
        expect(
          screen.queryByText("Know something about it we don't?")
        ).not.toBeInTheDocument()
      );
      expect(
        screen.queryByRole("button", { name: "Send what you know" })
      ).not.toBeInTheDocument();
    });

    it("hides the correction block on a 5xx", async () => {
      const user = userEvent.setup();
      submitMediaCorrection.mockRejectedValue(
        new ApiError("server error", 503)
      );

      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      await user.type(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        ),
        "Some correction text"
      );
      await user.click(
        screen.getByRole("button", { name: "Send what you know" })
      );

      await waitFor(() =>
        expect(
          screen.queryByText("Know something about it we don't?")
        ).not.toBeInTheDocument()
      );
    });

    it("calls onNeedsSignIn on a 401, keeping the form for a retry after sign-in", async () => {
      const user = userEvent.setup();
      const onNeedsSignIn = vi.fn();
      submitMediaCorrection.mockRejectedValue(
        new ApiError("unauthorized", 401)
      );

      render(
        <DuplicateCard
          status="public"
          platform="YOUTUBE"
          externalId="abc"
          onNeedsSignIn={onNeedsSignIn}
          media={{ id: "media-1", url: "/films/media-1" }}
        />
      );

      await user.type(
        screen.getByPlaceholderText(
          "A better title, who is in it, where or when it was filmed"
        ),
        "Some correction text"
      );
      await user.click(
        screen.getByRole("button", { name: "Send what you know" })
      );

      await waitFor(() => expect(onNeedsSignIn).toHaveBeenCalledTimes(1));
      expect(
        screen.getByRole("button", { name: "Send what you know" })
      ).toBeInTheDocument();
    });
  });

  describe("pending (F6)", () => {
    it("shows the same card and media row as F5, with a YouTube thumbnail, but no link or correction form", () => {
      const { container } = render(
        <DuplicateCard
          status="pending"
          platform="YOUTUBE"
          externalId="k3Zq8XfT0aE"
        />
      );

      expect(
        screen.getByText("Already sent · waiting for review")
      ).toBeInTheDocument();
      expect(screen.getByText("YouTube · not public yet")).toBeInTheDocument();
      expect(
        screen.getByText(/A person will review it soon/)
      ).toBeInTheDocument();
      expect(
        screen.getByText("The reviewer will see it alongside the original.")
      ).toBeInTheDocument();

      const img = container.querySelector("img");
      expect(img).toHaveAttribute(
        "src",
        "https://i.ytimg.com/vi/k3Zq8XfT0aE/hqdefault.jpg"
      );

      expect(
        screen.queryByRole("button", { name: "Send what you know" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "See it in the archive →" })
      ).not.toBeInTheDocument();
    });

    it("shows the miniature ochre Vimeo frame, with no image request", () => {
      const { container } = render(
        <DuplicateCard
          status="pending"
          platform="VIMEO"
          externalId="218447301"
        />
      );

      expect(screen.getAllByText("Vimeo").length).toBeGreaterThan(0);
      expect(screen.getByText("Vimeo · not public yet")).toBeInTheDocument();
      expect(container.querySelector("img")).toBeNull();

      expect(
        screen.queryByRole("button", { name: "Send what you know" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "See it in the archive →" })
      ).not.toBeInTheDocument();
    });
  });
});
