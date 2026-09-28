"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { supabase } from "@/lib/supabase-client";

import {
  contributionDraftStore,
  type ContributionDraft,
} from "../lib/contribution-draft";
import { isInAppBrowser } from "../lib/in-app-browser";
import { isNewUser } from "../lib/new-user";
import {
  initialSignInState,
  signInReducer,
  type SignInState,
} from "../state/sign-in-machine";

/** Resend is locked for this long after every send (README, Sign-in). */
export const RESEND_LOCK_SECONDS = 60;

/** Where Google sends people back to: the callback, then the resumed form. */
export const GOOGLE_RESUME_PATH = "/contribute/media?resume=1";

export interface SignedInInfo {
  isNewUser: boolean;
  email: string | null;
}

interface AuthErrorLike {
  code?: string;
  status?: number;
  message?: string;
}

interface UseSignInFlowOptions {
  initialView?: "start" | "cancelled";
  getDraft: () => Omit<ContributionDraft, "savedAt">;
  onSignedIn: (info: SignedInInfo) => void;
}

/** `0:42`, `1:00`. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function isRateLimited(error: AuthErrorLike): boolean {
  return error.status === 429 || error.code === "over_email_send_rate_limit";
}

/**
 * Side effects for the sign-in sheet: the Supabase calls, the resend clock and
 * the Google draft hand-off. The pure `signInReducer` decides which view shows.
 *
 * Mounted fresh each time the sheet opens, so the initial view (in-app browser
 * → S11, a cancelled Google round trip → S10) is read once, on mount.
 */
