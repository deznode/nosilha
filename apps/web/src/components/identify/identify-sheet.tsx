"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { clsx } from "clsx";

import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { useToast } from "@/hooks/use-toast";
import { submitSuggestion } from "@/lib/api";
import { fieldPhrase } from "@/lib/field-labels";
import { trackEvent } from "@/lib/ga";
import { supabase } from "@/lib/supabase-client";
import { useIsAuthenticated, useUser } from "@/stores/authStore";
import { useIdentifyStore } from "@/stores/identifyStore";
import { useShareArrivalStore } from "@/stores/shareArrivalStore";

/**
 * The archive's one identify sheet. Spec 034 FR-004.
 *
 * Every "not recorded" question on every screen opens this, carrying what it asks
 * about. No account is needed: a signed-out answer carries a name and an email a
 * curator can write to, because asking someone to make an account before they have
 * said anything loses the thing they knew. Sign-in is offered, not required.
 * Spec 040 FR-008.
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

/**
 * Asked only about a photograph or a film. The record has no field for it yet, so
 * the answer reaches the curators as text with the others. Spec 040 FR-008.
 */
const PEOPLE_QUESTION: Question = {
  key: "people",
  label: "Who is in it?",
  placeholder: "A name, a family, or “my grandmother’s sister”",
};

function questionsFor(contentType: string): Question[] {
  return contentType === "media" ? [...QUESTIONS, PEOPLE_QUESTION] : QUESTIONS;
}

const EMPTY_ANSWERS: Record<string, string> = {
  place: "",
  photographer: "",
  when: "",
  people: "",
};

/** Who a signed-out answer is from. `website` is the honeypot: people never see it. */
const EMPTY_GUEST = { name: "", email: "", website: "" };

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The API's 429 wording, and the client's fallback when a 429 carries no message. */
const RATE_LIMITED = /exceeded the maximum|rate limit|too many/i;

const FIELD_STYLE: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "10px",
  padding: "11px 13px",
  color: "var(--foreground)",
  font: "inherit",
  fontSize: "14px",
  outline: "none",
};
const LABEL_STYLE: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--foreground-secondary)",
};

/**
 * Only answered questions reach the curators — a blank line would read as "asked and
 * unknown" when nobody was asked. The leading sentence names the field the question
 * came from, which also keeps the message past the API's ten-character minimum when
 * the single answer is something like "60s".
 */
