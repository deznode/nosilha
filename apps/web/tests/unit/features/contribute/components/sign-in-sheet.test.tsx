import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
}));
const draftStore = vi.hoisted(() => ({
  probe: vi.fn(),
  save: vi.fn(),
  load: vi.fn(),
  clear: vi.fn(),
}));

vi.mock("@/lib/supabase-client", () => ({ supabase: { auth } }));
vi.mock("@/features/contribute/lib/contribution-draft", () => ({
  contributionDraftStore: draftStore,
}));

import { DESKTOP_QUERY } from "@/features/contribute/components/responsive-sheet";
import { SignInSheet } from "@/features/contribute/components/sign-in-sheet";

import { mockMatchMedia } from "../../../../setup/match-media-mock";

const EMAIL = "maria.tavares@gmail.com";
const NEW_USER = {
  email: EMAIL,
  created_at: "2026-09-28T10:00:00.000Z",
  last_sign_in_at: "2026-09-28T10:00:01.000Z",
};
const RETURNING_USER = {
  email: EMAIL,
  created_at: "2025-01-01T10:00:00.000Z",
  last_sign_in_at: "2026-09-28T10:00:01.000Z",
};
const DRAFT = { kind: "photo" as const, form: { title: "Festa" }, file: null };

let media: ReturnType<typeof mockMatchMedia>;

function renderSheet(
  opts: {
    desktop?: boolean;
    initialView?: "start" | "cancelled";
    kind?: "photo" | "film";
  } = {}
) {
  media = mockMatchMedia({ [DESKTOP_QUERY]: opts.desktop ?? false });
  const onSignedIn = vi.fn();
  const getDraft = vi.fn(() => DRAFT);
  render(
    <SignInSheet
      open
      onClose={vi.fn()}
      onSignedIn={onSignedIn}
      held={
        opts.kind === "film"
          ? { kind: "film", title: "Festa de São João, 1987" }
          : {
              kind: "photo",
              title: "My grandmother at the festa",
              town: "Nova Sintra",
            }
      }
      getDraft={getDraft}
      initialView={opts.initialView}
    />
  );
  return { onSignedIn, getDraft };
}

/**
 * Settles the mocked Supabase promises and the state updates behind them.
 * The email-code tests run on deterministic fake timers (no
 * `shouldAdvanceTime`), where RTL's `waitFor` polling can't tick, so they
 * flush explicitly instead of polling.
 */
async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function sendCode() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: EMAIL },
  });
  fireEvent.click(screen.getByRole("button", { name: "Email me a code" }));
  await flush();
  screen.getByRole("heading", { name: "Check your email" });
}

function typeCode(code: string) {
  fireEvent.change(screen.getByLabelText("6-digit code"), {
    target: { value: code },
  });
}

const codeBoxes = () =>
  screen.getAllByTestId("code-box").map((b) => b.textContent);

beforeEach(() => {
  for (const fn of [...Object.values(auth), ...Object.values(draftStore)]) {
    fn.mockReset();
  }
  auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
  auth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
  draftStore.probe.mockResolvedValue(true);
  draftStore.save.mockResolvedValue(undefined);
  draftStore.clear.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  media?.restore();
});

describe("SignInSheet — start (S1)", () => {
  it.each([false, true])(
    "renders the held card and S1 copy (desktop: %s)",
    (desktop) => {
      renderSheet({ desktop });
      expect(
        screen.getByText("Held on this page · not sent")
      ).toBeInTheDocument();
      expect(
        screen.getByText("My grandmother at the festa · Nova Sintra")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Confirm it's you" })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "So we can credit you, and so you can ask for it to be taken down later."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Continue with Google" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("New here? This makes your account.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Use a password" })
      ).toBeInTheDocument();
    }
  );

  it("shows the film line for a film (S1b)", () => {
    renderSheet({ kind: "film" });
    expect(
      screen.getByText("Festa de São João, 1987 · film link")
    ).toBeInTheDocument();
  });

  it("opens in S10 after a cancelled Google sign-in", () => {
    renderSheet({ initialView: "cancelled" });
    expect(
      screen.getByText("You didn't finish signing in with Google")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument();
  });

  it("opens straight in S11 in an in-app browser", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Instagram 300.0"
    );
    renderSheet();
    expect(screen.getByText("Google sign-in didn't open")).toBeInTheDocument();
    expect(
      screen.getByText("Google isn't available in this browser")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Continue with Google" })
    ).not.toBeInTheDocument();
  });
});

