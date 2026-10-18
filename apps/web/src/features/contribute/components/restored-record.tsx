import clsx from "clsx";
import { useTranslations } from "next-intl";

import type { ContributionKind } from "../lib/contribution-draft";
import { ContributionThumb } from "./confirmation";
import { PAGE_HEADING } from "./form-parts";
import { LinkButton, PrimaryButton } from "./sign-in-parts";

export interface RecordRow {
  label: string;
  value: string;
}

/**
 * S9: back from Google, signed in, with the draft restored. The record is
 * shown for a last check before it is sent. Spec 039 FR-002.
 */
export function RestoredRecord({
  kind,
  email,
  rows,
  imageSrc,
  vimeo,
  sendLabel,
  sendDisabled,
  onSend,
  onChange,
}: {
  kind: ContributionKind;
  email: string | null;
  rows: RecordRow[];
  imageSrc: string | null;
  vimeo: boolean;
  sendLabel: string;
  sendDisabled: boolean;
  onSend: () => void;
  onChange: () => void;
}) {
  const t = useTranslations("contribute.restored");
  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-[18px]">
      <div>
        <div className="text-ocean-blue mb-2.5 font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
          {t("eyebrow")}
        </div>
        <h1 className={clsx(PAGE_HEADING, "mb-2")}>{t("title", { kind })}</h1>
        <p className="text-muted m-0 text-[14.5px] leading-[1.55]">
          {email ? t("signedInAs", { email }) : t("signedIn")}
        </p>
      </div>

      <div className="border-hairline bg-card overflow-hidden rounded-xl border">
        <ContributionThumb
          src={imageSrc}
          vimeo={vimeo}
          sizes="520px"
          className="h-[170px] md:h-[240px]"
        />
        {rows.length > 0 && (
          <dl className="grid grid-cols-[84px_1fr] gap-x-2.5 gap-y-[7px] px-[15px] py-[13px] text-[14px]">
            {rows.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className="text-body m-0 min-w-0 break-words">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <PrimaryButton
        onClick={onSend}
        aria-disabled={sendDisabled}
        className={clsx(sendDisabled && "opacity-75")}
      >
        {sendLabel}
      </PrimaryButton>
      <LinkButton onClick={onChange} className="self-center text-[14px]">
        {t("change")}
      </LinkButton>
    </div>
  );
}
