import { describe, it, expect } from "vitest";
import {
  initialSignInState,
  signInReducer,
  type SignInState,
} from "@/features/contribute/state/sign-in-machine";

describe("initialSignInState", () => {
  it("starts on S1 with Google offered by default", () => {
    const state = initialSignInState();
    expect(state.view).toBe("start");
    expect(state.googleDisabledReason).toBeNull();
    expect(state.email).toBe("");
    expect(state.digits).toBe("");
  });

  it("starts on S11 (googleBlocked) for an in-app browser", () => {
    const state = initialSignInState({ googleBlocked: true });
    expect(state.view).toBe("googleBlocked");
    expect(state.googleDisabledReason).toBe("blocked");
  });

  it("starts on S10 (cancelled) after a Google round trip with no session", () => {
    const state = initialSignInState({ cancelled: true });
    expect(state.view).toBe("cancelled");
    expect(state.googleDisabledReason).toBeNull();
  });
});

describe("signInReducer — start (S1)", () => {
  const start = initialSignInState();

  it("EMAIL_CHANGED updates the email and stays on start", () => {
    const next = signInReducer(start, {
      type: "EMAIL_CHANGED",
      email: "a@b.com",
    });
    expect(next.view).toBe("start");
    expect(next.email).toBe("a@b.com");
  });

  it("EMAIL_SENT moves to code (S3) with the sent email and clears digits", () => {
    const next = signInReducer(start, { type: "EMAIL_SENT", email: "a@b.com" });
    expect(next.view).toBe("code");
    expect(next.email).toBe("a@b.com");
    expect(next.digits).toBe("");
    expect(next.sendRateLimited).toBe(false);
  });

  it("SEND_RATE_LIMITED moves to code (S3) with the rate-limited notice", () => {
    const next = signInReducer(start, {
      type: "SEND_RATE_LIMITED",
      email: "a@b.com",
    });
    expect(next.view).toBe("code");
    expect(next.sendRateLimited).toBe(true);
  });

  it("USE_PASSWORD moves to password (S2)", () => {
    const next = signInReducer(start, { type: "USE_PASSWORD" });
    expect(next.view).toBe("password");
  });

  it("GOOGLE_PROBE_OK (probe passes) moves to leaving (S8)", () => {
    const next = signInReducer(start, { type: "GOOGLE_PROBE_OK" });
    expect(next.view).toBe("leaving");
  });

  it("GOOGLE_PROBE_FAILED (probe fails) moves to noSave (S12) and disables Google", () => {
    const next = signInReducer(start, { type: "GOOGLE_PROBE_FAILED" });
    expect(next.view).toBe("noSave");
    expect(next.googleDisabledReason).toBe("noSave");
  });
});

describe("signInReducer — password (S2)", () => {
  const password = signInReducer(initialSignInState(), {
    type: "USE_PASSWORD",
  });

  it("ERROR (PASSWORD_ERROR) stays on password with the message", () => {
    const next = signInReducer(password, {
      type: "PASSWORD_ERROR",
      message: "Wrong password",
    });
    expect(next.view).toBe("password");
    expect(next.passwordError).toBe("Wrong password");
  });

  it("SIGNED_IN is a terminal no-op (the caller closes the sheet)", () => {
    const next = signInReducer(password, { type: "SIGNED_IN" });
    expect(next).toBe(password);
  });

  it("BACK returns to start (S1)", () => {
    const next = signInReducer(password, { type: "BACK" });
    expect(next.view).toBe("start");
  });

  it("USE_CODE returns to start (S1)", () => {
    const next = signInReducer(password, { type: "USE_CODE" });
    expect(next.view).toBe("start");
  });

  it("BACK from a googleBlocked-originated password screen returns to googleBlocked, not start", () => {
    const blockedStart = initialSignInState({ googleBlocked: true });
    const blockedPassword = signInReducer(blockedStart, {
      type: "USE_PASSWORD",
    });
    const next = signInReducer(blockedPassword, { type: "BACK" });
    expect(next.view).toBe("googleBlocked");
    expect(next.googleDisabledReason).toBe("blocked");
  });
});