describe("SignInSheet — email code", () => {
  // The resend countdown is asserted to the second, so the clock must move
  // only when a test moves it. `shouldAdvanceTime` let wall-clock time leak in:
  // on a loaded run, a second passing between a send and an assertion turned
  // "1:00" into "0:59", or 18 s of advance into 19 ticks.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("sends a code and shows S3", async () => {
    renderSheet();
    await sendCode();

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: true },
    });
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(
      screen.getByText(
        "The email also has a link. On a phone, the code is more reliable."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Send a new code in 1:00")).toBeInTheDocument();
  });

  it("verifies the code and reports a new user", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: NEW_USER, session: {} },
      error: null,
    });
    const { onSignedIn } = renderSheet();
    await sendCode();
    typeCode("481902");
    await flush();

    expect(onSignedIn).toHaveBeenCalledWith({
      isNewUser: true,
      email: EMAIL,
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      token: "481902",
      type: "email",
    });
  });

  it("keeps the digits on a wrong code (S4)", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        code: "otp_invalid",
        message: "Token has expired or is invalid",
      },
    });
    const { onSignedIn } = renderSheet();
    await sendCode();
    typeCode("481902");
    await flush();

    const error = screen.getByText(
      "That code doesn't match. Check it's from the newest email, or send a new code."
    );
    expect(codeBoxes().join("")).toBe("481902");
    expect(screen.getByLabelText("6-digit code")).toHaveAttribute(
      "aria-describedby",
      error.id
    );
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it("shows S5 on an expired code, then resends to S6", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "otp_expired", message: "expired" },
    });
    renderSheet();
    await sendCode();
    typeCode("481907");
    await flush();

    screen.getByText("That code has expired. Each code works for 10 minutes.");
    expect(codeBoxes().join("")).toBe("481907");
    const resend = screen.getByRole("button", { name: "Send a new code" });
    expect(resend).toBeDisabled();

    act(() => vi.advanceTimersByTime(60_000));
    expect(resend).toBeEnabled();
    fireEvent.click(resend);
    await flush();

    screen.getByText("A new code is on its way. Only the newest one works.");
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(2);
    expect(codeBoxes().join("")).toBe("");
    expect(screen.getByText("Send a new code in 1:00")).toBeInTheDocument();
  });

  it("locks resend for 60 s with an m:ss countdown", async () => {
    renderSheet();
    await sendCode();

    act(() => vi.advanceTimersByTime(18_000));
    expect(screen.getByText("Send a new code in 0:42")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send a new code" })
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(42_000));
    const link = screen.getByRole("button", { name: "Send a new code" });
    fireEvent.click(link);
    await flush();
    screen.getByText("A new code is on its way. Only the newest one works.");
    // Every send restarts the lock.
    expect(screen.getByText("Send a new code in 1:00")).toBeInTheDocument();
  });

  it("shows the rate-limited notice when the send is throttled", async () => {
    auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: {
        status: 429,
        code: "over_email_send_rate_limit",
        message: "rate limited",
      },
    });
    renderSheet();
    await sendCode();

    expect(
      screen.getByText("Too many codes sent. Please wait a few minutes.")
    ).toBeInTheDocument();
  });

  it("goes to S7 and back to the code", async () => {
    renderSheet();
    await sendCode();

    fireEvent.click(screen.getByRole("button", { name: "Didn't get it?" }));
    expect(
      screen.getByRole("heading", { name: "No email yet?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send a new code in 1:00/ })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Back to the code/ }));
    expect(
      screen.getByRole("heading", { name: "Check your email" })
    ).toBeInTheDocument();
  });

  it("paste fills the boxes and submits", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: RETURNING_USER, session: {} },
      error: null,
    });
    const { onSignedIn } = renderSheet();
    await sendCode();

    // user-event's paste waits on the faked clock, so dispatch the paste
    // event directly; code-input.test.tsx covers user-event's paste.
    fireEvent.paste(screen.getByLabelText("6-digit code"), {
      clipboardData: { getData: () => "482913" },
    });
    await flush();

    expect(onSignedIn).toHaveBeenCalledWith({
      isNewUser: false,
      email: EMAIL,
    });
    expect(auth.verifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({ token: "482913" })
    );
  });
});

