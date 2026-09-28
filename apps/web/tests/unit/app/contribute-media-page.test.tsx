import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api-error";
import type { ContributionDraft } from "@/features/contribute/lib/contribution-draft";
import type { FilmLookupResult } from "@/features/contribute/hooks/use-film-lookup";
import type { PlaceValue } from "@/features/contribute/components/town-field";
import type { SignedInInfo } from "@/features/contribute/hooks/use-sign-in-flow";

interface PhotoState {
  state: string;
  progress: number;
  lastError: Error | null;
  file: File | null;
}

const mocks = vi.hoisted(() => ({
  auth: {
    user: null as { id: string; email?: string } | null,
    session: null as { user: Record<string, string> } | null,
    loading: false,
  },
  photo: {} as PhotoState,
  upload: vi.fn(),
  selectFile: vi.fn(),
  resetUpload: vi.fn(),
  submitExternalMedia: vi.fn(),
  replace: vi.fn(),
  lookup: { status: "idle" } as FilmLookupResult,
  draftLoad: vi.fn(),
  draftClear: vi.fn(),
  lastDraft: null as unknown,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => "/contribute/media",
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/hooks/usePhotoUpload", () => ({
  usePhotoUpload: () => ({
    ...mocks.photo,
    error: null,
    previewUrl: mocks.photo.file ? "blob:held-preview" : null,
    metadata: mocks.photo.file ? { hasExifData: true } : null,
    photoType: "COMMUNITY_EVENT",
    setPhotoType: vi.fn(),
    selectFile: mocks.selectFile,
    upload: mocks.upload,
    reset: mocks.resetUpload,
  }),
}));

vi.mock("@/lib/api", () => ({
  submitExternalMedia: mocks.submitExternalMedia,
  submitMediaCorrection: vi.fn(),
}));

vi.mock("@/features/contribute/hooks/use-film-lookup", () => ({
  useFilmLookup: () => mocks.lookup,
}));

