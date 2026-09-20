import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  auth: { user: null as { id: string } | null, loading: false },
  upload: vi.fn(),
  submitExternalMedia: vi.fn(),
  file: null as File | null,
}));

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({ session: null, ...mocks.auth }),
}));

vi.mock("@/hooks/usePhotoUpload", () => ({
  usePhotoUpload: () => ({
    state: mocks.file ? "ready" : "idle",
    progress: 0,
    error: null,
    file: mocks.file,
    previewUrl: mocks.file ? "blob:held-preview" : null,
    metadata: mocks.file ? { hasExifData: true } : null,
    photoType: "COMMUNITY_EVENT",
    setPhotoType: vi.fn(),
    selectFile: vi.fn(),
    upload: mocks.upload,
    reset: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  submitExternalMedia: mocks.submitExternalMedia,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: vi.fn() }),
    error: () => ({ show: vi.fn() }),
  }),
}));

vi.mock("@/components/gallery/metadata-badges", () => ({
  MetadataBadges: () => null,
}));
vi.mock("@/components/gallery/photo-type-selector", () => ({
  PhotoTypeSelector: () => null,
}));

// The dialog is tested on its own; here it only needs to report sign-in or dismissal.
vi.mock("@/components/auth/sign-in-dialog", () => ({
  SignInDialog: ({
    open,
    onClose,
    onSignedIn,
  }: {
    open: boolean;
    onClose: () => void;
    onSignedIn: () => void;
    held?: ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label="Sign in">
        <button type="button" onClick={onSignedIn}>
          Complete sign-in
        </button>
        <button type="button" onClick={onClose}>
          Dismiss
        </button>
      </div>
    ) : null,
}));

import MediaContributionPage from "@/app/(main)/contribute/media/page";

function submitButton() {
  return screen.getByRole("button", {
    name: /to continue|^Submit|^Checking sign-in/,
  });
}

function fillRequired(
  whoLabel = "Who took this photograph?",
  permissionLabel = "Confirm you have the right to share this photograph"
) {
  fireEvent.change(screen.getByLabelText(whoLabel), {
    target: { value: "not known" },
  });
  fireEvent.change(screen.getByLabelText("Who is giving it to us?"), {
    target: { value: "Maria Lopes" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: permissionLabel }));
}

describe("Contribute media page", () => {
  beforeEach(() => {
    mocks.auth = { user: null, loading: false };
    mocks.file = new File(["x"], "print.jpg", { type: "image/jpeg" });
    mocks.upload.mockReset().mockResolvedValue({ media: {}, publicUrl: "" });
    mocks.submitExternalMedia.mockReset().mockResolvedValue({ id: "1" });
  });

  it("is fully fillable signed out, with no sign-in wall", () => {
    render(<MediaContributionPage />);

    for (const label of [
      "Who took this photograph?",
      "Who is giving it to us?",
      "Where was it taken?",
      "Roughly when?",
    ]) {
      expect(screen.getByLabelText(label)).toBeEnabled();
    }
    expect(screen.queryByText(/Sign in to Share/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sign In/i })).toBeNull();
    expect(submitButton()).not.toBeDisabled();
  });

  it("annotates each input with the column it writes to", () => {
    render(<MediaContributionPage />);

    expect(screen.getByText("photographer_credit")).toBeInTheDocument();
    expect(screen.getByText("archive_source")).toBeInTheDocument();
    expect(
      screen.getByText("location_name · linked to a settlement where possible")
    ).toBeInTheDocument();
    expect(
      screen.getByText("approximate_date · a decade is enough")
    ).toBeInTheDocument();
  });

  it("accepts a vague date as free text", () => {
    render(<MediaContributionPage />);

    const date = screen.getByLabelText("Roughly when?");
    expect(date).toHaveAttribute("type", "text");
    fireEvent.change(date, { target: { value: "sometime in the sixties" } });
    expect(date).toHaveValue("sometime in the sixties");
  });

  it("advances photographer → contributor → permission → submit", () => {
    render(<MediaContributionPage />);

    expect(submitButton()).toHaveTextContent(
      "Name the photographer to continue"
    );
    expect(submitButton()).toHaveAttribute("aria-disabled", "true");

    fireEvent.change(screen.getByLabelText("Who took this photograph?"), {
      target: { value: "not known" },
    });
    expect(submitButton()).toHaveTextContent("Add your name to continue");

    fireEvent.change(screen.getByLabelText("Who is giving it to us?"), {
      target: { value: "Maria Lopes" },
    });
    expect(submitButton()).toHaveTextContent("Confirm permission to continue");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Confirm you have the right to share this photograph",
      })
    );
    expect(submitButton()).toHaveTextContent("Submit — you sign in at the end");
    expect(submitButton()).toHaveAttribute("aria-disabled", "false");
  });

  it("does nothing on submit while the form is incomplete", () => {
    render(<MediaContributionPage />);

    fireEvent.click(submitButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("says the file's name is published with a photograph, and not for a film", () => {
    render(<MediaContributionPage />);

    const notice =
      "original_name · the file's name is published with the photograph";
    expect(screen.getByText(notice)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /film link/i }));
    expect(screen.queryByText(notice)).toBeNull();
  });

  it("previews the file the upload hook holds, so what is shown is what uploads", () => {
    render(<MediaContributionPage />);

    expect(
      screen.getByAltText("The photograph you are giving")
    ).toHaveAttribute("src", "blob:held-preview");
  });

  it("says it is checking sign-in, and does nothing, while the session loads", () => {
    mocks.auth = { user: null, loading: true };
    render(<MediaContributionPage />);
    fillRequired();

    expect(submitButton()).toHaveTextContent("Checking sign-in…");
    expect(submitButton()).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(submitButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("asks for sign-in at submit, uploads nothing first, then resumes", async () => {
    render(<MediaContributionPage />);
    fillRequired();
    fireEvent.change(screen.getByLabelText("Where was it taken?"), {
      target: { value: "Faja d'Agua, by the harbour" },
    });
    fireEvent.change(screen.getByLabelText("Roughly when?"), {
      target: { value: "sometime in the sixties" },
    });

    fireEvent.click(submitButton());

    expect(screen.getByRole("dialog", { name: "Sign in" })).toBeInTheDocument();
    expect(mocks.upload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Complete sign-in" }));

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        photographerCredit: "not known",
        archiveSource: "Maria Lopes",
        locationName: "Faja d'Agua, by the harbour",
        approximateDate: "sometime in the sixties",
      })
    );
  });

  it("does not submit later when sign-in was dismissed", async () => {
    const { rerender } = render(<MediaContributionPage />);
    fillRequired();
    fireEvent.click(submitButton());
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    mocks.auth = { user: { id: "u1" }, loading: false };
    rerender(<MediaContributionPage />);

    await new Promise((r) => setTimeout(r, 0));
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("submits directly when already signed in", async () => {
    mocks.auth = { user: { id: "u1" }, loading: false };
    render(<MediaContributionPage />);
    fillRequired();

    fireEvent.click(submitButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
  });

  it("gives a film link, asking only for what a film submission stores", async () => {
    mocks.auth = { user: { id: "u1" }, loading: false };
    mocks.file = null;
    render(<MediaContributionPage />);

    fireEvent.click(screen.getByRole("button", { name: /film link/i }));

    // SubmitExternalMediaRequest has no contributor, place or date: never collect them
    for (const label of [
      "Who is giving it to us?",
      "Where was it taken?",
      "Roughly when?",
    ]) {
      expect(screen.queryByLabelText(label)).toBeNull();
    }

    fireEvent.change(screen.getByLabelText("Who made this film?"), {
      target: { value: "not known" },
    });
    expect(submitButton()).toHaveTextContent("Confirm permission to continue");
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Confirm you have the right to share this film",
      })
    );
    fireEvent.change(screen.getByLabelText("Title of the film"), {
      target: { value: "Festa de São João, 1984" },
    });
    fireEvent.change(screen.getByLabelText("Link to the film"), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(mocks.submitExternalMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Festa de São João, 1984",
          author: "not known",
          platform: "YOUTUBE",
          externalId: "dQw4w9WgXcQ",
          mediaType: "VIDEO",
        })
      )
    );
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});