describe("SignInSheet — password (S2)", () => {
  it("signs in with a password", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: RETURNING_USER, session: {} },
      error: null,
    });
    const { onSignedIn } = renderSheet();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: EMAIL },
    });
    fireEvent.click(screen.getByRole("button", { name: "Use a password" }));
    expect(
      screen.getByRole("heading", { name: "Sign in with your password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue(EMAIL);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in and send" }));

    await waitFor(() =>
      expect(onSignedIn).toHaveBeenCalledWith({
        isNewUser: false,
        email: EMAIL,
      })
    );
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: "secret-pass",
    });
  });

  it("shows the error and stays on S2 when the password is wrong", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    const { onSignedIn } = renderSheet();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: EMAIL },
    });
    fireEvent.click(screen.getByRole("button", { name: "Use a password" }));
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in and send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid login credentials"
    );
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});

describe("SignInSheet — Google", () => {
  it("a failed storage probe gives S12 and never leaves", async () => {
    draftStore.probe.mockResolvedValue(false);
    renderSheet();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );

    expect(
      await screen.findByText(
        "This browser can't keep your photograph while you're away"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Google isn't available in this browser")
    ).toBeInTheDocument();
    expect(draftStore.save).not.toHaveBeenCalled();
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it.each([
    [false, "phone"],
    [true, "computer"],
  ])(
    "saves the draft, shows S8 and redirects (desktop: %s)",
    async (desktop, device) => {
      const { getDraft } = renderSheet({ desktop });
      fireEvent.click(
        screen.getByRole("button", { name: "Continue with Google" })
      );

      expect(
        await screen.findByRole("heading", { name: "Taking you to Google" })
      ).toBeInTheDocument();
      expect(screen.getByText(`Saved on this ${device}`)).toBeInTheDocument();
      expect(
        screen.queryByText("Held on this page · not sent")
      ).not.toBeInTheDocument();

      await waitFor(() => expect(auth.signInWithOAuth).toHaveBeenCalled());
      expect(getDraft).toHaveBeenCalled();
      expect(draftStore.save).toHaveBeenCalledWith(DRAFT);
      expect(draftStore.probe.mock.invocationCallOrder[0]).toBeLessThan(
        draftStore.save.mock.invocationCallOrder[0]
      );
      expect(draftStore.save.mock.invocationCallOrder[0]).toBeLessThan(
        auth.signInWithOAuth.mock.invocationCallOrder[0]
      );
      expect(auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2Fcontribute%2Fmedia%3Fresume%3D1`,
        },
      });
    }
  );

  it("an OAuth error gives S11", async () => {
    auth.signInWithOAuth.mockResolvedValue({
      data: {},
      error: { message: "provider error" },
    });
    renderSheet();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );

    expect(
      await screen.findByText("Google sign-in didn't open")
    ).toBeInTheDocument();
    expect(draftStore.clear).toHaveBeenCalled();
  });
});
