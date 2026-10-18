"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
} from "@/components/catalyst-ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitSuggestion } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import type { Translator } from "@/i18n/types";

/** A factory taking a `validation` translator, so messages follow the page's language. */
function createPhotoIdentificationSchema(t: Translator<"validation">) {
  return z.object({
    name: z.string().min(2, t("nameMin")).max(255, t("nameTooLong")),
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    suggestedTitle: z
      .string()
      .max(255, t("titleTooLong"))
      .optional()
      .or(z.literal("")),
    suggestedLocation: z
      .string()
      .max(255, t("locationTooLong"))
      .optional()
      .or(z.literal("")),
    approximateDate: z
      .string()
      .max(100, t("dateTooLong"))
      .optional()
      .or(z.literal("")),
    notes: z.string().min(10, t("notesMin")).max(5000, t("notesTooLong")),
    honeypot: z.string().max(0, t("invalidSubmission")).optional(),
  });
}

type PhotoIdentificationInput = z.infer<
  ReturnType<typeof createPhotoIdentificationSchema>
>;

interface PhotoIdentificationFormProps {
  mediaId: string;
  photoTitle: string;
  pageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  /**
   * When true, renders as a fixed overlay div instead of a Headless UI Dialog.
   * Required when rendered inside a native `<dialog>` opened with showModal(),
   * because Headless UI portals to document.body which is below the top layer.
   */
  inline?: boolean;
}

export function PhotoIdentificationForm({
  mediaId,
  photoTitle,
  pageUrl,
  isOpen,
  onClose,
  inline = false,
}: PhotoIdentificationFormProps) {
  const t = useTranslations("contribute.photoIdentification");
  const tv = useTranslations("validation");
  const photoIdentificationSchema = useMemo(
    () => createPhotoIdentificationSchema(tv),
    [tv]
  );
  const { user, session } = useAuth();
  const isAuthenticated = !!session;
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PhotoIdentificationInput>({
    resolver: zodResolver(photoIdentificationSchema),
    defaultValues: {
      name: "",
      email: isAuthenticated && user?.email ? user.email : "",
      suggestedTitle: "",
      suggestedLocation: "",
      approximateDate: "",
      notes: "",
      honeypot: "",
    },
  });

  const notesValue = useWatch({ control, name: "notes" });

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue("email", user.email);
    }
  }, [isAuthenticated, user?.email, setValue]);

  const onSubmit = async (data: PhotoIdentificationInput) => {
    setIsSubmitting(true);

    if (data.honeypot) {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionEmail =
        isAuthenticated && user?.email ? user.email : (data.email || "").trim();

      // Build message from structured fields
      const messageParts: string[] = [];
      if (data.suggestedTitle) {
        messageParts.push(`Suggested title: ${data.suggestedTitle}`);
      }
      if (data.suggestedLocation) {
        messageParts.push(`Suggested location: ${data.suggestedLocation}`);
      }
      if (data.approximateDate) {
        messageParts.push(`Approximate date: ${data.approximateDate}`);
      }
      messageParts.push(data.notes.trim());
      const message = messageParts.join("\n\n");

      await submitSuggestion({
        contentId: mediaId,
        pageTitle: photoTitle,
        pageUrl,
        contentType: "gallery_media",
        name: data.name.trim(),
        email: submissionEmail.toLowerCase(),
        suggestionType: "PHOTO_IDENTIFICATION",
        message,
        mediaId,
        honeypot: data.honeypot || undefined,
      });

      setSubmitSuccess(true);
      toast.success(t("submitted")).show();
      reset();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t("error");
      toast.error(errorMsg).show();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitSuccess) setSubmitSuccess(false);
    onClose();
  };

  const formContent = submitSuccess ? (
    <>
      <div className="mt-6">
        <div className="bg-valley-green/10 rounded-md p-4">
          <p className="text-valley-green text-sm font-medium">
            {t("successTitle")}
          </p>
          <p className="text-valley-green/90 mt-2 text-sm">
            {t("successBody")}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
        <Button onClick={handleClose}>{t("close")}</Button>
      </div>
    </>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-6">
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            {...register("honeypot")}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-4">
          <Field>
            <Label>{t("nameLabel")}</Label>
            <Input
              {...register("name")}
              type="text"
              placeholder={t("namePlaceholder")}
              disabled={isSubmitting}
              data-invalid={errors.name ? "" : undefined}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>

          {!isAuthenticated && (
            <Field>
              <Label>{t("emailLabel")}</Label>
              <Input
                {...register("email")}
                type="email"
                placeholder={t("emailPlaceholder")}
                disabled={isSubmitting}
                data-invalid={errors.email ? "" : undefined}
              />
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
            </Field>
          )}

          {isAuthenticated && user?.email && (
            <div className="text-muted text-sm">
              {t.rich("submittingAs", {
                email: user.email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </div>
          )}

          <Field>
            <Label>{t("titleLabel")}</Label>
            <Input
              {...register("suggestedTitle")}
              type="text"
              placeholder={t("titlePlaceholder")}
              disabled={isSubmitting}
            />
          </Field>

          <Field>
            <Label>{t("locationLabel")}</Label>
            <Input
              {...register("suggestedLocation")}
              type="text"
              placeholder={t("locationPlaceholder")}
              disabled={isSubmitting}
            />
          </Field>

          <Field>
            <Label>{t("dateLabel")}</Label>
            <Input
              {...register("approximateDate")}
              type="text"
              placeholder={t("datePlaceholder")}
              disabled={isSubmitting}
            />
          </Field>

          <Field>
            <Label>{t("notesLabel")}</Label>
            <Textarea
              {...register("notes")}
              rows={4}
              placeholder={t("notesPlaceholder")}
              disabled={isSubmitting}
              data-invalid={errors.notes ? "" : undefined}
            />
            <p className="text-muted mt-1 text-sm">
              {t("notesCount", { count: String((notesValue || "").length) })}
            </p>
            {errors.notes && (
              <ErrorMessage>{errors.notes.message}</ErrorMessage>
            )}
          </Field>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto">
        <Button plain onClick={handleClose} disabled={isSubmitting}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );

  const title = t("title");
  const description = t("description");

  // Inline mode: render as a fixed overlay within the parent DOM tree.
  // Used inside native <dialog> (showModal) where Headless UI portals
  // are hidden behind the top layer.
  if (inline) {
    if (!isOpen) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="bg-canvas ring-hairline shadow-elevated max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-8 ring-1">
          <h2 className="text-body text-lg/6 font-semibold">{title}</h2>
          <p className="text-muted mt-2 text-sm">{description}</p>
          {formContent}
        </div>
      </div>
    );
  }

  // Default mode: Headless UI Dialog (portals to document.body).
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      {formContent}
    </Dialog>
  );
}
