import clsx from "clsx";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import type { ContributionKind } from "../lib/contribution-draft";

/** Shared by the photo and film forms (P1–P6, F1–F7). Spec 039. */

export const LABEL = "text-body mb-[7px] block text-[13px] font-semibold";
export const HINT = "text-muted mt-1.5 text-[12.5px] leading-[1.45]";
export const PAGE_HEADING =
  "text-body m-0 font-serif text-[25px] leading-[1.12] font-normal md:text-[34px]";
const FIELD =
  "bg-card text-body placeholder:text-muted-foreground w-full rounded-lg border px-3 text-[15px] outline-none focus:border-[1.5px]";

export function TextField({
  id,
  label,
  hint,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        {...props}
        aria-invalid={invalid || undefined}
        className={clsx(
          FIELD,
          "min-h-11 py-[11px] leading-[1.4]",
          invalid
            ? "border-status-error border-[1.5px]"
            : "border-edge focus:border-ocean-blue"
        )}
      />
      {hint}
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  minHeight,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
  minHeight: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <textarea
        id={id}
        {...props}
        style={{ minHeight }}
        className={clsx(
          FIELD,
          "border-edge focus:border-ocean-blue block py-[11px] leading-[1.45]"
        )}
      />
      {hint && <p className={HINT}>{hint}</p>}
    </div>
  );
}

/** Heading and lead, 14px apart. */
export function FormIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <h1 className={PAGE_HEADING}>{title}</h1>
      <div className="text-muted m-0 max-w-[60ch] text-[14px] leading-[1.55] md:text-[15.5px]">
        {children}
      </div>
    </div>
  );
}

/** "Photograph" / "Film link". */
export function KindSwitch({
  kind,
  onChange,
  disabled = false,
}: {
  kind: ContributionKind;
  onChange: (kind: ContributionKind) => void;
  /** While sending: the panels under the button belong to one kind. */
  disabled?: boolean;
}) {
  const options = [
    { value: "photo", label: "Photograph" },
    { value: "film", label: "Film link" },
  ] as const;
  return (
    <div className="bg-surface flex max-w-[340px] rounded-[9px] p-[3px]">
      {options.map(({ value, label }) => {
        const active = kind === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={clsx(
              "focus-ring flex h-[38px] flex-1 items-center justify-center rounded-[7px] text-[14px] disabled:cursor-default",
              active
                ? "bg-card text-body font-medium shadow-[0_1px_2px_rgba(27,33,39,.12)]"
                : "text-muted"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Two columns from `md`, 44px apart; one column, 18px apart, below it. */
export function FormColumns({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-[18px] md:gap-11">
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-[18px]">
        {left}
      </div>
      {right && (
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-[18px]">
          {right}
        </div>
      )}
    </div>
  );
}

export function PermissionBox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="bg-surface flex cursor-pointer gap-3 rounded-[10px] px-[15px] py-3.5">
      <span className="relative mt-px flex h-5 w-5 flex-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer border-edge checked:border-primary checked:bg-primary focus-visible:ring-ocean-blue h-5 w-5 cursor-pointer appearance-none rounded-[5px] border-[1.5px] focus-visible:ring-2 focus-visible:ring-offset-2"
        />
        <span
          aria-hidden="true"
          className="text-primary-foreground pointer-events-none absolute inset-0 hidden items-center justify-center text-[13px] peer-checked:flex"
        >
          ✓
        </span>
      </span>
      <span className="text-muted text-[13px] leading-[1.55]">
        I have the right to share this, and I am happy for it to appear in the
        public archive under CC BY-SA 4.0 with the credit above.
      </span>
    </label>
  );
}

export function WhatHappensNext() {
  return (
    <div className="border-hairline rounded-[10px] border px-[17px] py-[15px]">
      <div className="text-muted mb-2 font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
        What happens next
      </div>
      <div className="text-muted text-[13px] leading-[1.65]">
        A person reviews it before it is published · it is credited to the name
        you gave, and we will not publish it without that credit attached · you
        can ask for it to be taken down at any time
      </div>
    </div>
  );
}

/** P6 upload failed, F7 rate limit. */
export function ErrorPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="border-status-error bg-status-error-fill flex flex-col gap-[5px] rounded-[10px] border px-[15px] py-3.5"
    >
      <div className="text-status-error text-[14px] font-semibold">{title}</div>
      <div className="text-body text-[13.5px] leading-[1.55]">{children}</div>
    </div>
  );
}

/** The ochre rule notice on the page itself (S10b). */
export function PageNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className="border-sobrado-ochre bg-surface flex max-w-[640px] flex-col gap-1 rounded-r-lg border-l-[3px] px-3.5 py-3"
    >
      <div className="text-body text-[14px] font-semibold">{title}</div>
      <div className="text-muted text-[13.5px] leading-[1.5]">{children}</div>
    </div>
  );
}

/** "about 10 minutes", from the seconds `Retry-After` gave. */
export function waitPhrase(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `about ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

/**
 * The send button and the line under it. Not ready: an outlined button that
 * names the next step. Ready: "Send to the archive" (or "Try again" after
 * P6). Sending: "Sending · {n}%" with a bar (P5).
 */
export function SubmitArea({
  label,
  ready,
  locked,
  note,
  sending,
  progress,
}: {
  label: string;
  ready: boolean;
  /** Ready, but can't be sent yet (session loading, F7). */
  locked: boolean;
  note: string | null;
  sending: boolean;
  progress: number | null;
}) {
  if (sending) {
    return (
      <div className="flex flex-col gap-[9px]">
        <button
          type="button"
          aria-disabled="true"
          className="bg-primary text-primary-foreground flex h-12 items-center justify-center rounded-lg text-[15px] font-medium opacity-75"
        >
          {progress === null ? "Sending…" : `Sending · ${progress}%`}
        </button>
        {progress !== null && (
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="bg-surface h-1.5 overflow-hidden rounded-[3px]"
          >
            <div
              className="bg-ocean-blue h-full transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <p className="text-muted text-center text-[12.5px]">
          Keep this page open until it finishes. On a slow connection this can
          take a minute.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <button
        type="submit"
        aria-disabled="true"
        className="focus-ring border-edge text-muted flex h-12 w-full items-center justify-center rounded-lg border text-[15px] font-medium"
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <button
        type="submit"
        aria-disabled={locked}
        className={clsx(
          "focus-ring bg-primary text-primary-foreground flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-medium",
          locked && "opacity-50"
        )}
      >
        {label}
      </button>
      {note && (
        <p className="text-muted mt-2 text-center text-[12.5px]">{note}</p>
      )}
    </div>
  );
}
