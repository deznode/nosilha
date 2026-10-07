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
});