describe("signInReducer — code (S3)", () => {
  const code = signInReducer(initialSignInState(), {
    type: "EMAIL_SENT",
    email: "a@b.com",
  });

  it("DIGITS_CHANGED updates the digits and stays on code", () => {
    const next = signInReducer(code, { type: "DIGITS_CHANGED", digits: "123" });
    expect(next.view).toBe("code");
    expect(next.digits).toBe("123");
  });

  it("VERIFIED is a terminal no-op (the caller closes the sheet)", () => {
    const next = signInReducer(code, { type: "VERIFIED" });
    expect(next).toBe(code);
  });

  it("WRONG moves to codeWrong (S4) and keeps the digits", () => {
    const withDigits = signInReducer(code, {
      type: "DIGITS_CHANGED",
      digits: "654321",
    });
    const next = signInReducer(withDigits, { type: "WRONG" });
    expect(next.view).toBe("codeWrong");
    expect(next.digits).toBe("654321");
  });

  it("EXPIRED moves to codeExpired (S5) and clears the digits", () => {
    const withDigits = signInReducer(code, {
      type: "DIGITS_CHANGED",
      digits: "111111",
    });
    const next = signInReducer(withDigits, { type: "EXPIRED" });
    expect(next.view).toBe("codeExpired");
    expect(next.digits).toBe("");
  });

  it("RESENT moves to codeResent (S6)", () => {
    const next = signInReducer(code, { type: "RESENT" });
    expect(next.view).toBe("codeResent");
    expect(next.digits).toBe("");
    expect(next.sendRateLimited).toBe(false);
  });

  it("RESENT with rateLimited shows the S6 rate-limited notice", () => {
    const next = signInReducer(code, { type: "RESENT", rateLimited: true });
    expect(next.view).toBe("codeResent");
    expect(next.sendRateLimited).toBe(true);
  });

  it("NO_EMAIL moves to noEmail (S7)", () => {
    const next = signInReducer(code, { type: "NO_EMAIL" });
    expect(next.view).toBe("noEmail");
  });

  it("CHANGE_EMAIL returns to start (S1)", () => {
    const next = signInReducer(code, { type: "CHANGE_EMAIL" });
    expect(next.view).toBe("start");
    expect(next.digits).toBe("");
  });
});

