"use client";

import clsx from "clsx";
import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type ReactNode,
} from "react";

import { FIELD, LABEL, STRIPE } from "./form-parts";

/** What the sheet is holding while the person signs in (the S1 card). */
export interface HeldItem {
  kind: "photo" | "film";
  title?: string;
  town?: string;
  thumbnailUrl?: string | null;
}

export const SHEET_HEADING =
  "text-body m-0 font-serif text-[25px] leading-[1.2] font-normal outline-none";
const LEAD = "text-muted m-0 text-[14px] leading-[1.55]";
export const LINK =
  "focus-ring text-ocean-blue rounded-sm font-semibold hover:underline disabled:cursor-default disabled:no-underline";

/** "{title} · {town}" for a photograph, "{film title} · film link" for a film. */
function heldLine({ kind, title, town }: HeldItem): string {
  const name = title?.trim();
  if (kind === "film") return name ? `${name} · film link` : "Film link";
  const parts = [name, town?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Your photograph";
}

/** S1: the contribution waiting on the page. */
export function HeldCard({ held }: { held: HeldItem }) {
  return (
    <div className="border-ocean-blue flex flex-none items-center gap-3 rounded-[10px] border px-3 py-2.5">
      <div
        className={clsx(
          "h-11 flex-none overflow-hidden rounded-md",
          held.kind === "film" ? "w-[78px]" : "w-11",
          !held.thumbnailUrl && STRIPE
        )}
        aria-hidden="true"
      >
        {held.thumbnailUrl && (
          // A local object URL or a remote thumbnail; next/image can't take blobs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={held.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-ocean-blue font-mono text-[10.5px] font-semibold tracking-[.11em] uppercase">
          Held on this page · not sent
        </div>
        <div className="text-body mt-[3px] truncate text-[13.5px]">
          {heldLine(held)}
        </div>
      </div>
    </div>
  );
}

/**
 * A ruled notice: ochre for "something went wrong, here's the way through"
 * (S6 rate limit, S10–S12), green for "done" (S6 resent).
 */
export function Notice({
  tone,
  title,
  children,
}: {
  tone: "ochre" | "green";
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={clsx(
        "bg-surface flex flex-none flex-col gap-1 rounded-r-lg border-l-[3px] px-[13px]",
        tone === "ochre" ? "border-sobrado-ochre" : "border-valley-green",
        title ? "py-[11px]" : "py-2.5"
      )}
    >
      {title && (
        <div className="text-body text-[14px] font-semibold">{title}</div>
      )}
      <div
        className={clsx(
          "text-[13.5px] leading-[1.5]",
          title ? "text-muted" : "text-body"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Heading + one lead paragraph, 6px apart. */
export function SheetIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className={clsx(SHEET_HEADING, "mb-1.5")} tabIndex={-1}>
        {title}
      </h2>
      <p className={LEAD}>{children}</p>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** 48px filled button. */
export function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "focus-ring bg-primary text-primary-foreground flex h-12 shrink-0 items-center justify-center rounded-lg text-[15px] font-medium disabled:opacity-60",
        className
      )}
    />
  );
}

/** 48px outlined button. */
export function SecondaryButton({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "focus-ring border-edge flex h-12 shrink-0 items-center justify-center rounded-lg border text-[15px] font-medium",
        props.disabled ? "text-muted" : "text-body",
        className
      )}
    />
  );
}

/** An inline text action in the brand blue. */
export function LinkButton({ className, ...props }: ButtonProps) {
  return <button type="button" {...props} className={clsx(LINK, className)} />;
}

/** "← Other ways to sign in" / "← Back to the code". */
export function BackLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <LinkButton onClick={onClick} className="self-start text-[14px]">
      <span aria-hidden="true">← </span>
      {children}
    </LinkButton>
  );
}

/** S1 Google row: the button, or the dashed "not available" box (S11, S12). */
export function GoogleButton({
  disabled,
  busy,
  onClick,
}: {
  disabled: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <div className="border-edge text-muted flex h-12 flex-none items-center justify-center rounded-lg border border-dashed text-[14px]">
        Google isn&apos;t available in this browser
      </div>
    );
  }
  return (
    <SecondaryButton onClick={onClick} disabled={busy} aria-busy={busy}>
      Continue with Google
    </SecondaryButton>
  );
}

