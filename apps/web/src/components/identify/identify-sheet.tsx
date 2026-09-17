"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";

import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { useToast } from "@/hooks/use-toast";
import { submitSuggestion } from "@/lib/api";
import { fieldPhrase } from "@/lib/field-labels";
import { supabase } from "@/lib/supabase-client";
import { useIsAuthenticated, useUser } from "@/stores/authStore";
import { useIdentifyStore } from "@/stores/identifyStore";

/**
 * The archive's one identify sheet. Spec 034 FR-004.
 *
 * Every "not recorded" question on every screen opens this, carrying what it asks
 * about. The form is fully fillable signed out — sign-in intercepts at submit, not
 * before, because asking someone to make an account before they have said anything
 * loses the thing they knew.
 *
 * Copy and metrics are the prototype's, verbatim.
 */

interface Question {
  /** Stable key used in the composed message. */
  key: string;
  label: string;
  placeholder: string;
}

const QUESTIONS: Question[] = [
  {
    key: "place",
    label: "Where was this taken?",
    placeholder: "Faja d'Água, by the harbour",
  },
  {
    key: "photographer",
    label: "Who took it?",
    placeholder: "A name, or “not known”",
  },
  {
    key: "when",
    label: "Roughly when?",
    placeholder: "1984 — or “sometime in the sixties”",
  },
];

const EMPTY_ANSWERS: Record<string, string> = {
  place: "",
  photographer: "",
  when: "",
};

/**
 * Only answered questions reach the curators — a blank line would read as "asked and
 * unknown" when nobody was asked. The leading sentence names the field the question
 * came from, which also keeps the message past the API's ten-character minimum when
 * the single answer is something like "60s".
 */
function composeMessage(
  field: string,
  answers: Record<string, string>
): string {
  const answered = QUESTIONS.filter((q) => answers[q.key]?.trim()).map(
    (q) => `${q.label} ${answers[q.key].trim()}`
  );

  // The field arrives as a code key; curators read the queue, so it goes out as a
  // phrase. The lead also keeps a one-word answer past the API's ten-character floor.
  return [`Asked about: ${fieldPhrase(field)}`, ...answered].join("\n");
}