vi.mock("@/features/contribute/lib/contribution-draft", () => ({
  contributionDraftStore: {
    load: mocks.draftLoad,
    clear: mocks.draftClear,
    probe: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock("@/components/gallery/metadata-badges", () => ({
  MetadataBadges: () => null,
}));
vi.mock("@/components/gallery/photo-type-selector", () => ({
  PhotoTypeSelector: () => null,
}));

// The town field is tested on its own; here it only needs to set a place.
vi.mock("@/features/contribute/components/town-field", () => ({
  TownField: ({
    label,
    onChange,
  }: {
    label: string;
    onChange: (value: PlaceValue) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          townId: "town-ns",
          townName: "Nova Sintra",
          detail: "by the church",
          mode: "town",
        })
      }
    >
      {label}: pick Nova Sintra
    </button>
  ),
}));

// The sheet is tested on its own; here it reports sign-in or dismissal.
vi.mock("@/features/contribute/components/sign-in-sheet", () => ({
  SignInSheet: ({
    open,
    onClose,
    onSignedIn,
    getDraft,
    initialView,
  }: {
    open: boolean;
    onClose: () => void;
    onSignedIn: (info: SignedInInfo) => void;
    getDraft: () => unknown;
    initialView?: string;
  }) =>
    open ? (
      <div role="dialog" aria-label="Confirm it's you">
        <span>view: {initialView}</span>
        <button
          type="button"
          onClick={() =>
            onSignedIn({ isNewUser: false, email: "maria@example.com" })
          }
        >
          Complete sign-in
        </button>
        <button
          type="button"
          onClick={() =>
            onSignedIn({ isNewUser: true, email: "maria@example.com" })
          }
        >
          Complete sign-in as a new user
        </button>
        <button
          type="button"
          onClick={() => {
            mocks.lastDraft = getDraft();
          }}
        >
          Take draft
        </button>
        <button type="button" onClick={onClose}>
          Dismiss
        </button>
      </div>
    ) : null,
}));

import MediaContributionPage from "@/app/(main)/contribute/media/page";
import { Confirmation } from "@/features/contribute/components/confirmation";

const PRINT = new File(["x"], "avo-maria-1962.jpg", { type: "image/jpeg" });

function sendButton() {
  return screen.getByRole("button", {
    name: /to continue$|^Send to the archive$|^Try again$/,
  });
}

function fillPhoto() {
  fireEvent.change(screen.getByLabelText("What is it called?"), {
    target: { value: "My grandmother at the festa" },
  });
  fireEvent.change(screen.getByLabelText("What does it show?"), {
    target: { value: "Maria, on the left" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /Where was it taken\?: pick/ })
  );
  fireEvent.change(screen.getByLabelText("Who took this photograph?"), {
    target: { value: "José Tavares" },
  });
  fireEvent.change(screen.getByLabelText("Who is giving it to us?"), {
    target: { value: "Maria Tavares" },
  });
  fireEvent.change(screen.getByLabelText("Roughly when?"), {
    target: { value: "1962" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

function fillFilm() {
  fireEvent.change(screen.getByLabelText("Link to the film"), {
    target: { value: "https://youtu.be/k3Zq8XfT0aE" },
  });
  fireEvent.change(screen.getByLabelText("Title of the film"), {
    target: { value: "Festa de São João, 1987" },
  });
  fireEvent.change(screen.getByLabelText("Who made this film?"), {
    target: { value: "Djon Lopes" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /Where was it filmed\?: pick/ })
  );
  fireEvent.click(screen.getByRole("checkbox"));
}

function draft(overrides: Partial<ContributionDraft> = {}): ContributionDraft {
  return {
    kind: "photo",
    form: {
      title: "My grandmother at the festa",
      description: "",
      photographer: "José Tavares, my uncle",
      source: "Maria Tavares",
      date: "1962",
      place: {
        townId: "town-ns",
        townName: "Nova Sintra",
        detail: "by the church",
        mode: "town",
      },
      permission: true,
      filmUrl: "",
    },
    file: PRINT,
    savedAt: Date.now(),
    ...overrides,
  };
}

function signIn(email = "maria@example.com") {
  mocks.auth = {
    user: { id: "u1", email },
    session: {
      user: {
        created_at: "2026-01-01T00:00:00Z",
        last_sign_in_at: "2026-09-28T10:00:00Z",
      },
    },
    loading: false,
  };
}

beforeEach(() => {
  // jsdom has no scrolling; the confirmation scrolls to the top
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState(null, "", "/contribute/media");
  mocks.auth = { user: null, session: null, loading: false };
  mocks.photo = { state: "ready", progress: 0, lastError: null, file: PRINT };
  mocks.upload.mockReset().mockResolvedValue({ media: {}, publicUrl: "" });
  mocks.selectFile.mockReset();
  mocks.resetUpload.mockReset();
  mocks.submitExternalMedia.mockReset().mockResolvedValue({ id: "1" });
  mocks.replace.mockReset();
  mocks.lookup = { status: "idle" };
  mocks.draftLoad.mockReset().mockResolvedValue(null);
  mocks.draftClear.mockReset().mockResolvedValue(undefined);
  mocks.lastDraft = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Contribute media page — photograph", () => {
  it("asks for the photograph first, then the credit, then permission", () => {
    mocks.photo.file = null;
    const { rerender } = render(<MediaContributionPage />);

    expect(sendButton()).toHaveTextContent("Add the photograph to continue");
    expect(sendButton()).toHaveAttribute("aria-disabled", "true");

    mocks.photo.file = PRINT;
    rerender(<MediaContributionPage />);
    expect(sendButton()).toHaveTextContent("Name the photographer to continue");

    fireEvent.change(screen.getByLabelText("Who took this photograph?"), {
      target: { value: "not known" },
    });
    expect(sendButton()).toHaveTextContent("Add your name to continue");

    fireEvent.change(screen.getByLabelText("Who is giving it to us?"), {
      target: { value: "Maria Lopes" },
    });
    expect(sendButton()).toHaveTextContent("Confirm permission to continue");

    fireEvent.click(screen.getByRole("checkbox"));
    expect(sendButton()).toHaveTextContent("Send to the archive");
    expect(sendButton()).toHaveAttribute("aria-disabled", "false");
    expect(
      screen.getByText(
        "Next you confirm your email. Nothing is sent until then."
      )
    ).toBeInTheDocument();
  });

  it("does nothing on submit while the form is incomplete", () => {
    render(<MediaContributionPage />);

    fireEvent.click(sendButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("previews the file the upload hook holds", () => {
    render(<MediaContributionPage />);

    expect(
      screen.getByAltText("The photograph you are giving")
    ).toHaveAttribute("src", "blob:held-preview");
    expect(screen.getByText("avo-maria-1962.jpg")).toBeInTheDocument();
  });

  it("does nothing while the session is still loading", () => {
    mocks.auth = { user: null, session: null, loading: true };
    render(<MediaContributionPage />);
    fillPhoto();

    expect(screen.getByText("Checking sign-in…")).toBeInTheDocument();
    expect(sendButton()).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(sendButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("asks for sign-in at submit, uploads nothing first, then sends everything", async () => {
    render(<MediaContributionPage />);
    fillPhoto();

    fireEvent.click(sendButton());

    expect(screen.getByRole("dialog")).toHaveTextContent("view: start");
    expect(mocks.upload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Complete sign-in" }));

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
    expect(mocks.upload).toHaveBeenCalledWith({
      title: "My grandmother at the festa",
      description: "Maria, on the left",
      photographerCredit: "José Tavares",
      archiveSource: "Maria Tavares",
      approximateDate: "1962",
      townId: "town-ns",
      locationName: "by the church",
    });
  });

  it("hands the sheet a draft of the form and the file", () => {
    render(<MediaContributionPage />);
    fillPhoto();
    fireEvent.click(sendButton());
    fireEvent.click(screen.getByRole("button", { name: "Take draft" }));

    expect(mocks.lastDraft).toMatchObject({
      kind: "photo",
      file: PRINT,
      form: {
        title: "My grandmother at the festa",
        source: "Maria Tavares",
        place: { townId: "town-ns", detail: "by the church" },
      },
    });
  });

  it("does not submit later when sign-in was dismissed", async () => {
    const { rerender } = render(<MediaContributionPage />);
    fillPhoto();
    fireEvent.click(sendButton());
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    signIn();
    rerender(<MediaContributionPage />);

    await new Promise((r) => setTimeout(r, 0));
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("sends straight away when signed in, then confirms with A1", async () => {
    signIn();
    render(<MediaContributionPage />);
    fillPhoto();
    expect(
      screen.getByText("Signed in as maria@example.com.")
    ).toBeInTheDocument();

    fireEvent.click(sendButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      await screen.findByRole("heading", {
        name: "Thank you, Maria. It's with us now.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("In the archive, and on the Nova Sintra page")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nova Sintra · 1962 · taken by José Tavares")
    ).toBeInTheDocument();
    expect(screen.queryByText(/made an account/)).toBeNull();
    expect(screen.queryByText("Archive Updated")).toBeNull();
    expect(mocks.draftClear).toHaveBeenCalled();
    expect(
      screen.getByRole("link", { name: "See the photographs" })
    ).toHaveAttribute("href", "/photographs");
  });

  it("adds the A2 note only when this sign-in created the account", async () => {
    render(<MediaContributionPage />);
    fillPhoto();
    fireEvent.click(sendButton());
    fireEvent.click(
      screen.getByRole("button", { name: "Complete sign-in as a new user" })
    );

    expect(
      await screen.findByText(/we've made an account for maria@example.com/)
    ).toBeInTheDocument();
  });

  it("starts an empty form of the same kind from the confirmation", async () => {
    signIn();
    render(<MediaContributionPage />);
    fillPhoto();
    fireEvent.click(sendButton());

    fireEvent.click(
      await screen.findByRole("button", { name: "Give another photograph" })
    );

    expect(screen.getByLabelText("What is it called?")).toHaveValue("");
    expect(mocks.resetUpload).toHaveBeenCalled();
  });

  it("shows P5 while the photograph uploads", () => {
    mocks.photo = { ...mocks.photo, state: "uploading", progress: 64 };
    render(<MediaContributionPage />);

    expect(
      screen.getByRole("button", { name: "Sending · 64%" })
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "64"
    );
  });

  it("keeps everything after a failed upload and offers Try again (P6)", async () => {
    signIn();
    mocks.photo = {
      ...mocks.photo,
      state: "error",
      lastError: new Error("network"),
    };
    render(<MediaContributionPage />);
    fillPhoto();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The photograph didn't upload"
    );
    // Corrected after the failure: the retry sends what the form says now
    fireEvent.change(screen.getByLabelText("Roughly when?"), {
      target: { value: "1963" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.objectContaining({ approximateDate: "1963" })
    );
  });

  it("can't switch kind while sending", () => {
    mocks.photo = { ...mocks.photo, state: "uploading", progress: 10 };
    render(<MediaContributionPage />);

    expect(screen.getByRole("button", { name: "Film link" })).toBeDisabled();
  });

  it("holds the button for Retry-After when the upload is rate limited", () => {
    signIn();
    mocks.photo = {
      ...mocks.photo,
      state: "error",
      lastError: new ApiError("Too many", 429, 60),
    };
    render(<MediaContributionPage />);
    fillPhoto();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "You've sent a lot in a short time"
    );
    expect(screen.getByRole("alert")).toHaveTextContent("about 1 minute,");
    expect(screen.queryByText("The photograph didn't upload")).toBeNull();
    expect(sendButton()).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(sendButton());
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});

describe("Contribute media page — film", () => {
  beforeEach(() => {
    mocks.photo.file = null;
    window.history.replaceState(null, "", "/contribute/media?kind=film");
  });

  it("opens in film mode from ?kind=film", () => {
    render(<MediaContributionPage />);

    expect(
      screen.getByRole("heading", { name: "Give a film to the archive" })
    ).toBeInTheDocument();
    expect(sendButton()).toHaveTextContent(
      "Paste a YouTube or Vimeo link to continue"
    );
    expect(
      screen.getByText("YouTube or Vimeo only, for now.")
    ).toBeInTheDocument();
  });

  it("says when a link isn't YouTube or Vimeo (F4)", () => {
    render(<MediaContributionPage />);
    fireEvent.change(screen.getByLabelText("Link to the film"), {
      target: { value: "https://www.facebook.com/watch/?v=101583" },
    });

    expect(screen.getByLabelText("Link to the film")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(
      screen.getByText(/doesn't look like a YouTube or Vimeo link/)
    ).toBeInTheDocument();
  });

  it("replaces the form with the duplicate card when the film is public (F5)", () => {
    mocks.lookup = {
      status: "public",
      media: { id: "m1", url: "/films/m1" },
    };
    render(<MediaContributionPage />);
    fireEvent.change(screen.getByLabelText("Link to the film"), {
      target: { value: "https://youtu.be/k3Zq8XfT0aE" },
    });

    expect(screen.getByText("Already in the archive")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See it in the archive →" })
    ).toHaveAttribute("href", "/films/m1");
    expect(screen.queryByLabelText("Title of the film")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Send to the archive/ })
    ).toBeNull();
  });

  it("sends the film's place, date and description, then confirms with A3", async () => {
    signIn();
    render(<MediaContributionPage />);
    fillFilm();
    fireEvent.change(screen.getByLabelText("What does it show?"), {
      target: { value: "The procession" },
    });
    fireEvent.change(screen.getByLabelText("Roughly when?"), {
      target: { value: "1987" },
    });

    fireEvent.click(sendButton());

    await waitFor(() =>
      expect(mocks.submitExternalMedia).toHaveBeenCalledWith({
        title: "Festa de São João, 1987",
        description: "The procession",
        mediaType: "VIDEO",
        platform: "YOUTUBE",
        url: "https://youtu.be/k3Zq8XfT0aE",
        externalId: "k3Zq8XfT0aE",
        author: "Djon Lopes",
        approximateDate: "1987",
        townId: "town-ns",
        locationName: "by the church",
      })
    );
    expect(
      await screen.findByRole("heading", {
        name: "Thank you. The film link is with us.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("In the archive, in Films")).toBeInTheDocument();
    expect(
      screen.getByText("YouTube · Nova Sintra · made by Djon Lopes")
    ).toBeInTheDocument();
  });

  it("shows F7 on a 429 and unlocks after Retry-After", async () => {
    vi.useFakeTimers();
    signIn();
    mocks.submitExternalMedia.mockRejectedValue(
      new ApiError("Too many", 429, 120)
    );
    render(<MediaContributionPage />);
    fillFilm();

    fireEvent.click(sendButton());
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please wait about 2 minutes"
    );
    expect(
      screen.getByText("You can send again in about 2 minutes.")
    ).toBeInTheDocument();
    expect(sendButton()).toHaveAttribute("aria-disabled", "true");

    act(() => {
      vi.advanceTimersByTime(121_000);
    });

    expect(screen.queryByRole("alert")).toBeNull();
    expect(sendButton()).toHaveAttribute("aria-disabled", "false");
  });

  it("falls back to 10 minutes when a 429 has no Retry-After", async () => {
    signIn();
    mocks.submitExternalMedia.mockRejectedValue(new ApiError("Too many", 429));
    render(<MediaContributionPage />);
    fillFilm();

    fireEvent.click(sendButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please wait about 10 minutes"
    );
  });
});

describe("Contribute media page — resuming after Google", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/contribute/media?resume=1");
  });

  it("shows the restored record (S9) with a draft and a session, then sends it", async () => {
    signIn();
    mocks.draftLoad.mockResolvedValue(draft());
    render(<MediaContributionPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Your photograph is still here",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You're signed in as maria@example.com/)
    ).toBeInTheDocument();
    expect(screen.getByText("Nova Sintra, by the church")).toBeInTheDocument();
    expect(screen.getByText("José Tavares, my uncle")).toBeInTheDocument();
    expect(mocks.selectFile).toHaveBeenCalledWith(PRINT);
    expect(mocks.replace).toHaveBeenCalledWith("/contribute/media", {
      scroll: false,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Send to the archive" })
    );
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByRole("heading", {
        name: "Thank you, Maria. It's with us now.",
      })
    ).toBeInTheDocument();
  });

  it("goes back to the form from S9 with everything in it", async () => {
    signIn();
    mocks.draftLoad.mockResolvedValue(draft());
    render(<MediaContributionPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Change something first" })
    );

    expect(screen.getByLabelText("What is it called?")).toHaveValue(
      "My grandmother at the festa"
    );
  });

  it("restores the form and reopens the sheet as S10 without a session", async () => {
    mocks.draftLoad.mockResolvedValue(draft());
    render(<MediaContributionPage />);

    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText("view: cancelled")).toBeInTheDocument();
    expect(screen.getByLabelText("Who is giving it to us?")).toHaveValue(
      "Maria Tavares"
    );

    // Signing in from S10 sends the held contribution
    fireEvent.click(screen.getByRole("button", { name: "Complete sign-in" }));
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
  });

  it("discards the draft when S10 is dismissed", async () => {
    mocks.draftLoad.mockResolvedValue(draft());
    render(<MediaContributionPage />);

    await screen.findByText("view: cancelled");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(mocks.draftClear).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("What is it called?")).toHaveValue(
      "My grandmother at the festa"
    );
  });

  it("waits for the restored photo to be read before sending after S10", async () => {
    mocks.photo = { ...mocks.photo, state: "extracting" };
    mocks.draftLoad.mockResolvedValue(draft());
    const { rerender } = render(<MediaContributionPage />);

    await screen.findByText("view: cancelled");
    fireEvent.click(screen.getByRole("button", { name: "Complete sign-in" }));
    await new Promise((r) => setTimeout(r, 0));
    expect(mocks.upload).not.toHaveBeenCalled();

    mocks.photo = { ...mocks.photo, state: "ready" };
    rerender(<MediaContributionPage />);

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(1));
  });

  it("treats a Google error as S10", async () => {
    window.history.replaceState(
      null,
      "",
      "/contribute/media?resume=1&auth_error=1"
    );
    mocks.draftLoad.mockResolvedValue(draft());
    render(<MediaContributionPage />);

    expect(await screen.findByText("view: cancelled")).toBeInTheDocument();
  });

  it("shows S10b on an empty form when signed in with no draft", async () => {
    signIn();
    mocks.photo.file = null;
    render(<MediaContributionPage />);

    expect(
      await screen.findByText(
        "We couldn't find your photograph in this browser"
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("What is it called?")).toHaveValue("");
    expect(mocks.replace).toHaveBeenCalledWith("/contribute/media", {
      scroll: false,
    });
  });

  it("resumes a film draft in film mode", async () => {
    signIn();
    mocks.photo.file = null;
    mocks.draftLoad.mockResolvedValue(
      draft({
        kind: "film",
        file: null,
        form: { ...draft().form, filmUrl: "https://vimeo.com/218447301" },
      })
    );
    render(<MediaContributionPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Your film link is still here",
      })
    ).toBeInTheDocument();
    expect(mocks.selectFile).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/contribute/media?kind=film", {
      scroll: false,
    });
  });

  it("waits for the session before choosing", async () => {
    mocks.auth = { user: null, session: null, loading: true };
    mocks.draftLoad.mockResolvedValue(draft());
    const { rerender } = render(<MediaContributionPage />);

    await new Promise((r) => setTimeout(r, 0));
    expect(mocks.draftLoad).not.toHaveBeenCalled();

    signIn();
    rerender(<MediaContributionPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Your photograph is still here",
      })
    ).toBeInTheDocument();
  });

  it("starts clean on a visit without resume", async () => {
    window.history.replaceState(null, "", "/contribute/media");
    signIn();
    render(<MediaContributionPage />);

    await new Promise((r) => setTimeout(r, 0));
    expect(mocks.draftLoad).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(
      screen.queryByText("We couldn't find your photograph in this browser")
    ).toBeNull();
  });
});

describe("Contribute media page — Activity hide and show", () => {
  // cacheComponents keeps a left route mounted inside <Activity>: state
  // survives, effects are destroyed on hide and re-run on show.
  function Harness({ mode }: { mode: "visible" | "hidden" }) {
    return (
      <Activity mode={mode}>
        <MediaContributionPage />
      </Activity>
    );
  }

  it("starts a return visit without resume on an empty form", () => {
    const { rerender } = render(<Harness mode="visible" />);
    fireEvent.change(screen.getByLabelText("What is it called?"), {
      target: { value: "Half typed" },
    });

    rerender(<Harness mode="hidden" />);
    rerender(<Harness mode="visible" />);

    expect(screen.getByLabelText("What is it called?")).toHaveValue("");
    expect(mocks.draftLoad).not.toHaveBeenCalled();
  });

  it("does not bring a resumed draft back once resume has been dropped", async () => {
    window.history.replaceState(null, "", "/contribute/media?resume=1");
    signIn();
    mocks.draftLoad.mockResolvedValue(draft());
    const { rerender } = render(<Harness mode="visible" />);
    await screen.findByRole("heading", {
      name: "Your photograph is still here",
    });

    // What router.replace did; the next visit has no resume
    window.history.replaceState(null, "", "/contribute/media");
    rerender(<Harness mode="hidden" />);
    rerender(<Harness mode="visible" />);

    expect(
      screen.getByRole("heading", { name: "Give a photograph to the archive" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("What is it called?")).toHaveValue("");
    expect(mocks.draftLoad).toHaveBeenCalledTimes(1);
  });

  it("does not lock a fresh form again for a 429 it already handled", () => {
    signIn();
    mocks.photo = {
      ...mocks.photo,
      state: "error",
      lastError: new ApiError("Too many", 429, 60),
    };
    const { rerender } = render(<Harness mode="visible" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You've sent a lot in a short time"
    );

    rerender(<Harness mode="hidden" />);
    rerender(<Harness mode="visible" />);

    expect(screen.queryByText("You've sent a lot in a short time")).toBeNull();
  });

  it("reads the draft again when shown on a resume URL", async () => {
    window.history.replaceState(null, "", "/contribute/media?resume=1");
    signIn();
    mocks.draftLoad.mockResolvedValue(draft());
    const { rerender } = render(<Harness mode="visible" />);
    await screen.findByRole("heading", {
      name: "Your photograph is still here",
    });

    rerender(<Harness mode="hidden" />);
    rerender(<Harness mode="visible" />);

    expect(
      await screen.findByRole("heading", {
        name: "Your photograph is still here",
      })
    ).toBeInTheDocument();
    expect(mocks.draftLoad).toHaveBeenCalledTimes(2);
  });
});

describe("Confirmation copy", () => {
  const base = {
    kind: "photo" as const,
    title: "Your photograph",
    meta: "",
    town: null,
    giverFirstName: null,
    imageSrc: null,
    vimeo: false,
    newAccountEmail: null,
  };

  it("drops the name and the town suffix when they are missing", () => {
    render(<Confirmation record={base} onAgain={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Thank you. It's with us now." })
    ).toBeInTheDocument();
    expect(screen.getByText("In the archive")).toBeInTheDocument();
  });

  it("names the giver and the town page when both are known", () => {
    render(
      <Confirmation
        record={{ ...base, giverFirstName: "Maria", town: "Furna" }}
        onAgain={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Thank you, Maria. It's with us now.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("In the archive, and on the Furna page")
    ).toBeInTheDocument();
  });
});
