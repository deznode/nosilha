import { act, renderHook } from "@testing-library/react";
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

import {
  GOOGLE_RESUME_PATH,
  RESEND_LOCK_SECONDS,
  useSignInFlow,
} from "@/features/contribute/hooks/use-sign-in-flow";

const EMAIL = "maria.tavares@gmail.com";
const DRAFT = { kind: "photo" as const, form: { title: "Festa" }, file: null };
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

function setup() {
  const onSignedIn = vi.fn();
  const getDraft = vi.fn(() => DRAFT);
  const hook = renderHook(() => useSignInFlow({ getDraft, onSignedIn }));
  return { ...hook, onSignedIn, getDraft };
}

/** Advances strict fake timers and settles the promises behind them. */
async function tick(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
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
});

/** Enters the email and sends the first code, landing on the code view. */
async function sendFirstCode(result: ReturnType<typeof setup>["result"]) {
  act(() => result.current.setEmail(EMAIL));
  await act(async () => {
    await result.current.sendCode();
  });
}

describe("useSignInFlow — resend lock", () => {
  it("starts a 60 s lock on the first send and counts down each second", async () => {
    const { result } = setup();
    expect(result.current.resendIn).toBe(0);

    await sendFirstCode(result);
    expect(result.current.state.view).toBe("code");
    expect(result.current.resendIn).toBe(RESEND_LOCK_SECONDS);

    await tick(1000);
    expect(result.current.resendIn).toBe(59);
    await tick(41_000);
    expect(result.current.resendIn).toBe(18);
    await tick(18_000);
    expect(result.current.resendIn).toBe(0);
  });

  it("ignores a resend while locked, and allows it once the lock ends", async () => {
    const { result } = setup();
    await sendFirstCode(result);
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(1);

    await tick(59_000);
    await act(async () => {
      await result.current.resend();
    });
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(1);

    await tick(1000);
    expect(result.current.resendIn).toBe(0);
    await act(async () => {
      await result.current.resend();
    });
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(2);
  });

  it("resets the lock to a full 60 s on every send, resends included", async () => {
    const { result } = setup();
    await sendFirstCode(result);

    await tick(60_000);
    await act(async () => {
      await result.current.resend();
    });
    expect(result.current.state.view).toBe("codeResent");
    expect(result.current.resendIn).toBe(RESEND_LOCK_SECONDS);

    await tick(30_000);
    expect(result.current.resendIn).toBe(30);
    await tick(30_000);
    await act(async () => {
      await result.current.resend();
    });
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(3);
    expect(result.current.resendIn).toBe(RESEND_LOCK_SECONDS);
  });

  it("locks after a rate-limited send too, and shows the throttled notice", async () => {
    auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: { status: 429, message: "slow down" },
    });
    const { result } = setup();
    await sendFirstCode(result);

    expect(result.current.state).toMatchObject({
      view: "code",
      sendRateLimited: true,
    });
    expect(result.current.resendIn).toBe(RESEND_LOCK_SECONDS);
  });

  it("does not lock, and reports the message, when the send fails", async () => {
    auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: { status: 500, message: "mail server down" },
    });
    const { result } = setup();
    await sendFirstCode(result);

    expect(result.current.state.view).toBe("start");
    expect(result.current.sendError).toBe("mail server down");
    expect(result.current.resendIn).toBe(0);
  });

  it("stops the clock when unmounted", async () => {
    const { result, unmount } = setup();
    await sendFirstCode(result);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useSignInFlow — onSignedIn", () => {
  async function toCodeView() {
    const ctx = setup();
    await sendFirstCode(ctx.result);
    return ctx;
  }

  it("reports a brand-new account once the code verifies", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: NEW_USER, session: {} },
      error: null,
    });
    const { result, onSignedIn } = await toCodeView();

    await act(async () => {
      await result.current.verify("123456");
    });

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: EMAIL,
      token: "123456",
      type: "email",
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    expect(onSignedIn).toHaveBeenCalledWith({ isNewUser: true, email: EMAIL });
    // The resend clock is stopped once signed in.
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports isNewUser false for a returning account", async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: RETURNING_USER, session: {} },
      error: null,
    });
    const { result, onSignedIn } = await toCodeView();

    await act(async () => {
      await result.current.verify("123456");
    });

    expect(onSignedIn).toHaveBeenCalledWith({ isNewUser: false, email: EMAIL });
  });

  it("calls it once even when verify is triggered twice", async () => {
    let resolveVerify!: (v: unknown) => void;
    auth.verifyOtp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveVerify = resolve;
        })
    );
    const { result, onSignedIn } = await toCodeView();

    // A double submit while the first request is in flight.
    await act(async () => {
      void result.current.verify("123456");
      void result.current.verify("123456");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(auth.verifyOtp).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveVerify({ data: { user: NEW_USER }, error: null });
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);

    // And a later verify after success does not report again.
    auth.verifyOtp.mockResolvedValue({ data: { user: NEW_USER }, error: null });
    await act(async () => {
      await result.current.verify("123456");
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });

  it("does not call it on a wrong or expired code", async () => {
    auth.verifyOtp.mockResolvedValueOnce({
      data: {},
      error: { code: "otp_invalid", message: "wrong" },
    });
    auth.verifyOtp.mockResolvedValueOnce({
      data: {},
      error: { code: "otp_expired", message: "expired" },
    });
    const { result, onSignedIn } = await toCodeView();

    await act(async () => {
      await result.current.verify("000000");
    });
    expect(result.current.state.view).toBe("codeWrong");

    await act(async () => {
      await result.current.verify("111111");
    });
    expect(result.current.state.view).toBe("codeExpired");
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it("reports a password sign-in once, with the trimmed email as fallback", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: { ...RETURNING_USER, email: null }, session: {} },
      error: null,
    });
    const { result, onSignedIn } = setup();
    act(() => result.current.setEmail(`  ${EMAIL} `));
    act(() => result.current.choosePassword());

    await act(async () => {
      await result.current.signInWithPassword("hunter2");
    });

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: "hunter2",
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    expect(onSignedIn).toHaveBeenCalledWith({ isNewUser: false, email: EMAIL });
  });
});