export function useSignInFlow({
  initialView = "start",
  getDraft,
  onSignedIn,
}: UseSignInFlowOptions) {
  const [state, dispatch] = useReducer(
    signInReducer,
    undefined,
    (): SignInState =>
      initialSignInState({
        googleBlocked:
          typeof navigator !== "undefined" &&
          isInAppBrowser(navigator.userAgent),
        cancelled: initialView === "cancelled",
      })
  );
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  /** The code last submitted, still drawn in the boxes on S5. */
  const [lastCode, setLastCode] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const signedInRef = useRef(false);
  const verifyingRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startResendLock = useCallback(() => {
    stopTimer();
    setResendIn(RESEND_LOCK_SECONDS);
    timerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          stopTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => stopTimer, [stopTimer]);

  const finish = useCallback(
    (
      user: {
        email?: string | null;
        created_at?: string;
        last_sign_in_at?: string;
      } | null,
      fallbackEmail: string
    ) => {
      if (signedInRef.current) return;
      signedInRef.current = true;
      stopTimer();
      onSignedIn({
        isNewUser: isNewUser(user),
        email: user?.email ?? (fallbackEmail || null),
      });
    },
    [onSignedIn, stopTimer]
  );

  /** One OTP send. Resolves "sent" | "rateLimited" | "error". */
  const requestCode = useCallback(
    async (email: string) => {
      setSendError(null);
      setBusy(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        if (!error) {
          startResendLock();
          return "sent" as const;
        }
        if (isRateLimited(error)) {
          startResendLock();
          return "rateLimited" as const;
        }
        setSendError(error.message || "The code couldn't be sent. Try again.");
        return "error" as const;
      } catch (error) {
        setSendError(
          error instanceof Error && error.message
            ? error.message
            : "The code couldn't be sent. Try again."
        );
        return "error" as const;
      } finally {
        setBusy(false);
      }
    },
    [startResendLock]
  );

  const setEmail = useCallback((email: string) => {
    setSendError(null);
    dispatch({ type: "EMAIL_CHANGED", email });
  }, []);

  /** S1 "Email me a code". */
  const sendCode = useCallback(async () => {
    const email = state.email.trim();
    if (!email || busy) return;
    const result = await requestCode(email);
    if (result === "sent") dispatch({ type: "EMAIL_SENT", email });
    if (result === "rateLimited")
      dispatch({ type: "SEND_RATE_LIMITED", email });
  }, [busy, requestCode, state.email]);

  /** "Send a new code" from S3–S7. Ignored while the 60 s lock runs. */
  const resend = useCallback(async () => {
    if (resendIn > 0 || busy) return;
    const result = await requestCode(state.email);
    if (result === "sent") dispatch({ type: "RESENT" });
    if (result === "rateLimited")
      dispatch({ type: "RESENT", rateLimited: true });
  }, [busy, requestCode, resendIn, state.email]);

  const setDigits = useCallback((digits: string) => {
    dispatch({ type: "DIGITS_CHANGED", digits });
  }, []);

  const verify = useCallback(
    async (token: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setLastCode(token);
      setBusy(true);
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: state.email,
          token,
          type: "email",
        });
        if (error) {
          dispatch({
            type: error.code === "otp_expired" ? "EXPIRED" : "WRONG",
          });
          return;
        }
        dispatch({ type: "VERIFIED" });
        finish(data.user ?? data.session?.user ?? null, state.email);
      } catch {
        dispatch({ type: "WRONG" });
      } finally {
        verifyingRef.current = false;
        setBusy(false);
      }
    },
    [finish, state.email]
  );

  const signInWithPassword = useCallback(
    async (password: string) => {
      if (busy) return;
      setBusy(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: state.email.trim(),
          password,
        });
        if (error) {
          dispatch({
            type: "PASSWORD_ERROR",
            message: error.message || "Sign-in failed. Try again.",
          });
          return;
        }
        dispatch({ type: "SIGNED_IN" });
        finish(data.user ?? data.session?.user ?? null, state.email.trim());
      } catch (error) {
        dispatch({
          type: "PASSWORD_ERROR",
          message:
            error instanceof Error && error.message
              ? error.message
              : "Sign-in failed. Try again.",
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, finish, state.email]
  );

  /**
   * Google: check the draft store works, save the draft, show S8, then leave.
   * A browser that can't store the draft gets S12; a redirect that errors out
   * gets S11.
   */
  const continueWithGoogle = useCallback(async () => {
    if (busy || state.googleDisabledReason) return;
    setBusy(true);
    try {
      const canSave = await contributionDraftStore.probe();
      if (!canSave) {
        dispatch({ type: "GOOGLE_PROBE_FAILED" });
        return;
      }
      try {
        await contributionDraftStore.save(getDraft());
      } catch {
        dispatch({ type: "GOOGLE_PROBE_FAILED" });
        return;
      }
      dispatch({ type: "GOOGLE_PROBE_OK" });

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(GOOGLE_RESUME_PATH)}`;
      let failed = false;
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
        failed = !!error;
      } catch {
        failed = true;
      }
      if (failed) {
        await contributionDraftStore.clear();
        dispatch({ type: "GOOGLE_FAILED" });
      }
    } finally {
      setBusy(false);
    }
  }, [busy, getDraft, state.googleDisabledReason]);

  return {
    state,
    resendIn,
    busy,
    sendError,
    lastCode,
    setEmail,
    sendCode,
    resend,
    setDigits,
    verify,
    signInWithPassword,
    continueWithGoogle,
    choosePassword: () => dispatch({ type: "USE_PASSWORD" }),
    /** S2 "Forgotten it? Email me a code instead": back to S1, then send. */
    chooseCodeInstead: async () => {
      dispatch({ type: "USE_CODE" });
      const email = state.email.trim();
      if (!email) return;
      const result = await requestCode(email);
      if (result === "sent") dispatch({ type: "EMAIL_SENT", email });
      if (result === "rateLimited")
        dispatch({ type: "SEND_RATE_LIMITED", email });
    },
    back: () => dispatch({ type: "BACK" }),
    changeEmail: () => dispatch({ type: "CHANGE_EMAIL" }),
    noEmail: () => dispatch({ type: "NO_EMAIL" }),
  };
}

export type SignInFlow = ReturnType<typeof useSignInFlow>;