export function IdentifySheet() {
  const context = useIdentifyStore((state) => state.context);
  const close = useIdentifyStore((state) => state.close);
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const toast = useToast();
  const titleId = useId();

  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  // A ref, not state: Activity preserves useState across navigation, so a pending
  // submission held in state could fire on an unrelated later visit.
  const pendingSubmitRef = useRef(false);

  // Keyed on the subject, not just on mount: Activity destroys effects on hide and
  // re-creates them on show (so this still runs on every return visit), and opening
  // the sheet over a different record now clears the previous one's answers rather
  // than carrying a half-typed guess about one photograph onto another.
  useEffect(() => {
    setAnswers(EMPTY_ANSWERS);
    setSubmitting(false);
    setError(null);
    setSignInOpen(false);
    pendingSubmitRef.current = false;
  }, [context?.contentId, context?.field]);

  const handleClose = useCallback(() => {
    setAnswers(EMPTY_ANSWERS);
    setError(null);
    setSignInOpen(false);
    pendingSubmitRef.current = false;
    close();
  }, [close]);

  useEffect(() => {
    // While sign-in is open, Escape belongs to that dialog: closing the sheet under
    // it would discard the answers the sign-in was meant to carry.
    if (!context || signInOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [context, handleClose, signInOpen]);

  const send = useCallback(
    async (current: Record<string, string>) => {
      if (!context) return;

      setSubmitting(true);
      setError(null);

      try {
        // Read the session rather than the store: `SignInDialog` calls `onSignedIn`
        // as soon as `signInWithPassword` resolves, and `AuthProvider` only fills the
        // store later from `onAuthStateChange`. The closure that resumes a held
        // submission was therefore built when `user` was still null, and posted an
        // empty name and email — which the API rejects with a 400.
        const { data } = await supabase.auth.getSession();
        const email = (data.session?.user?.email ?? user?.email ?? "").trim();

        if (!email) {
          setError("We could not read your account. Please sign in again.");
          return;
        }

        await submitSuggestion({
          contentId: context.contentId,
          pageTitle: context.pageTitle,
          pageUrl: typeof window === "undefined" ? "" : window.location.href,
          contentType: context.contentType,
          // The session carries an email and nothing else — no display name — so
          // that is what the curators see. Inventing a name here would put a
          // fabricated attribution on a suggestion.
          name: email,
          email: email.toLowerCase(),
          suggestionType:
            context.contentType === "media"
              ? "PHOTO_IDENTIFICATION"
              : "ADDITION",
          message: composeMessage(context.field, current),
          ...(context.mediaId ? { mediaId: context.mediaId } : {}),
        });

        toast.success("Thank you — a curator will read this.").show();
        handleClose();
      } catch (caught) {
        // The typed answers stay on screen: they are the thing worth keeping
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not send that. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [context, handleClose, toast, user]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const hasAnswer = QUESTIONS.some((q) => answers[q.key]?.trim());
    if (!hasAnswer) {
      setError("Answer at least one question, even if it is a guess.");
      return;
    }

    if (!isAuthenticated || !user) {
      pendingSubmitRef.current = true;
      setSignInOpen(true);
      return;
    }

    void send(answers);
  };

  const handleSignedIn = () => {
    setSignInOpen(false);
    if (!pendingSubmitRef.current) return;
    pendingSubmitRef.current = false;
    void send(answers);
  };

  const handleSignInClose = () => {
    pendingSubmitRef.current = false;
    setSignInOpen(false);
  };

  if (!context) return null;

  return (
    <>
      <div
        data-testid="identify-overlay"
        onClick={signInOpen ? undefined : handleClose}
        // Catalyst's Dialog is `relative z-50` in a portal on <body>. At z-60 this
        // overlay painted on top of it: the sign-in form was invisible behind the
        // backdrop, which also swallowed every click and discarded the answers. While
        // sign-in is open the sheet drops below the dialog and stops taking clicks.
        className={clsx(
          "fixed inset-0 flex items-end justify-center",
          signInOpen ? "z-40" : "z-[60]"
        )}
        style={{ background: "rgba(6,9,12,.72)", padding: "20px" }}
      >
        <form
          data-testid="identify-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
          onSubmit={handleSubmit}
          style={{
            background: "var(--background)",
            border: "1px solid var(--border-strong)",
            borderRadius: "16px",
            padding: "26px",
            width: "min(520px, 100%)",
            boxShadow: "0 -20px 60px rgba(0,0,0,.6)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--brand-sobrado-ochre)",
              marginBottom: "10px",
            }}
          >
            Help identify
          </div>
          <h3
            id={titleId}
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: "26px",
              margin: "0 0 8px",
              lineHeight: 1.15,
            }}
          >
            Tell us what you recognise
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              color: "var(--foreground-secondary)",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            Answer only what you know. A guess marked as a guess is more use to
            the archive than a blank.
          </p>

          <div className="flex flex-col" style={{ gap: "14px" }}>
            {QUESTIONS.map((question) => (
              <label
                key={question.key}
                className="flex flex-col"
                style={{ gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--foreground-secondary)",
                  }}
                >
                  {question.label}
                </span>
                <input
                  value={answers[question.key]}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setAnswers((previous) => ({
                      ...previous,
                      [question.key]: event.target.value,
                    }))
                  }
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "11px 13px",
                    color: "var(--foreground)",
                    font: "inherit",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </label>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              style={{
                margin: "14px 0 0",
                fontSize: "13px",
                color: "var(--brand-sobrado-ochre)",
              }}
            >
              {error}
            </p>
          )}

          <div
            className="flex flex-wrap"
            style={{ gap: "10px", marginTop: "22px" }}
          >
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: 0,
                borderRadius: "8px",
                padding: "11px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Send to the curators
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer"
              style={{
                background: "none",
                border: "1px solid var(--border-subtle)",
                color: "var(--foreground)",
                borderRadius: "999px",
                padding: "11px 20px",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>

          <p
            style={{
              margin: "16px 0 0",
              color: "var(--foreground-secondary)",
              fontSize: "12px",
            }}
          >
            A person reads every suggestion. Sign-in happens at the end, not
            before the form.
          </p>
        </form>
      </div>

      <SignInDialog
        open={signInOpen}
        onClose={handleSignInClose}
        onSignedIn={handleSignedIn}
        held={{
          photographer: answers.photographer,
          place: answers.place,
        }}
      />
    </>
  );
}
