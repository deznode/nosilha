import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyLinkAction, ShareAction } from "@/components/ui/archive-actions";

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: (message: string) => ({ show: () => toastSuccess(message) }),
    error: (message: string) => ({ show: () => toastError(message) }),
  }),
}));

const trackEvent = vi.fn();
vi.mock("@/lib/ga", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

const writeText = vi.fn();
const nativeShare = vi.fn();

function setNativeShare(value: typeof nativeShare | undefined) {
  Object.defineProperty(navigator, "share", { configurable: true, value });
}

const sharedUrl = () => new URL(nativeShare.mock.calls[0][0].url);
const copiedText = () => writeText.mock.calls[0][0] as string;

describe("archive actions", () => {
  beforeEach(() => {
    window.history.replaceState(
      null,
      "",
      "/furna/igreja?utm_source=share&ask=1"
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    writeText.mockReset().mockResolvedValue(undefined);
    nativeShare.mockReset().mockResolvedValue(undefined);
    setNativeShare(nativeShare);
    toastSuccess.mockReset();
    toastError.mockReset();
    trackEvent.mockReset();
  });

  afterEach(() => setNativeShare(undefined));

  it("shares the page's link tagged as an entry share", async () => {
    render(<ShareAction title="Igreja" />);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(nativeShare).toHaveBeenCalledTimes(1));
    expect(sharedUrl().pathname).toBe("/furna/igreja");
    expect(sharedUrl().searchParams.get("utm_source")).toBe("share");
    expect(sharedUrl().searchParams.get("utm_campaign")).toBe("entry");
    expect(sharedUrl().searchParams.has("ask")).toBe(false);
  });

  it("copies a tagged link from Copy link", async () => {
    render(<CopyLinkAction />);
    await userEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(new URL(copiedText()).searchParams.get("utm_campaign")).toBe(
      "entry"
    );
    expect(toastSuccess).toHaveBeenCalledWith("Link copied");
  });

  it("sends the message and moment, and counts a completed share", async () => {
    render(
      <ShareAction
        title="The harbour"
        text="The harbour. From the Brava archive."
        moment="photo"
        itemId="abc"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(1));
    expect(nativeShare.mock.calls[0][0]).toMatchObject({
      title: "The harbour",
      text: "The harbour. From the Brava archive.",
    });
    expect(sharedUrl().searchParams.get("utm_campaign")).toBe("photo");
    expect(trackEvent).toHaveBeenCalledWith({
      action: "share",
      content_type: "photo",
      item_id: "abc",
      method: "native",
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("does nothing more when the share sheet is dismissed", async () => {
    nativeShare.mockRejectedValue(
      Object.assign(new Error("cancelled"), { name: "AbortError" })
    );
    render(<ShareAction title="The harbour" moment="photo" itemId="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(nativeShare).toHaveBeenCalledTimes(1));
    expect(writeText).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("copies the message and link when the share sheet refuses the payload", async () => {
    nativeShare.mockRejectedValue(new TypeError("unsupported"));
    render(
      <ShareAction
        title="Furna"
        text="Furna in the Brava archive."
        moment="town"
        itemId="furna"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const [message, link] = copiedText().split("\n");
    expect(message).toBe("Furna in the Brava archive.");
    expect(new URL(link).searchParams.get("utm_campaign")).toBe("town");
    expect(toastSuccess).toHaveBeenCalledWith("Message and link copied");
    expect(trackEvent).toHaveBeenCalledWith({
      action: "share",
      content_type: "town",
      item_id: "furna",
      method: "copy",
    });
  });

  it("copies where there is no share sheet, and sets the ask flag", async () => {
    setNativeShare(undefined);
    render(
      <ShareAction
        title="Do you recognise this photograph?"
        text="Do you recognise this photograph?"
        label="Ask someone who might know"
        moment="ask"
        itemId="abc"
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Ask someone who might know" })
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(new URL(copiedText().split("\n")[1]).searchParams.get("ask")).toBe(
      "1"
    );
  });

  it("reports a copy that failed and counts nothing", async () => {
    setNativeShare(undefined);
    writeText.mockRejectedValue(new Error("denied"));
    render(<ShareAction title="The harbour" moment="photo" itemId="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Could not copy the link")
    );
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("counts Copy link under its moment", async () => {
    render(<CopyLinkAction moment="film" itemId="f1" />);
    await userEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(1));
    expect(new URL(copiedText()).searchParams.get("utm_campaign")).toBe("film");
    expect(trackEvent).toHaveBeenCalledWith({
      action: "share",
      content_type: "film",
      item_id: "f1",
      method: "copy",
    });
  });
});
