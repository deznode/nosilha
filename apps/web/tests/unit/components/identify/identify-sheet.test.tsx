import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IdentifySheet } from "@/components/identify/identify-sheet";
import { useIdentifyStore, type IdentifyContext } from "@/stores/identifyStore";

const submitSuggestion = vi.fn();
vi.mock("@/lib/api", () => ({
  submitSuggestion: (...args: unknown[]) => submitSuggestion(...args),
}));

/** The session, which lands before the auth store does. */
const sessionEmail = { current: null as string | null };
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: {
          session: sessionEmail.current
            ? { user: { email: sessionEmail.current } }
            : null,
        },
      }),
    },
  },
}));

const authState = {
  user: null as { id: string; email?: string } | null,
  isAuthenticated: false,
};
vi.mock("@/stores/authStore", () => ({
  useUser: () => authState.user,
  useIsAuthenticated: () => authState.isAuthenticated,
}));

/** Captures what the sign-in dialog is asked to do, without rendering auth UI. */
const signInDialog = vi.fn();
let signIn: () => void = () => {};
vi.mock("@/components/auth/sign-in-dialog", () => ({
  SignInDialog: (props: {
    open: boolean;
    onSignedIn: () => void;
    onClose: () => void;
  }) => {
    signInDialog(props);
    signIn = props.onSignedIn;
    return props.open ? <div data-testid="sign-in-dialog" /> : null;
  },
}));

const toastShow = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    success: () => ({ show: toastShow }),
    error: () => ({ show: toastShow }),
  }),
}));

const MEDIA_CONTEXT: IdentifyContext = {
  contentType: "media",
  contentId: "188a7f94-daa7-4a87-b2f6-c87add918295",
  mediaId: "188a7f94-daa7-4a87-b2f6-c87add918295",
  field: "photographerCredit",
  pageTitle: "Untitled photograph",
};

/**
 * Spec 034 FR-004 — one sheet, opened from every missing-field question, fillable
 * signed out, with sign-in intercepting only at submit.
 */
