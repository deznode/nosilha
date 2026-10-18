"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { FilmLookupResult } from "../hooks/use-film-lookup";
import type { ContributionForm } from "../lib/contribution-form";
import type { ParsedFilmLink } from "../lib/parse-video-url";
import { DuplicateCard } from "./duplicate-card";
import { FilmPreviewCard } from "./film-preview-card";
import {
  FormColumns,
  HINT,
  PermissionBox,
  TextAreaField,
  TextField,
} from "./form-parts";
import type { PhotoFormProps } from "./photo-form";
import { TownField } from "./town-field";

interface FilmFormProps {
  form: ContributionForm;
  onChange: PhotoFormProps["onChange"];
  /** The recognised link, or null (empty, or F4). */
  link: ParsedFilmLink | null;
  lookup: FilmLookupResult;
  /** A correction came back 401: sign in, then send it again. */
  onNeedsSignIn: () => void;
  /** F7 panel and the send button. */
  footer: ReactNode;
}

/**
 * The film form, F1–F7. When the link is already in the archive (F5) or
 * waiting for review (F6), the duplicate card replaces the rest of the form.
 * Spec 039 FR-004.
 */
export function FilmForm({
  form,
  onChange,
  link,
  lookup,
  onNeedsSignIn,
  footer,
}: FilmFormProps) {
  const t = useTranslations("contribute.film");
  const typed = form.filmUrl.trim() !== "";
  const unrecognised = typed && !link;
  const duplicate =
    link && (lookup.status === "public" || lookup.status === "pending")
      ? lookup.status
      : null;

  return (
    <FormColumns
      left={
        <>
          <TextField
            id="f-film-url"
            name="url"
            type="url"
            inputMode="url"
            label={t("urlLabel")}
            placeholder={t("urlPlaceholder")}
            value={form.filmUrl}
            onChange={(e) => onChange("filmUrl", e.target.value)}
            invalid={unrecognised}
            aria-describedby={
              unrecognised || !typed ? "f-film-url-note" : undefined
            }
            hint={
              unrecognised ? (
                <p
                  id="f-film-url-note"
                  className="text-status-error mt-[7px] text-[13px] leading-[1.5]"
                >
                  {t("urlUnrecognised")}
                </p>
              ) : (
                !typed && (
                  <p id="f-film-url-note" className={HINT}>
                    {t("urlHint")}
                  </p>
                )
              )
            }
          />

          {link && duplicate && (
            <DuplicateCard
              // A fresh card per film, so a correction typed or sent for one
              // never carries over to the next
              key={`${link.platform}:${link.externalId}`}
              status={duplicate}
              platform={link.platform}
              externalId={link.externalId}
              media={lookup.media}
              onNeedsSignIn={onNeedsSignIn}
            />
          )}

          {!duplicate && (
            <>
              {link && (
                <FilmPreviewCard
                  platform={link.platform}
                  externalId={link.externalId}
                />
              )}
              <TextField
                id="f-film-title"
                name="title"
                label={t("titleLabel")}
                placeholder={t("titlePlaceholder")}
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
              />
              <TextField
                id="f-photographer"
                name="author"
                label={t("authorLabel")}
                placeholder={t("authorPlaceholder")}
                value={form.photographer}
                onChange={(e) => onChange("photographer", e.target.value)}
              />
              <TextAreaField
                id="f-description"
                name="description"
                label={t("descriptionLabel")}
                placeholder={t("descriptionPlaceholder")}
                hint={t("descriptionHint")}
                minHeight={80}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
              />
            </>
          )}
        </>
      }
      right={
        !duplicate && (
          <>
            <TownField
              kind="film"
              label={t("placeLabel")}
              value={form.place}
              onChange={(place) => onChange("place", place)}
            />
            <TextField
              id="f-date"
              name="approximate_date"
              label={t("dateLabel")}
              placeholder={t("datePlaceholder")}
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
            />
            <PermissionBox
              checked={form.permission}
              onChange={(checked) => onChange("permission", checked)}
            />
            {footer}
          </>
        )
      }
    />
  );
}