describe("signInReducer — codeWrong (S4)", () => {
  it("keeps its own transitions: VERIFIED / WRONG / EXPIRED / RESENT", () => {
    const code = signInReducer(initialSignInState(), {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    const withDigits = signInReducer(code, {
      type: "DIGITS_CHANGED",
      digits: "222222",
    });
    const wrong = signInReducer(withDigits, { type: "WRONG" });
    expect(wrong.view).toBe("codeWrong");

    const stillWrong = signInReducer(wrong, { type: "WRONG" });
    expect(stillWrong.view).toBe("codeWrong");
    expect(stillWrong.digits).toBe("222222");

    const expired = signInReducer(wrong, { type: "EXPIRED" });
    expect(expired.view).toBe("codeExpired");

    const resent = signInReducer(wrong, { type: "RESENT" });
    expect(resent.view).toBe("codeResent");

    const verified = signInReducer(wrong, { type: "VERIFIED" });
    expect(verified).toBe(wrong);
  });
});

describe("signInReducer — codeExpired (S5)", () => {
  it("an expired code leads to resend (S6)", () => {
    const code = signInReducer(initialSignInState(), {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    const expired = signInReducer(code, { type: "EXPIRED" });
    expect(expired.view).toBe("codeExpired");

    const resent = signInReducer(expired, { type: "RESENT" });
    expect(resent.view).toBe("codeResent");
  });

  it("ignores unrelated events", () => {
    const code = signInReducer(initialSignInState(), {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    const expired = signInReducer(code, { type: "EXPIRED" });
    const next = signInReducer(expired, {
      type: "DIGITS_CHANGED",
      digits: "999999",
    });
    expect(next).toBe(expired);
  });
});

describe("signInReducer — codeResent (S6, behaves as code)", () => {
  it("supports the same transitions as code", () => {
    const code = signInReducer(initialSignInState(), {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    const resent = signInReducer(code, { type: "RESENT" });
    expect(resent.view).toBe("codeResent");

    const wrong = signInReducer(resent, { type: "WRONG" });
    expect(wrong.view).toBe("codeWrong");

    const verified = signInReducer(resent, { type: "VERIFIED" });
    expect(verified).toBe(resent);

    const noEmail = signInReducer(resent, { type: "NO_EMAIL" });
    expect(noEmail.view).toBe("noEmail");
  });
});

describe("signInReducer — noEmail (S7)", () => {
  const code = signInReducer(initialSignInState(), {
    type: "EMAIL_SENT",
    email: "a@b.com",
  });
  const noEmail = signInReducer(code, { type: "NO_EMAIL" });

  it("RESENT moves to codeResent (S6)", () => {
    const next = signInReducer(noEmail, { type: "RESENT" });
    expect(next.view).toBe("codeResent");
  });

  it("noEmail (S7) leads to Google via GOOGLE_PROBE_OK", () => {
    const next = signInReducer(noEmail, { type: "GOOGLE_PROBE_OK" });
    expect(next.view).toBe("leaving");
  });

  it("a failed Google probe from noEmail moves to noSave and disables Google", () => {
    const next = signInReducer(noEmail, { type: "GOOGLE_PROBE_FAILED" });
    expect(next.view).toBe("noSave");
    expect(next.googleDisabledReason).toBe("noSave");
  });

  it("CHANGE_EMAIL returns to start (S1)", () => {
    const next = signInReducer(noEmail, { type: "CHANGE_EMAIL" });
    expect(next.view).toBe("start");
  });
});

describe("signInReducer — leaving (S8)", () => {
  it("is terminal: any event is a no-op", () => {
    const leaving = signInReducer(initialSignInState(), {
      type: "GOOGLE_PROBE_OK",
    });
    expect(leaving.view).toBe("leaving");
    const next = signInReducer(leaving, {
      type: "EMAIL_CHANGED",
      email: "x@y.com",
    });
    expect(next).toBe(leaving);
  });
});

describe("signInReducer — cancelled (S10)", () => {
  it("behaves like start, keeping Google offered", () => {
    const cancelled = initialSignInState({ cancelled: true });
    expect(cancelled.googleDisabledReason).toBeNull();

    const code = signInReducer(cancelled, {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    expect(code.view).toBe("code");

    const leaving = signInReducer(cancelled, { type: "GOOGLE_PROBE_OK" });
    expect(leaving.view).toBe("leaving");
  });
});

describe("signInReducer — googleBlocked (S11) and noSave (S12) disable Google", () => {
  it("googleBlocked keeps googleDisabledReason set across a code round trip", () => {
    const blocked = initialSignInState({ googleBlocked: true });
    expect(blocked.googleDisabledReason).toBe("blocked");

    const code = signInReducer(blocked, {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    expect(code.view).toBe("code");
    expect(code.googleDisabledReason).toBe("blocked");

    const backToStart = signInReducer(code, { type: "CHANGE_EMAIL" });
    expect(backToStart.view).toBe("googleBlocked");
    expect(backToStart.googleDisabledReason).toBe("blocked");
  });

  it("noSave (reached via a failed probe) stays disabled across a code round trip", () => {
    const start = initialSignInState();
    const noSave = signInReducer(start, { type: "GOOGLE_PROBE_FAILED" });
    expect(noSave.view).toBe("noSave");
    expect(noSave.googleDisabledReason).toBe("noSave");

    const code = signInReducer(noSave, {
      type: "EMAIL_SENT",
      email: "a@b.com",
    });
    const backToStart = signInReducer(code, { type: "CHANGE_EMAIL" });
    expect(backToStart.view).toBe("noSave");
    expect(backToStart.googleDisabledReason).toBe("noSave");
  });
});

describe("signInReducer — immutability", () => {
  it("never mutates the input state", () => {
    const start = initialSignInState();
    const snapshot: SignInState = { ...start };
    signInReducer(start, { type: "EMAIL_SENT", email: "a@b.com" });
    expect(start).toEqual(snapshot);
  });
});