describe("IdentifySheet", () => {
  beforeEach(() => {
    authState.user = null;
    authState.isAuthenticated = false;
    submitSuggestion.mockReset().mockResolvedValue({ id: "x", message: "ok" });
    sessionEmail.current = null;
    toastShow.mockReset();
    signInDialog.mockReset();
    useIdentifyStore.setState({ context: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function openSheet(context: IdentifyContext = MEDIA_CONTEXT) {
    const view = render(<IdentifySheet />);
    act(() => useIdentifyStore.getState().open(context));
    return view;
  }

  it("renders nothing until something asks a question", () => {
    render(<IdentifySheet />);

    expect(screen.queryByText("Help identify")).not.toBeInTheDocument();
  });

  describe("copy, exactly as the prototype", () => {
    it("shows the eyebrow, title and body", () => {
      openSheet();

      expect(screen.getByText("Help identify")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Tell us what you recognise" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Answer only what you know. A guess marked as a guess is more use to the archive than a blank."
        )
      ).toBeInTheDocument();
    });

    it("labels three questions with their placeholders", () => {
      openSheet();

      const expected: [string, string][] = [
        ["Where was this taken?", "Faja d'Água, by the harbour"],
        ["Who took it?", "A name, or “not known”"],
        ["Roughly when?", "1984 — or “sometime in the sixties”"],
      ];

      for (const [label, placeholder] of expected) {
        const input = screen.getByLabelText(label);
        expect(input).toHaveAttribute("placeholder", placeholder);
      }
    });

    it("shows both buttons and the footnote", () => {
      openSheet();

      expect(
        screen.getByRole("button", { name: "Send to the curators" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "A person reads every suggestion. Sign-in happens at the end, not before the form."
        )
      ).toBeInTheDocument();
    });
  });

  describe("closing", () => {
    it("closes on Cancel", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByText("Help identify")).not.toBeInTheDocument();
    });

    it("closes on Escape", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.keyboard("{Escape}");

      await waitFor(() =>
        expect(screen.queryByText("Help identify")).not.toBeInTheDocument()
      );
    });

    it("closes on an overlay click", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.click(screen.getByTestId("identify-overlay"));

      expect(screen.queryByText("Help identify")).not.toBeInTheDocument();
    });

    it("does not close when the panel itself is clicked", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.click(screen.getByTestId("identify-panel"));

      expect(screen.getByText("Help identify")).toBeInTheDocument();
    });
  });

  describe("empty submissions", () => {
    it("posts nothing and says so when every answer is blank", async () => {
      const user = userEvent.setup();
      authState.user = { id: "u1", email: "a@b.test" };
      authState.isAuthenticated = true;
      sessionEmail.current = "a@b.test";
      openSheet();

      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      expect(submitSuggestion).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Answer at least one question/i)
      ).toBeInTheDocument();
    });

    it("accepts a single answer", async () => {
      const user = userEvent.setup();
      authState.user = { id: "u1", email: "a@b.test" };
      authState.isAuthenticated = true;
      sessionEmail.current = "a@b.test";
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
    });
  });

  describe("signed out", () => {
    it("is fillable, then opens sign-in at submit and posts nothing", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      expect(screen.getByTestId("sign-in-dialog")).toBeInTheDocument();
      expect(submitSuggestion).not.toHaveBeenCalled();
    });

    it("keeps the sheet and its answers when Escape dismisses sign-in", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );
      await user.keyboard("{Escape}");

      // The dialog owns Escape while it is open; the sheet must not close under it.
      expect(screen.getByText("Help identify")).toBeInTheDocument();
      expect(screen.getByLabelText("Who took it?")).toHaveValue(
        "Maria Tavares"
      );
    });

    it("posts the held submission once after sign-in", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      // What really happens: `signInWithPassword` resolves and `onSignedIn` fires
      // immediately, so `AuthProvider` has NOT filled the store yet — only the
      // session exists. An earlier version of this test primed `authState` first,
      // which is a state the real flow never reaches, and so it passed while the
      // resumed submit was posting an empty name and email.
      sessionEmail.current = "a@b.test";
      act(() => signIn());

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
      const payload = submitSuggestion.mock.calls[0][0];
      expect(payload.name).toBe("a@b.test");
      expect(payload.email).toBe("a@b.test");
    });

    it("reports rather than posting an unattributable suggestion", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      // Sign-in reported success, but no session arrived
      act(() => signIn());

      await waitFor(() =>
        expect(
          screen.getByText(/could not read your account/i)
        ).toBeInTheDocument()
      );
      expect(submitSuggestion).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Who took it?")).toHaveValue(
        "Maria Tavares"
      );
    });

    it("drops the sheet below the sign-in dialog so the form is reachable", async () => {
      const user = userEvent.setup();
      openSheet();

      const overlay = screen.getByTestId("identify-overlay");
      expect(overlay.className).toContain("z-[60]");

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      // Catalyst's Dialog is z-50; at z-60 this overlay covered it, hid the form and
      // ate every click — including one that discarded the typed answers.
      expect(overlay.className).not.toContain("z-[60]");
      expect(overlay.className).toContain("z-40");

      await user.click(overlay);
      expect(screen.getByLabelText("Who took it?")).toHaveValue(
        "Maria Tavares"
      );
    });

    it("does not post when sign-in is dismissed", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      const props = signInDialog.mock.calls.at(-1)?.[0];
      act(() => props.onClose());

      expect(submitSuggestion).not.toHaveBeenCalled();
    });
  });

  describe("payload", () => {
    beforeEach(() => {
      authState.user = { id: "u1", email: "reader@example.test" };
      authState.isAuthenticated = true;
      sessionEmail.current = "reader@example.test";
    });

    it("sends the session identity with the entity and field", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(
        screen.getByLabelText("Where was this taken?"),
        "Faja d'Agua"
      );
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      const payload = submitSuggestion.mock.calls[0][0];

      expect(payload).toMatchObject({
        contentId: MEDIA_CONTEXT.contentId,
        contentType: "media",
        mediaId: MEDIA_CONTEXT.mediaId,
        pageTitle: "Untitled photograph",
        // The session has no display name, so the email stands in for one
        name: "reader@example.test",
        email: "reader@example.test",
      });
    });

    it("classifies a media question as PHOTO_IDENTIFICATION", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      expect(submitSuggestion.mock.calls[0][0].suggestionType).toBe(
        "PHOTO_IDENTIFICATION"
      );
    });

    it("classifies a non-media question as ADDITION", async () => {
      const user = userEvent.setup();
      openSheet({
        contentType: "entry",
        contentId: "33333333-3333-3333-3333-333333333333",
        field: "openingHours",
        pageTitle: "Igreja Nossa Senhora do Monte",
      });

      await user.type(screen.getByLabelText("Roughly when?"), "1826");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      const payload = submitSuggestion.mock.calls[0][0];
      expect(payload.suggestionType).toBe("ADDITION");
      expect(payload.mediaId).toBeUndefined();
    });

    it("composes a message naming the field asked and each answered question", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.type(screen.getByLabelText("Roughly when?"), "about 1975");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      const { message } = submitSuggestion.mock.calls[0][0];

      // The field arrives as a code key and goes out as a phrase: curators read this
      // queue, and "Asked about: photographerCredit" makes them translate a variable.
      expect(message).toContain("Asked about: who took this photograph");
      expect(message).not.toContain("photographerCredit");
      expect(message).toContain("Who took it?");
      expect(message).toContain("Maria Tavares");
      expect(message).toContain("Roughly when?");
      expect(message).toContain("about 1975");
      // Unanswered questions are left out rather than sent blank
      expect(message).not.toContain("Where was this taken?");
      // The API rejects anything shorter
      expect(message.length).toBeGreaterThanOrEqual(10);
    });

    it("reaches the API minimum even for one very short answer", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Roughly when?"), "60s");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      expect(
        submitSuggestion.mock.calls[0][0].message.length
      ).toBeGreaterThanOrEqual(10);
    });
  });

  describe("failure", () => {
    it("reports the error and keeps what was typed", async () => {
      const user = userEvent.setup();
      authState.user = { id: "u1", email: "a@b.test" };
      authState.isAuthenticated = true;
      sessionEmail.current = "a@b.test";
      submitSuggestion.mockRejectedValue(new Error("Network down"));
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );

      await waitFor(() =>
        expect(screen.getByText(/Network down/i)).toBeInTheDocument()
      );
      expect(screen.getByLabelText("Who took it?")).toHaveValue(
        "Maria Tavares"
      );
      expect(screen.getByText("Help identify")).toBeInTheDocument();
    });
  });

  describe("state reset", () => {
    /**
     * The previous version of this test unmounted and re-rendered, which a fresh
     * `useState(EMPTY_ANSWERS)` satisfies on its own — it passed with the reset
     * effect deleted entirely. These exercise the effect without remounting, which
     * is the situation it exists for: Activity keeps `useState` across a hide/show
     * and re-runs effects on show.
     */
    it("clears answers when the sheet reopens over a different record", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");

      act(() =>
        useIdentifyStore.getState().open({
          contentType: "media",
          contentId: "99999999-9999-9999-9999-999999999999",
          mediaId: "99999999-9999-9999-9999-999999999999",
          field: "dateTaken",
          pageTitle: "Another photograph",
        })
      );

      // Carrying a guess about one photograph onto another would attribute it wrongly
      expect(screen.getByLabelText("Who took it?")).toHaveValue("");
    });

    it("clears a previous error when the subject changes", async () => {
      const user = userEvent.setup();
      authState.user = { id: "u1", email: "a@b.test" };
      authState.isAuthenticated = true;
      sessionEmail.current = "a@b.test";
      openSheet();

      await user.click(
        screen.getByRole("button", { name: "Send to the curators" })
      );
      expect(
        screen.getByText(/Answer at least one question/i)
      ).toBeInTheDocument();

      act(() =>
        useIdentifyStore.getState().open({
          ...MEDIA_CONTEXT,
          contentId: "99999999-9999-9999-9999-999999999999",
        })
      );

      expect(
        screen.queryByText(/Answer at least one question/i)
      ).not.toBeInTheDocument();
    });
  });
});
