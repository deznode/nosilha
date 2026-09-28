"use client";

import { useEffect, useRef, type FormEvent } from "react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

import {
  formatCountdown,
  useSignInFlow,
  type SignedInInfo,
  type SignInFlow,
} from "../hooks/use-sign-in-flow";
import type { ContributionDraft } from "../lib/contribution-draft";
import { CodeInput } from "./code-input";
import { DESKTOP_QUERY, ResponsiveSheet } from "./responsive-sheet";
import {
  BackLink,
  EmailField,
  GoogleButton,
  HeldCard,
  LeavingPanel,
  LinkButton,
  NoEmailChecklist,
  Notice,
  OrDivider,
  PasswordPanel,
  PrimaryButton,
  SecondaryButton,
  SHEET_HEADING,
  SheetIntro,
  type HeldItem,
} from "./sign-in-parts";

export interface SignInSheetProps {
  open: boolean;
  onClose: () => void;
  onSignedIn: (info: SignedInInfo) => void;
  held: HeldItem;
  /** Snapshot saved to IndexedDB before the Google redirect. */
  getDraft: () => Omit<ContributionDraft, "savedAt">;
  /** "cancelled" is S10: back from a Google sign-in that didn't finish. */
  initialView?: "start" | "cancelled";
}

const RATE_LIMITED = "Too many codes sent. Please wait a few minutes.";
const CODE_ERRORS = {
  codeWrong:
    "That code doesn't match. Check it's from the newest email, or send a new code.",
  codeExpired: "That code has expired. Each code works for 10 minutes.",
} as const;

/**
 * Sign-in at "Send to the archive" (spec 039, S1–S8 and S10–S12): a bottom
 * sheet on phones, a dialog from `md` up. Google, a 6-digit email code, or a
 * password; the contribution stays on the page throughout.
 */
export function SignInSheet({
  open,
  onClose,
  onSignedIn,
  held,
  getDraft,
  initialView = "start",
}: SignInSheetProps) {
  return (
    <ResponsiveSheet open={open} onClose={onClose} label="Confirm it's you">
      <SignInContent
        held={held}
        getDraft={getDraft}
        onSignedIn={onSignedIn}
        initialView={initialView}
      />
    </ResponsiveSheet>
  );
}

/**
 * Rendered only while the sheet is open, so each opening starts a fresh flow
 * (and re-reads the in-app-browser check and `initialView`).
 */
function SignInContent({
  held,
  getDraft,
  onSignedIn,
  initialView,
}: Omit<SignInSheetProps, "open" | "onClose">) {
  const flow = useSignInFlow({ initialView, getDraft, onSignedIn });
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const { view } = flow.state;
  const noun = held.kind === "film" ? "film link" : "photograph";

  // A view change unmounts the control that had focus. Put focus back inside
  // the sheet, on the view's own autofocus target or else its heading.
  const rootRef = useRef<HTMLDivElement>(null);
  const firstViewRef = useRef(true);
  useEffect(() => {
    if (firstViewRef.current) {
      firstViewRef.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root || root.contains(document.activeElement)) return;
    root.querySelector<HTMLElement>("h2")?.focus();
  }, [view]);

  return (
    <div ref={rootRef} className="contents">
      {view !== "leaving" && <HeldCard held={held} />}
      {renderView(flow, noun, desktop ? "computer" : "phone")}
    </div>
  );
}

function renderView(
  flow: SignInFlow,
  noun: string,
  device: "phone" | "computer"
) {
  const { state } = flow;
  switch (state.view) {
    case "start":
    case "cancelled":
    case "googleBlocked":
    case "noSave":
      return <StartView flow={flow} noun={noun} />;
    case "password":
      return (
        <PasswordPanel
          email={state.email}
          onEmailChange={flow.setEmail}
          error={state.passwordError}
          busy={flow.busy}
          onSubmit={flow.signInWithPassword}
          onBack={flow.back}
          onUseCode={flow.chooseCodeInstead}
        />
      );
    case "code":
    case "codeWrong":
    case "codeExpired":
    case "codeResent":
      return <CodeView flow={flow} />;
    case "noEmail":
      return <NoEmailView flow={flow} />;
    case "leaving":
      return <LeavingPanel device={device} noun={noun} />;
  }
}

function startNotice(view: string, noun: string) {
  switch (view) {
    case "cancelled":
      return {
        title: "You didn't finish signing in with Google",
        text: `Nothing was sent, and your ${noun} is still here. Try again, or use an email code.`,
      };
    case "googleBlocked":
      return {
        title: "Google sign-in didn't open",
        text: "Some apps open links in their own browser, and it blocks Google. Use an email code, or open this page in Safari or Chrome.",
      };
    case "noSave":
      return {
        title: `This browser can't keep your ${noun} while you're away`,
        text: "Private browsing does this. Use an email code instead. It works without leaving this page.",
      };
    default:
      return null;
  }
}