export function OrDivider() {
  return (
    <div className="text-muted flex flex-none items-center gap-2.5 text-[12.5px]">
      <div className="bg-hairline h-px flex-1" aria-hidden="true" />
      or
      <div className="bg-hairline h-px flex-1" aria-hidden="true" />
    </div>
  );
}

/** Labelled 44px email field. */
export function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        Email
      </label>
      <input
        id={id}
        type="email"
        name="email"
        autoComplete="email"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={clsx(FIELD, "h-11")}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-status-error mt-1.5 text-[13.5px] leading-[1.5]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** S2: email and password, reached only from "Use a password". */
export function PasswordPanel({
  email,
  onEmailChange,
  error,
  busy,
  onSubmit,
  onBack,
  onUseCode,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  error: string | null;
  busy: boolean;
  onSubmit: (password: string) => void;
  onBack: () => void;
  onUseCode: () => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    onSubmit(password);
  };

  return (
    <>
      <BackLink onClick={onBack}>Other ways to sign in</BackLink>
      <h2 className={SHEET_HEADING} tabIndex={-1}>
        Sign in with your password
      </h2>
      <form onSubmit={handleSubmit} className="contents" noValidate>
        <EmailField value={email} onChange={onEmailChange} />
        <div>
          <label htmlFor={id} className={LABEL}>
            Password
          </label>
          <div className="border-edge focus-within:border-ocean-blue bg-card flex h-11 items-center rounded-lg border pr-3 focus-within:border-[1.5px]">
            <input
              id={id}
              type={shown ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="text-body h-full min-w-0 flex-1 bg-transparent pl-3 text-[15px] outline-none"
            />
            <button
              type="button"
              onClick={() => setShown((v) => !v)}
              aria-label={shown ? "Hide password" : "Show password"}
              className="focus-ring text-muted hover:text-body rounded-sm text-[12.5px] font-semibold"
            >
              {shown ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-status-error mt-1.5 text-[13.5px] leading-[1.5]"
            >
              {error}
            </p>
          )}
        </div>
        <PrimaryButton type="submit" disabled={busy} aria-busy={busy}>
          Sign in and send
        </PrimaryButton>
      </form>
      <div className="text-muted text-[13px]">
        Forgotten it?{" "}
        <LinkButton onClick={onUseCode}>Email me a code instead</LinkButton>
      </div>
    </>
  );
}

/** S7: the three checks when no email has arrived. */
export function NoEmailChecklist({
  email,
  onChangeEmail,
}: {
  email: string;
  onChangeEmail: () => void;
}) {
  const items: ReactNode[] = [
    "It can take a minute or two.",
    "Look in Spam, Junk or Promotions. It comes from Nos Ilha.",
    <>
      Check the address: {email}.{" "}
      <LinkButton onClick={onChangeEmail}>Change it</LinkButton>
    </>,
  ];
  return (
    <ol className="text-body m-0 flex list-none flex-col gap-2.5 p-0 text-[14px] leading-[1.5]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="text-muted font-mono" aria-hidden="true">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** S8: saved, now leaving for Google. */
export function LeavingPanel({
  device,
  noun,
}: {
  device: "phone" | "computer";
  noun: string;
}) {
  return (
    <div className="flex flex-col gap-3.5 pt-2.5 pb-1.5">
      <div
        className="bg-surface h-[3px] overflow-hidden rounded-[2px]"
        aria-hidden="true"
      >
        <div className="bg-ocean-blue h-full w-[62%]" />
      </div>
      <div className="text-ocean-blue font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
        Saved on this {device}
      </div>
      <h2 className={SHEET_HEADING} tabIndex={-1}>
        Taking you to Google
      </h2>
      <p className="text-muted m-0 text-[14px] leading-[1.6]">
        Your {noun} and everything you typed are kept in this browser. When you
        come back, they&apos;ll be here. Nothing has been sent.
      </p>
      <p className="border-hairline text-muted m-0 border-t pt-3 text-[13px] leading-[1.55]">
        Come back in this same browser on this {device}. Another app or device
        won&apos;t find it.
      </p>
    </div>
  );
}
