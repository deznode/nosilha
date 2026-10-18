import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Translator } from "@/i18n/types";

import type { ContributionKind } from "../lib/contribution-draft";
import { PAGE_HEADING, STRIPE } from "./form-parts";
import { PrimaryButton } from "./sign-in-parts";

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

/** Where "See the photographs" / "See the films" leads. */
const SEE_HREF = {
  photo: "/photographs",
  film: "/films",
} as const;

type ConfirmationT = Translator<"contribute.confirmation">;

function heading(
  t: ConfirmationT,
  { kind, giverFirstName }: SentRecord
): string {
  if (kind === "film") return t("headingFilm");
  return giverFirstName
    ? t("headingNamed", { name: giverFirstName })
    : t("heading");
}

function lastStep(t: ConfirmationT, { kind, town }: SentRecord): string {
  if (kind === "film") return t("lastStepFilm");
  return town ? t("lastStepTown", { town }) : t("lastStep");
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
  const t = useTranslations("contribute.confirmation");
  const film = record.kind === "film";

  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-[22px]">
      <div>
        <h1 className={clsx(PAGE_HEADING, "mb-2.5")}>{heading(t, record)}</h1>
        <p className="text-muted m-0 text-[14.5px] leading-[1.6]">
          {t(`${record.kind}.body`)}
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
        <Step dot="filled">{t("received")}</Step>
        <Step dot="current">{t("review")}</Step>
        <Step dot="future">{lastStep(t, record)}</Step>
      </ol>

      <div className="flex flex-wrap gap-2.5">
        <PrimaryButton onClick={onAgain} className="flex-[1_1_200px]">
          {t(`${record.kind}.again`)}
        </PrimaryButton>
        <Link
          href={SEE_HREF[record.kind]}
          className="focus-ring border-edge text-body flex h-12 flex-[1_1_200px] items-center justify-center rounded-lg border text-[15px] font-medium"
        >
          {t(`${record.kind}.see`)}
        </Link>
      </div>

      {record.newAccountEmail && (
        <p className="border-hairline text-muted m-0 border-t pt-3.5 text-[13px] leading-[1.55]">
          {t("newAccount", { email: record.newAccountEmail })}
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