/** S1 / S1b, and with a notice S10, S11, S12. */
function StartView({ flow, noun }: { flow: SignInFlow; noun: string }) {
  const { state } = flow;
  const notice = startNotice(state.view, noun);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void flow.sendCode();
  };

  return (
    <>
      {notice && (
        <Notice tone="ochre" title={notice.title}>
          {notice.text}
        </Notice>
      )}
      <SheetIntro title="Confirm it's you">
        So we can credit you, and so you can ask for it to be taken down later.
      </SheetIntro>
      <GoogleButton
        disabled={state.googleDisabledReason !== null}
        busy={flow.busy}
        onClick={() => void flow.continueWithGoogle()}
      />
      <OrDivider />
      <form onSubmit={handleSubmit} className="contents">
        <EmailField
          value={state.email}
          onChange={flow.setEmail}
          error={flow.sendError}
        />
        <PrimaryButton type="submit" disabled={flow.busy} aria-busy={flow.busy}>
          Email me a code
        </PrimaryButton>
      </form>
      <div className="flex flex-wrap justify-between gap-2.5 text-[13px]">
        <span className="text-muted">New here? This makes your account.</span>
        <LinkButton onClick={flow.choosePassword}>Use a password</LinkButton>
      </div>
    </>
  );
}

/** S3, S4, S5 and S6. */
function CodeView({ flow }: { flow: SignInFlow }) {
  const { state, resendIn } = flow;
  const view = state.view as keyof typeof CODE_ERRORS | "code" | "codeResent";
  const error =
    view === "codeWrong" || view === "codeExpired" ? CODE_ERRORS[view] : null;
  const expired = view === "codeExpired";
  const locked = resendIn > 0;

  return (
    <>
      <SheetIntro title="Check your email">
        We sent a 6-digit code to{" "}
        <span className="text-body">{state.email}</span>. Type it here. You
        don&apos;t need to leave this page.
      </SheetIntro>
      {state.sendRateLimited ? (
        <Notice tone="ochre">{RATE_LIMITED}</Notice>
      ) : (
        view === "codeResent" && (
          <Notice tone="green">
            A new code is on its way. Only the newest one works.
          </Notice>
        )
      )}
      <CodeInput
        value={expired ? flow.lastCode : state.digits}
        onChange={flow.setDigits}
        onComplete={(code) => void flow.verify(code)}
        invalid={error !== null}
        errorId={error ? "sign-in-code-error" : undefined}
        readOnly={expired}
        autoFocus
      />
      {error && (
        <p
          id="sign-in-code-error"
          role="alert"
          className="text-status-error m-0 text-[13.5px] leading-[1.5]"
        >
          {error}
        </p>
      )}
      {expired && (
        <PrimaryButton
          onClick={() => void flow.resend()}
          disabled={locked || flow.busy}
        >
          Send a new code
        </PrimaryButton>
      )}
      {view === "code" && !state.sendRateLimited && (
        <p className="text-muted m-0 text-[13px] leading-[1.55]">
          The email also has a link. On a phone, the code is more reliable.
        </p>
      )}
      <div className="border-hairline flex flex-col gap-[9px] border-t pt-[13px] text-[13.5px]">
        <div className="flex justify-between gap-2.5">
          {expired ? (
            <span />
          ) : locked ? (
            <span className="text-muted">
              Send a new code in {formatCountdown(resendIn)}
            </span>
          ) : (
            <LinkButton onClick={() => void flow.resend()} disabled={flow.busy}>
              Send a new code
            </LinkButton>
          )}
          <LinkButton onClick={flow.changeEmail}>Wrong email?</LinkButton>
        </div>
        <div>
          <LinkButton onClick={flow.noEmail}>Didn&apos;t get it?</LinkButton>
        </div>
      </div>
    </>
  );
}

/** S7. */
function NoEmailView({ flow }: { flow: SignInFlow }) {
  const { state, resendIn } = flow;
  const locked = resendIn > 0;
  return (
    <>
      <BackLink onClick={flow.back}>Back to the code</BackLink>
      <h2 className={SHEET_HEADING} tabIndex={-1}>
        No email yet?
      </h2>
      <NoEmailChecklist email={state.email} onChangeEmail={flow.changeEmail} />
      <SecondaryButton
        onClick={() => void flow.resend()}
        disabled={locked || flow.busy}
      >
        {locked
          ? `Send a new code in ${formatCountdown(resendIn)}`
          : "Send a new code"}
      </SecondaryButton>
      {state.googleDisabledReason === null && (
        <SecondaryButton
          onClick={() => void flow.continueWithGoogle()}
          disabled={flow.busy}
        >
          Continue with Google instead
        </SecondaryButton>
      )}
    </>
  );
}
