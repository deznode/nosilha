/**
 * Pure state machine for the contribution flow's sign-in sheet (S1-S12).
 *
 * No React or Supabase imports: `use-sign-in-flow` owns the side effects
 * (Supabase calls, the resend countdown clock, the in-app-browser probe) and
 * dispatches events here. S9 and S10b are page states, not sheet states, and
 * are not represented.
 *
 * Signing in has no event: the caller closes the sheet and fires
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

export interface SignInState {
  view: SignInView;
  email: string;
  digits: string;
  /** True on the S6/S3 "too many codes sent" notice variant. */
  sendRateLimited: boolean;
  /** Error text for the S2 password form; null otherwise. */
  passwordError: string | null;
  googleDisabledReason: GoogleDisabledReason;
}

export type SignInEvent =
  | { type: "EMAIL_CHANGED"; email: string }
  | { type: "DIGITS_CHANGED"; digits: string }
  | { type: "EMAIL_SENT"; email: string }
  | { type: "SEND_RATE_LIMITED"; email?: string }
  | { type: "USE_PASSWORD" }
  | { type: "GOOGLE_PROBE_OK" }
  | { type: "GOOGLE_PROBE_FAILED" }
  | { type: "GOOGLE_FAILED" }
  | { type: "PASSWORD_ERROR"; message: string }
  | { type: "BACK" }
  | { type: "USE_CODE" }
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
  const base = {
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
            ...state,
            view: "code",
            email: event.email,
            digits: "",
            sendRateLimited: false,
            passwordError: null,
          };
        case "SEND_RATE_LIMITED":
          return {
            ...state,
            view: "code",
            email: event.email ?? state.email,
            digits: "",
            sendRateLimited: true,
            passwordError: null,
          };
        case "USE_PASSWORD":
          return {
            ...state,
            view: "password",
            digits: "",
            passwordError: null,
          };
        case "GOOGLE_PROBE_OK":
          return { ...state, view: "leaving" };
        case "GOOGLE_PROBE_FAILED":
          return { ...state, view: "noSave", googleDisabledReason: "noSave" };
        default:
          return state;
      }

    case "password":
      switch (event.type) {
        case "PASSWORD_ERROR":
          return { ...state, passwordError: event.message };
        case "BACK":
        case "USE_CODE":
          return {
            ...state,
            view: startLikeView(state.googleDisabledReason),
            digits: "",
            passwordError: null,
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
            ...state,
            view: startLikeView(state.googleDisabledReason),
            digits: "",
            sendRateLimited: false,
            passwordError: null,
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
        case "BACK":
          // "← Back to the code": the sent code is still valid.
          return { ...state, view: "code" };
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
            ...state,
            view: startLikeView(state.googleDisabledReason),
            digits: "",
            passwordError: null,
          };
        default:
          return state;
      }

    case "leaving":
      // Terminal while the page redirects to Google, unless the redirect
      // itself errors out: then Google is treated as blocked (S11).
      if (event.type === "GOOGLE_FAILED") {
        return {
          ...state,
          view: "googleBlocked",
          googleDisabledReason: "blocked",
        };
      }
      return state;

    default:
      return state;
  }
}
