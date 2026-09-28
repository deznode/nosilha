/**
 * Pure state machine for the contribution flow's sign-in sheet (S1-S12).
 *
 * No React or Supabase imports: `use-sign-in-flow` owns the side effects
 * (Supabase calls, the resend countdown clock, the in-app-browser probe) and
 * dispatches events here. S9 and S10b are page states, not sheet states, and
 * are not represented.
 *
 * `SIGNED_IN` and `VERIFIED` are terminal signals: the reducer returns the
 * state unchanged, and the caller closes the sheet and fires
 * `onSignedIn({ isNewUser })` itself rather than modelling a "done" view.
 */

/** The sheet view rendered for each state, matching S1-S12 (minus S9/S10b). */
export type SignInView =
  | "start" // S1 / S1b
  | "password" // S2
  | "code" // S3
  | "codeWrong" // S4
  | "codeExpired" // S5
  | "codeResent" // S6
  | "noEmail" // S7
  | "leaving" // S8
  | "cancelled" // S10
  | "googleBlocked" // S11
  | "noSave"; // S12

/** Why the Google button is disabled, or null when it's offered. */
export type GoogleDisabledReason = "blocked" | "noSave" | null;

interface SignInBase {
  email: string;
  digits: string;
  /** True on the S6/S3 "too many codes sent" notice variant. */
  sendRateLimited: boolean;
  /** Error text for the S2 password form; null otherwise. */
  passwordError: string | null;
  googleDisabledReason: GoogleDisabledReason;
}

export interface SignInStartState extends SignInBase {
  view: "start";
}
export interface SignInPasswordState extends SignInBase {
  view: "password";
}
export interface SignInCodeState extends SignInBase {
  view: "code";
}
export interface SignInCodeWrongState extends SignInBase {
  view: "codeWrong";
}
export interface SignInCodeExpiredState extends SignInBase {
  view: "codeExpired";
}
export interface SignInCodeResentState extends SignInBase {
  view: "codeResent";
}
export interface SignInNoEmailState extends SignInBase {
  view: "noEmail";
}
export interface SignInLeavingState extends SignInBase {
  view: "leaving";
}
export interface SignInCancelledState extends SignInBase {
  view: "cancelled";
}
export interface SignInGoogleBlockedState extends SignInBase {
  view: "googleBlocked";
}
export interface SignInNoSaveState extends SignInBase {
  view: "noSave";
}

export type SignInState =
  | SignInStartState
  | SignInPasswordState
  | SignInCodeState
  | SignInCodeWrongState
  | SignInCodeExpiredState
  | SignInCodeResentState
  | SignInNoEmailState
  | SignInLeavingState
  | SignInCancelledState
  | SignInGoogleBlockedState
  | SignInNoSaveState;

export type SignInEvent =
  | { type: "EMAIL_CHANGED"; email: string }
  | { type: "DIGITS_CHANGED"; digits: string }
  | { type: "EMAIL_SENT"; email: string }
  | { type: "SEND_RATE_LIMITED"; email?: string }
  | { type: "USE_PASSWORD" }
  | { type: "GOOGLE_PROBE_OK" }
  | { type: "GOOGLE_PROBE_FAILED" }
  | { type: "SIGNED_IN" }
  | { type: "PASSWORD_ERROR"; message: string }
  | { type: "BACK" }
  | { type: "USE_CODE" }
  | { type: "VERIFIED" }
  | { type: "WRONG" }
  | { type: "EXPIRED" }
  | { type: "RESENT"; rateLimited?: boolean }
  | { type: "NO_EMAIL" }
  | { type: "CHANGE_EMAIL" };

/**
 * The initial sheet state. `googleBlocked` reflects an in-app browser
 * detected on open (S11); `cancelled` reflects a Google round trip that came
 * back without a session (S10, "same as start with the ochre notice").
 * Passing both prefers `googleBlocked`, since it's the stronger constraint.
 */
export function initialSignInState(
  opts: { googleBlocked?: boolean; cancelled?: boolean } = {}
): SignInState {
  const base: SignInBase = {
    email: "",
    digits: "",
    sendRateLimited: false,
    passwordError: null,
    googleDisabledReason: null,
  };

  if (opts.googleBlocked) {
    return { ...base, view: "googleBlocked", googleDisabledReason: "blocked" };
  }
  if (opts.cancelled) {
    return { ...base, view: "cancelled" };
  }
  return { ...base, view: "start" };
}

