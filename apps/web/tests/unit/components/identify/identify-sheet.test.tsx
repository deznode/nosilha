import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IdentifySheet } from "@/components/identify/identify-sheet";
import { ApiError } from "@/lib/api-error";
import { useIdentifyStore, type IdentifyContext } from "@/stores/identifyStore";
import { useShareArrivalStore } from "@/stores/shareArrivalStore";

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
};
vi.mock("@/stores/authStore", () => ({
  useUser: () => authState.user,
}));

/** Stands in for the sign-in dialog, without rendering auth UI. */
let signIn: () => void = () => {};
vi.mock("@/components/auth/sign-in-dialog", () => ({
  SignInDialog: (props: { open: boolean; onSignedIn: () => void }) => {
    signIn = props.onSignedIn;
    return props.open ? <div data-testid="sign-in-dialog" /> : null;
  },
}));

const trackEvent = vi.fn();
vi.mock("@/lib/ga", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
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
 * Spec 034 FR-004, spec 040 FR-008 — one sheet, opened from every missing-field
 * question, answerable without an account.
 */
describe("IdentifySheet", () => {
  beforeEach(() => {
    authState.user = null;
    submitSuggestion.mockReset().mockResolvedValue({ id: "x", message: "ok" });
    sessionEmail.current = null;
    toastShow.mockReset();
    trackEvent.mockReset();
    useShareArrivalStore.setState(useShareArrivalStore.getInitialState());
    useIdentifyStore.setState(useIdentifyStore.getInitialState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function openSheet(context: IdentifyContext = MEDIA_CONTEXT) {
    const view = render(<IdentifySheet />);
    act(() => useIdentifyStore.getState().open(context));
    return view;
  }

  function signInAs(email = "ana@example.com") {
    authState.user = { id: "u1", email };
    sessionEmail.current = email;
  }

  async function answer() {
    await userEvent.type(
      screen.getByLabelText("Roughly when?"),
      "sometime in the sixties"
    );
  }

  async function fillGuest(name = "Ana Lopes", email = "ana@example.com") {
    if (name) await userEvent.type(screen.getByLabelText("Your name"), name);
    if (email) await userEvent.type(screen.getByLabelText("Your email"), email);
  }

  async function pressSend() {
    await userEvent.click(
      screen.getByRole("button", { name: "Send to the curators" })
    );
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

    it("labels four questions on a photograph", () => {
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
      expect(screen.getByLabelText("Who is in it?")).toBeInTheDocument();
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
          "A person reads every suggestion. A curator may write to you about yours."
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

    it("keeps Escape from the page underneath", async () => {
      const onWindowKey = vi.fn();
      window.addEventListener("keydown", onWindowKey);
      openSheet();

      await userEvent.keyboard("{Escape}");
      window.removeEventListener("keydown", onWindowKey);

      // The photo viewer listens on window and reads Escape as "go back"
      expect(onWindowKey).not.toHaveBeenCalled();
    });

    it("takes focus when it opens", () => {
      openSheet();

      expect(screen.getByTestId("identify-panel")).toHaveFocus();
    });

    it("stays open when a drag that began in a field ends on the overlay", async () => {
      openSheet();
      await answer();

      // Selecting text and letting go outside the panel: the press is on the
      // field, the click lands on the common ancestor
      fireEvent.mouseDown(screen.getByLabelText("Roughly when?"));
      fireEvent.click(screen.getByTestId("identify-overlay"));

      expect(screen.getByLabelText("Roughly when?")).toHaveValue(
        "sometime in the sixties"
      );
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
      signInAs("a@b.test");
      openSheet();

      await pressSend();

      expect(submitSuggestion).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Answer at least one question/i)
      ).toBeInTheDocument();
    });

    it("accepts a single answer", async () => {
      const user = userEvent.setup();
      signInAs("a@b.test");
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await pressSend();

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
    });
  });

  describe("signed out", () => {
    it("asks for a name and an email, and sends without an account", async () => {
      openSheet();
      await answer();
      await fillGuest("Ana Lopes", " Ana@Example.com ");
      await pressSend();

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
      expect(submitSuggestion.mock.calls[0][0]).toMatchObject({
        name: "Ana Lopes",
        email: "ana@example.com",
        honeypot: "",
        suggestionType: "PHOTO_IDENTIFICATION",
      });
      expect(screen.queryByTestId("sign-in-dialog")).not.toBeInTheDocument();
    });

    it.each([
      ["no name", "", "ana@example.com"],
      ["a one-letter name", "A", "ana@example.com"],
      ["no email", "Ana Lopes", ""],
      ["a malformed email", "Ana Lopes", "ana@example"],
    ])(
      "refuses %s, posts nothing and keeps the answer",
      async (_, name, email) => {
        openSheet();
        await answer();
        await fillGuest(name, email);
        await pressSend();

        expect(screen.getByRole("alert")).toHaveTextContent(
          "Add your name and an email a curator can reach you at."
        );
        expect(submitSuggestion).not.toHaveBeenCalled();
        expect(screen.getByLabelText("Roughly when?")).toHaveValue(
          "sometime in the sixties"
        );
      }
    );

    it("still refuses an empty answer first", async () => {
      openSheet();
      await fillGuest();
      await pressSend();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Answer at least one question, even if it is a guess."
      );
      expect(submitSuggestion).not.toHaveBeenCalled();
    });

    it("offers sign-in instead, and keeps the answers through it", async () => {
      openSheet();
      await answer();
      await userEvent.click(
        screen.getByRole("button", { name: "Sign in instead" })
      );

      expect(screen.getByTestId("sign-in-dialog")).toBeInTheDocument();
      expect(submitSuggestion).not.toHaveBeenCalled();

      act(() => signIn());
      expect(screen.queryByTestId("sign-in-dialog")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Roughly when?")).toHaveValue(
        "sometime in the sixties"
      );
      expect(submitSuggestion).not.toHaveBeenCalled();
    });

    it("drops the sheet below the sign-in dialog so the form is reachable", async () => {
      openSheet();
      await userEvent.click(
        screen.getByRole("button", { name: "Sign in instead" })
      );

      expect(screen.getByTestId("identify-overlay")).toHaveClass("z-40");
    });

    it("says so when the connection has sent too many", async () => {
      submitSuggestion.mockRejectedValue(
        new ApiError(
          "You have exceeded the maximum number of submissions (5 per hour). Please try again later.",
          429
        )
      );
      openSheet();
      await answer();
      await fillGuest();
      await pressSend();

      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Too many answers from this connection. Please try again in an hour."
        )
      );
      expect(screen.getByLabelText("Roughly when?")).toHaveValue(
        "sometime in the sixties"
      );
    });
  });

  describe("signed in", () => {
    beforeEach(() => signInAs());

    it("asks for no name or email", () => {
      openSheet();

      expect(screen.queryByLabelText("Your name")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Your email")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Sign in instead" })
      ).not.toBeInTheDocument();
    });
  });

  describe("the fourth question", () => {
    beforeEach(() => signInAs());

    it("sends who is in a photograph with the other answers", async () => {
      openSheet();
      await userEvent.type(
        screen.getByLabelText("Who is in it?"),
        "My grandmother, Maria"
      );
      await pressSend();

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
      expect(submitSuggestion.mock.calls[0][0].message).toContain(
        "Who is in it? My grandmother, Maria"
      );
    });

    it("is not asked about a town or a place", () => {
      openSheet({
        contentType: "town",
        contentId: "188a7f94-daa7-4a87-b2f6-c87add918295",
        field: "founded",
        pageTitle: "Furna",
      });

      expect(screen.queryByLabelText("Who is in it?")).not.toBeInTheDocument();
    });
  });

  describe("answers from a share arrival", () => {
    beforeEach(() => signInAs());

    async function send() {
      openSheet();
      await answer();
      await pressSend();
      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));
    }

    it("are counted", async () => {
      useShareArrivalStore.setState({ arrived: true });
      await send();

      expect(trackEvent).toHaveBeenCalledWith({
        action: "share_arrival_answer",
        content_type: "media",
      });
    });

    it("are not counted on an ordinary visit", async () => {
      await send();

      expect(trackEvent).not.toHaveBeenCalled();
    });
  });

  describe("payload", () => {
    beforeEach(() => {
      signInAs("reader@example.test");
    });

    it("sends the session identity with the entity and field", async () => {
      const user = userEvent.setup();
      openSheet();

      await user.type(
        screen.getByLabelText("Where was this taken?"),
        "Faja d'Agua"
      );
      await pressSend();

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
      await pressSend();

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
      await pressSend();

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
      await pressSend();

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
      await pressSend();

      await waitFor(() => expect(submitSuggestion).toHaveBeenCalled());
      expect(
        submitSuggestion.mock.calls[0][0].message.length
      ).toBeGreaterThanOrEqual(10);
    });
  });

  describe("failure", () => {
    it("reports the error and keeps what was typed", async () => {
      const user = userEvent.setup();
      signInAs("a@b.test");
      submitSuggestion.mockRejectedValue(new Error("Network down"));
      openSheet();

      await user.type(screen.getByLabelText("Who took it?"), "Maria Tavares");
      await pressSend();

      await waitFor(() =>
        expect(screen.getByText(/Network down/i)).toBeInTheDocument()
      );
      expect(screen.getByLabelText("Who took it?")).toHaveValue(
        "Maria Tavares"
      );
      expect(screen.getByText("Help identify")).toBeInTheDocument();
    });
  });

  describe("a send still in flight when the sheet closes", () => {
    beforeEach(() => signInAs());

    async function sendThenReopen() {
      let settle!: { resolve: () => void; reject: (error: Error) => void };
      submitSuggestion.mockReturnValue(
        new Promise<void>((resolve, reject) => {
          settle = { resolve, reject };
        })
      );
      openSheet();
      await answer();
      await pressSend();
      await waitFor(() => expect(submitSuggestion).toHaveBeenCalledTimes(1));

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      act(() => useIdentifyStore.getState().open(MEDIA_CONTEXT));
      await userEvent.type(screen.getByLabelText("Who took it?"), "Maria");
      return settle;
    }

    it("leaves the reopened sheet and its answers alone when it lands", async () => {
      const settle = await sendThenReopen();

      await act(async () => settle.resolve());

      expect(toastShow).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText("Who took it?")).toHaveValue("Maria");
    });

    it("says so in a toast when it fails, since its sheet is gone", async () => {
      const settle = await sendThenReopen();

      await act(async () => settle.reject(new Error("Network down")));

      expect(toastShow).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Who took it?")).toHaveValue("Maria");
    });
  });

  it("records that the subject was answered", async () => {
    signInAs();
    openSheet();
    await answer();
    await pressSend();

    await waitFor(() =>
      expect(useIdentifyStore.getState().answered).toEqual([
        MEDIA_CONTEXT.contentId,
      ])
    );
  });

  describe("state reset", () => {
    it("clears answers when the sheet is closed and reopened over the same record", async () => {
      openSheet();
      await answer();
      await fillGuest();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      act(() => useIdentifyStore.getState().open(MEDIA_CONTEXT));

      expect(screen.getByLabelText("Roughly when?")).toHaveValue("");
      expect(screen.getByLabelText("Your name")).toHaveValue("");
      expect(screen.getByLabelText("Your email")).toHaveValue("");
    });

    // The sheet itself stays mounted here; only the keyed form inside it changes.
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
      signInAs("a@b.test");
      openSheet();

      await pressSend();
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