describe("useSignInFlow — Google", () => {
  async function continueWithGoogle(ctx: ReturnType<typeof setup>) {
    await act(async () => {
      await ctx.result.current.continueWithGoogle();
    });
  }

  it("probes, then saves, then calls signInWithOAuth, with the exact redirectTo", async () => {
    const ctx = setup();
    await continueWithGoogle(ctx);

    const order = [
      draftStore.probe.mock.invocationCallOrder[0],
      draftStore.save.mock.invocationCallOrder[0],
      auth.signInWithOAuth.mock.invocationCallOrder[0],
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((n) => typeof n === "number")).toBe(true);

    expect(draftStore.save).toHaveBeenCalledWith(DRAFT);
    expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(GOOGLE_RESUME_PATH)}`,
      },
    });
    expect(ctx.result.current.state.view).toBe("leaving");
    expect(ctx.onSignedIn).not.toHaveBeenCalled();
  });

  it("probe failure: no save, no OAuth, and the view becomes noSave", async () => {
    draftStore.probe.mockResolvedValue(false);
    const ctx = setup();
    await continueWithGoogle(ctx);

    expect(draftStore.save).not.toHaveBeenCalled();
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
    expect(ctx.result.current.state.view).toBe("noSave");
    expect(ctx.result.current.state.googleDisabledReason).toBe("noSave");
  });

  it("a save that throws counts as a probe failure and never leaves", async () => {
    draftStore.save.mockRejectedValue(new Error("QuotaExceededError"));
    const ctx = setup();
    await continueWithGoogle(ctx);

    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
    expect(ctx.result.current.state.view).toBe("noSave");
  });

  it.each([
    [
      "an error result",
      () =>
        auth.signInWithOAuth.mockResolvedValue({
          data: {},
          error: { message: "nope" },
        }),
    ],
    [
      "a thrown error",
      () => auth.signInWithOAuth.mockRejectedValue(new Error("network")),
    ],
  ])(
    "clears the saved draft and shows googleBlocked on %s",
    async (_n, arrange) => {
      arrange();
      const ctx = setup();
      await continueWithGoogle(ctx);

      expect(draftStore.clear).toHaveBeenCalledTimes(1);
      expect(ctx.result.current.state.view).toBe("googleBlocked");
      expect(ctx.result.current.busy).toBe(false);
    }
  );

  it("does nothing once Google has been disabled by a failed probe", async () => {
    draftStore.probe.mockResolvedValue(false);
    const ctx = setup();
    await continueWithGoogle(ctx);
    draftStore.probe.mockClear();

    await continueWithGoogle(ctx);
    expect(draftStore.probe).not.toHaveBeenCalled();
  });
});