/** The view a "start"-like state falls back to, honouring a sticky Google disable. */
function startLikeView(
  reason: GoogleDisabledReason
): "start" | "googleBlocked" | "noSave" {
  if (reason === "blocked") return "googleBlocked";
  if (reason === "noSave") return "noSave";
  return "start";
}

export function signInReducer(
  state: SignInState,
  event: SignInEvent
): SignInState {
  const {
    email,
    digits,
    sendRateLimited,
    passwordError,
    googleDisabledReason,
  } = state;

  switch (state.view) {
    // "start"-like views: entering an email, sending a code, switching to
    // the password form, or attempting Google. A failed Google probe sticks
    // `googleDisabledReason` to "noSave", so a later CHANGE_EMAIL/BACK falls
    // back to "noSave" rather than forgetting the browser can't save a draft.
    case "start":
    case "cancelled":
    case "googleBlocked":
    case "noSave":
      switch (event.type) {
        case "EMAIL_CHANGED":
          return { ...state, email: event.email };
        case "EMAIL_SENT":
          return {
            view: "code",
            email: event.email,
            digits: "",
            sendRateLimited: false,
            passwordError: null,
            googleDisabledReason,
          };
        case "SEND_RATE_LIMITED":
          return {
            view: "code",
            email: event.email ?? email,
            digits: "",
            sendRateLimited: true,
            passwordError: null,
            googleDisabledReason,
          };
        case "USE_PASSWORD":
          return {
            view: "password",
            email,
            digits: "",
            sendRateLimited,
            passwordError: null,
            googleDisabledReason,
          };
        case "GOOGLE_PROBE_OK":
          return {
            view: "leaving",
            email,
            digits,
            sendRateLimited,
            passwordError,
            googleDisabledReason,
          };
        case "GOOGLE_PROBE_FAILED":
          return {
            view: "noSave",
            email,
            digits,
            sendRateLimited,
            passwordError,
            googleDisabledReason: "noSave",
          };
        default:
          return state;
      }

    case "password":
      switch (event.type) {
        case "PASSWORD_ERROR":
          return { ...state, passwordError: event.message };
        case "SIGNED_IN":
          return state; // terminal signal; caller closes the sheet
        case "BACK":
        case "USE_CODE":
          return {
            view: startLikeView(googleDisabledReason),
            email,
            digits: "",
            sendRateLimited,
            passwordError: null,
            googleDisabledReason,
          };
        default:
          return state;
      }

    // "code"-family views: codeResent and codeWrong behave the same as
    // code, aside from arriving with a kept-digits or rate-limited notice.
    case "code":
    case "codeWrong":
    case "codeResent":
      switch (event.type) {
        case "DIGITS_CHANGED":
          return { ...state, digits: event.digits };
        case "VERIFIED":
          return state; // terminal signal; caller closes the sheet
        case "WRONG":
          // Acceptance: a wrong code keeps the digits (S4).
          return { ...state, view: "codeWrong" };
        case "EXPIRED":
          return { ...state, view: "codeExpired", digits: "" };
        case "RESENT":
          return {
            ...state,
            view: "codeResent",
            digits: "",
            sendRateLimited: !!event.rateLimited,
          };
        case "NO_EMAIL":
          return { ...state, view: "noEmail", digits: "" };
        case "CHANGE_EMAIL":
          return {
            view: startLikeView(googleDisabledReason),
            email,
            digits: "",
            sendRateLimited: false,
            passwordError: null,
            googleDisabledReason,
          };
        default:
          return state;
      }

    case "codeExpired":
      switch (event.type) {
        case "RESENT":
          return {
            ...state,
            view: "codeResent",
            digits: "",
            sendRateLimited: !!event.rateLimited,
          };
        default:
          return state;
      }

    case "noEmail":
      switch (event.type) {
        case "RESENT":
          return {
            ...state,
            view: "codeResent",
            digits: "",
            sendRateLimited: !!event.rateLimited,
          };
        case "GOOGLE_PROBE_OK":
          return { ...state, view: "leaving" };
        case "GOOGLE_PROBE_FAILED":
          return { ...state, view: "noSave", googleDisabledReason: "noSave" };
        case "CHANGE_EMAIL":
          return {
            view: startLikeView(googleDisabledReason),
            email,
            digits: "",
            sendRateLimited,
            passwordError: null,
            googleDisabledReason,
          };
        default:
          return state;
      }

    case "leaving":
      // Terminal: the page is redirecting to Google.
      return state;

    default:
      return state;
  }
}