function composeMessage(
  field: string,
  answers: Record<string, string>,
  questions: Question[]
): string {
  const answered = questions
    .filter((q) => answers[q.key]?.trim())
    .map((q) => `${q.label} ${answers[q.key].trim()}`);

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
  const [guest, setGuest] = useState(EMPTY_GUEST);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  // Keyed on the subject, not just on mount: Activity destroys effects on hide and
  // re-creates them on show (so this still runs on every return visit), and opening
  // the sheet over a different record now clears the previous one's answers rather
  // than carrying a half-typed guess about one photograph onto another.
  useEffect(() => {
    setAnswers(EMPTY_ANSWERS);
    setGuest(EMPTY_GUEST);
    setSubmitting(false);
    setError(null);
    setSignInOpen(false);
  }, [context?.contentId, context?.field]);

  const handleClose = useCallback(() => {
    setAnswers(EMPTY_ANSWERS);
    setGuest(EMPTY_GUEST);
    setError(null);
    setSignInOpen(false);
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
    async (
      current: Record<string, string>,
      from: typeof EMPTY_GUEST | null
    ) => {
      if (!context) return;

      setSubmitting(true);
      setError(null);

      try {
        let name: string;
        let email: string;

        if (from) {
          name = from.name.trim();
          email = from.email.trim().toLowerCase();
        } else {
          // Read the session rather than the store: `AuthProvider` fills the store
          // later from `onAuthStateChange`, and a submission built before then posted
          // an empty name and email, which the API rejects with a 400.
          const { data } = await supabase.auth.getSession();
          const account = (
            data.session?.user?.email ??
            user?.email ??
            ""
          ).trim();

          if (!account) {
            setError("We could not read your account. Please sign in again.");
            return;
          }
          // The session carries an email and no display name, so that is what the
          // curators see. Inventing a name would fabricate an attribution.
          name = account;
          email = account.toLowerCase();
        }

        await submitSuggestion({
          contentId: context.contentId,
          pageTitle: context.pageTitle,
          pageUrl: typeof window === "undefined" ? "" : window.location.href,
          contentType: context.contentType,
          name,
          email,
          suggestionType:
            context.contentType === "media"
              ? "PHOTO_IDENTIFICATION"
              : "ADDITION",
          message: composeMessage(
            context.field,
            current,
            questionsFor(context.contentType)
          ),
          ...(context.mediaId ? { mediaId: context.mediaId } : {}),
          ...(from ? { honeypot: from.website } : {}),
        });

        if (useShareArrivalStore.getState().arrived) {
          trackEvent({
            action: "share_arrival_answer",
            content_type: context.contentType,
          });
        }

        toast.success("Thank you — a curator will read this.").show();
        handleClose();
      } catch (caught) {
        // The typed answers stay on screen: they are the thing worth keeping
        const message =
          caught instanceof Error
            ? caught.message
            : "Could not send that. Please try again.";
        setError(
          RATE_LIMITED.test(message)
            ? "Too many answers from this connection. Please try again in an hour."
            : message
        );
      } finally {
        setSubmitting(false);
      }
    },
    [context, handleClose, toast, user]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !context) return;

    const hasAnswer = questionsFor(context.contentType).some((q) =>
      answers[q.key]?.trim()
    );
    if (!hasAnswer) {
      setError("Answer at least one question, even if it is a guess.");
      return;
    }

    if (isAuthenticated && user) {
      void send(answers, null);
      return;
    }

    // The API asks for a name of two characters and an email it can parse; say so
    // here rather than let a 400 come back in its words.
    if (guest.name.trim().length < 2 || !EMAIL_SHAPE.test(guest.email.trim())) {
      setError("Add your name and an email a curator can reach you at.");
      return;
    }
    void send(answers, guest);
  };

  // Signing in sends nothing by itself: the reader comes back to the sheet, now
  // without the name and email fields, and presses Send.
  const closeSignIn = () => setSignInOpen(false);

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
          noValidate
          style={{
            background: "var(--background)",
            border: "1px solid var(--border-strong)",
            borderRadius: "16px",
            padding: "26px",
            width: "min(520px, 100%)",
            // Four questions and the guest fields outgrow a phone: scroll inside the
            // sheet so the title and Send both stay reachable.
            maxHeight: "calc(100dvh - 40px)",
            overflowY: "auto",
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
            {questionsFor(context.contentType).map((question) => (
              <label
                key={question.key}
                className="flex flex-col"
                style={{ gap: "6px" }}
              >
                <span style={LABEL_STYLE}>{question.label}</span>
                <input
                  value={answers[question.key]}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setAnswers((previous) => ({
                      ...previous,
                      [question.key]: event.target.value,
                    }))
                  }
                  style={FIELD_STYLE}
                />
              </label>
            ))}
          </div>

          {!isAuthenticated && (
            <div
              className="flex flex-col"
              style={{
                gap: "14px",
                marginTop: "18px",
                paddingTop: "18px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <label className="flex flex-col" style={{ gap: "6px" }}>
                <span style={LABEL_STYLE}>Your name</span>
                <input
                  value={guest.name}
                  autoComplete="name"
                  onChange={(event) =>
                    setGuest((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  style={FIELD_STYLE}
                />
              </label>
              <label className="flex flex-col" style={{ gap: "6px" }}>
                <span style={LABEL_STYLE}>Your email</span>
                <input
                  type="email"
                  inputMode="email"
                  value={guest.email}
                  autoComplete="email"
                  onChange={(event) =>
                    setGuest((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  style={FIELD_STYLE}
                />
              </label>
              {/* Honeypot: off-screen and out of the tab and reading order. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                value={guest.website}
                onChange={(event) =>
                  setGuest((previous) => ({
                    ...previous,
                    website: event.target.value,
                  }))
                }
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                }}
              />
            </div>
          )}

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
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="hit-area cursor-pointer"
                style={{
                  background: "none",
                  border: 0,
                  padding: "11px 4px",
                  fontSize: "13px",
                  color: "var(--foreground-secondary)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Sign in instead
              </button>
            )}
          </div>

          <p
            style={{
              margin: "16px 0 0",
              color: "var(--foreground-secondary)",
              fontSize: "12px",
            }}
          >
            A person reads every suggestion. A curator may write to you about
            yours.
          </p>
        </form>
      </div>

      <SignInDialog
        open={signInOpen}
        onClose={closeSignIn}
        onSignedIn={closeSignIn}
        held={{
          photographer: answers.photographer,
          place: answers.place,
        }}
      />
    </>
  );
}
