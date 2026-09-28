import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

import type { ContributionKind } from "../lib/contribution-draft";
import { PAGE_HEADING } from "./form-parts";
import { PrimaryButton } from "./sign-in-parts";

const STRIPE =
  "bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_7px,var(--color-surface-alt)_7px_14px)] dark:bg-[repeating-linear-gradient(135deg,var(--color-card)_0_7px,var(--color-surface)_7px_14px)]";

/**
 * The picture a record is shown with: the chosen photograph (a local object
 * URL), a YouTube thumbnail, or, for Vimeo, the ochre frame (no request).
 */
export function ContributionThumb({
  src,
  vimeo = false,
  sizes,
  className,
}: {
  src: string | null;
  vimeo?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={clsx("relative overflow-hidden", !src && STRIPE, className)}
      aria-hidden="true"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          // An object URL can't go through the optimiser
          unoptimized={src.startsWith("blob:")}
          className="object-cover"
        />
      ) : (
        vimeo && (
          <div className="border-sobrado-ochre bg-surface absolute inset-1 flex items-center justify-center rounded-[4px] border border-dashed">
            <span className="text-sobrado-ochre font-mono text-[9px] font-semibold tracking-[.1em] uppercase">
              Vimeo
            </span>
          </div>
        )
      )}
    </div>
  );
}

export interface SentRecord {
  kind: ContributionKind;
  title: string;
  meta: string;
  town: string | null;
  giverFirstName: string | null;
  imageSrc: string | null;
  vimeo: boolean;
  /** A2: this flow's sign-in created the account. */
  newAccountEmail: string | null;
}

const COPY = {
  photo: {
    body: "A person looks at every photograph before it goes into the archive. It will be published with the credit you gave, and not without it.",
    again: "Give another photograph",
    see: "See the photographs",
    href: "/photographs",
  },
  film: {
    body: "A person checks that the link works and that the film is of Brava before it goes into the archive. The film stays with its host; we show it on its own page.",
    again: "Give another film link",
    see: "See the films",
    href: "/films",
  },
} as const;

function heading({ kind, giverFirstName }: SentRecord): string {
  if (kind === "film") return "Thank you. The film link is with us.";
  return giverFirstName
    ? `Thank you, ${giverFirstName}. It's with us now.`
    : "Thank you. It's with us now.";
}

function lastStep({ kind, town }: SentRecord): string {
  if (kind === "film") return "In the archive, in Films";
  return town ? `In the archive, and on the ${town} page` : "In the archive";
}

/**
 * After sending: A1 (photograph), A2 (A1 plus the new-account note) and A3
 * (film). Replaces the old toasts and the "Archive Updated" screen. Spec 039
 * FR-005.
 */
export function Confirmation({
  record,
  onAgain,
}: {
  record: SentRecord;
  onAgain: () => void;
}) {
  const copy = COPY[record.kind];
  const film = record.kind === "film";

  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-[22px]">
      <div>
        <h1 className={clsx(PAGE_HEADING, "mb-2.5")}>{heading(record)}</h1>
        <p className="text-muted m-0 text-[14.5px] leading-[1.6]">
          {copy.body}
        </p>
      </div>

      <div className="border-hairline bg-card flex items-center gap-3.5 rounded-xl border p-3">
        <ContributionThumb
          src={record.imageSrc}
          vimeo={record.vimeo}
          sizes={film ? "96px" : "60px"}
          className={clsx(
            "h-[60px] flex-none rounded-[7px]",
            film ? "w-24" : "w-[60px]"
          )}
        />
        <div className="min-w-0 text-[14px] leading-[1.45]">
          <div className="text-body truncate font-medium">{record.title}</div>
          {record.meta && (
            <div className="text-muted text-[13px]">{record.meta}</div>
          )}
        </div>
      </div>

      <ol className="border-hairline ml-1.5 flex flex-col border-l-2">
        <Step dot="filled">Received today</Step>
        <Step dot="current">
          A person on the archive team reviews it · usually a few days
        </Step>
        <Step dot="future">{lastStep(record)}</Step>
      </ol>

      <div className="flex flex-wrap gap-2.5">
        {/* PrimaryButton is flex-none, so the wrapper takes the flex basis */}
        <div className="flex-[1_1_200px]">
          <PrimaryButton onClick={onAgain} className="w-full">
            {copy.again}
          </PrimaryButton>
        </div>
        <Link
          href={copy.href}
          className="focus-ring border-edge text-body flex h-12 flex-[1_1_200px] items-center justify-center rounded-lg border text-[15px] font-medium"
        >
          {copy.see}
        </Link>
      </div>

      {record.newAccountEmail && (
        <p className="border-hairline text-muted m-0 border-t pt-3.5 text-[13px] leading-[1.55]">
          This was your first time, so we&apos;ve made an account for{" "}
          {record.newAccountEmail}. It&apos;s used for credit and for taking
          things down, nothing else. Next time, sign in the same way.
        </p>
      )}
    </div>
  );
}

function Step({
  dot,
  children,
}: {
  dot: "filled" | "current" | "future";
  children: string;
}) {
  return (
    <li className="-ml-[7px] flex items-center gap-3 py-1.5">
      <span
        aria-hidden="true"
        className={clsx(
          "h-3 w-3 flex-none rounded-full",
          dot === "filled" && "bg-ocean-blue",
          dot === "current" && "border-ocean-blue bg-canvas border-2",
          dot === "future" && "border-edge bg-canvas border-2"
        )}
      />
      <span
        className={clsx(
          "text-[14px]",
          dot === "future" ? "text-muted" : "text-body"
        )}
      >
        {children}
      </span>
    </li>
  );
}
