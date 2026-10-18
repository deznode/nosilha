"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

import {
  formatCountdown,
  useSignInFlow,
  type SignedInInfo,
  type SignInFlow,
} from "../hooks/use-sign-in-flow";
import type { Translator } from "@/i18n/types";

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
  const t = useTranslations("contribute.signIn");
  return (
    <ResponsiveSheet open={open} onClose={onClose} label={t("label")}>
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
  const kind = held.kind;

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
      {renderView(flow, kind, desktop ? "computer" : "phone")}
    </div>
  );
}

function renderView(
  flow: SignInFlow,
  kind: HeldItem["kind"],
  device: "phone" | "computer"
) {
  const { state } = flow;
  switch (state.view) {
    case "start":
    case "cancelled":
    case "googleBlocked":
    case "noSave":
      return <StartView flow={flow} kind={kind} />;
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
      return <LeavingPanel device={device} kind={kind} />;
  }
}

function startNotice(
  t: Translator<"contribute.signIn">,
  view: string,
  kind: HeldItem["kind"]
) {
  switch (view) {
    case "cancelled":
      return {
        title: t("cancelledTitle"),
        text: t("cancelledText", { kind }),
      };
    case "googleBlocked":
      return {
        title: t("blockedTitle"),
        text: t("blockedText"),
      };
    case "noSave":
      return {
        title: t("noSaveTitle", { kind }),
        text: t("noSaveText"),
      };
    default:
      return null;
  }
}

/** S1 / S1b, and with a notice S10, S11, S12. */
function StartView({
  flow,
  kind,
}: {
  flow: SignInFlow;
  kind: HeldItem["kind"];
}) {
  const t = useTranslations("contribute.signIn");
  const { state } = flow;
  const notice = startNotice(t, state.view, kind);

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
      <SheetIntro title={t("startTitle")}>{t("startLead")}</SheetIntro>
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
          {t("emailMeCode")}
        </PrimaryButton>
      </form>
      <div className="flex flex-wrap justify-between gap-2.5 text-[13px]">
        <span className="text-muted">{t("newHere")}</span>
        <LinkButton onClick={flow.choosePassword}>
          {t("usePassword")}
        </LinkButton>
      </div>
    </>
  );
}

/** S3, S4, S5 and S6. */
function CodeView({ flow }: { flow: SignInFlow }) {
  const t = useTranslations("contribute.signIn");
  const { state, resendIn } = flow;
  const view = state.view;
  const error = view === "codeWrong" || view === "codeExpired" ? t(view) : null;
  const expired = view === "codeExpired";
  const locked = resendIn > 0;

  return (
    <>
      <SheetIntro title={t("codeTitle")}>
        {t.rich("codeLead", {
          address: state.email,
          email: (chunks) => <span className="text-body">{chunks}</span>,
        })}
      </SheetIntro>
      {state.sendRateLimited ? (
        <Notice tone="ochre">{t("rateLimited")}</Notice>
      ) : (
        view === "codeResent" && <Notice tone="green">{t("codeResent")}</Notice>
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
          {t("sendNewCode")}
        </PrimaryButton>
      )}
      {view === "code" && !state.sendRateLimited && (
        <p className="text-muted m-0 text-[13px] leading-[1.55]">
          {t("linkNote")}
        </p>
      )}
      <div className="border-hairline flex flex-col gap-[9px] border-t pt-[13px] text-[13.5px]">
        <div className="flex justify-between gap-2.5">
          {expired ? (
            <span />
          ) : locked ? (
            <span className="text-muted">
              {t("sendNewCodeIn", { time: formatCountdown(resendIn) })}
            </span>
          ) : (
            <LinkButton onClick={() => void flow.resend()} disabled={flow.busy}>
              {t("sendNewCode")}
            </LinkButton>
          )}
          <LinkButton onClick={flow.changeEmail}>{t("wrongEmail")}</LinkButton>
        </div>
        <div>
          <LinkButton onClick={flow.noEmail}>{t("didntGetIt")}</LinkButton>
        </div>
      </div>
    </>
  );
}

/** S7. */
function NoEmailView({ flow }: { flow: SignInFlow }) {
  const t = useTranslations("contribute.signIn");
  const { state, resendIn } = flow;
  const locked = resendIn > 0;
  return (
    <>
      <BackLink onClick={flow.back}>{t("backToCode")}</BackLink>
      <h2 className={SHEET_HEADING} tabIndex={-1}>
        {t("noEmailTitle")}
      </h2>
      <NoEmailChecklist email={state.email} onChangeEmail={flow.changeEmail} />
      <SecondaryButton
        onClick={() => void flow.resend()}
        disabled={locked || flow.busy}
      >
        {locked
          ? t("sendNewCodeIn", { time: formatCountdown(resendIn) })
          : t("sendNewCode")}
      </SecondaryButton>
      {state.googleDisabledReason === null && (
        <SecondaryButton
          onClick={() => void flow.continueWithGoogle()}
          disabled={flow.busy}
        >
          {t("googleInstead")}
        </SecondaryButton>
      )}
    </>
  );
}
