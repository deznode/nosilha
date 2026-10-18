"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase-client";
import { createLoginSchema, type LoginInput } from "@/schemas/authSchema";
import { Dialog, DialogTitle } from "@/components/catalyst-ui/dialog";
import { Input } from "@/components/catalyst-ui/input";
import { AnimatedButton } from "@/components/ui/animated-button";

export interface HeldContribution {
  /** What is being held, for the heading. Defaults to "photograph". */
  noun?: "photograph" | "film link";
  photographer: string;
  /** Omitted when the submission cannot record it, so no row claims it is missing. */
  source?: string;
  place?: string;
}

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called once a session exists; the caller resumes whatever sign-in interrupted. */
  onSignedIn: () => void;
  /**
   * The contribution sign-in interrupted, which signing in submits. Omit it when
   * signing in sends nothing by itself, and the dialog makes no such promise.
   */
  held?: HeldContribution;
}

const labelClass = "text-foreground mb-[7px] block text-[11.5px] font-semibold";

/**
 * Email sign-in in place, so a contribution interrupted by auth is held on the page
 * rather than lost to a redirect — a selected File cannot survive navigation.
 *
 * OAuth and account creation both leave the page, so neither is offered inline:
 * the OAuth callback returns to `/`, and sign-up needs an email confirmation before
 * a session exists. Spec 033 FR-010.
 */
export function SignInDialog({
  open,
  onClose,
  onSignedIn,
  held,
}: SignInDialogProps) {
  const t = useTranslations("auth.signInDialog");
  const tv = useTranslations("validation");
  const loginSchema = useMemo(() => createLoginSchema(tv), [tv]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!open) {
      reset();
      setErrorMsg(null);
      setShowPassword(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      onSignedIn();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : t("signInFailed"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      {held && (
        <div className="border-ocean-blue mb-6 rounded-[11px] border px-[18px] py-4">
          <div className="text-ocean-blue mb-2.5 font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
            {t("heldTitle", {
              noun: held.noun === "film link" ? "film" : "photograph",
            })}
          </div>
          <div className="text-muted-foreground flex flex-col gap-[5px] text-[12.5px]">
            <div>
              {t.rich("photographer", {
                text: held.photographer.trim() || t("notRecorded"),
                v: (chunks) => (
                  <span className="text-foreground">{chunks}</span>
                ),
              })}
            </div>
            {held.source !== undefined && (
              <div>
                {t.rich("givenBy", {
                  text: held.source.trim() || t("notRecorded"),
                  v: (chunks) => (
                    <span className="text-foreground">{chunks}</span>
                  ),
                })}
              </div>
            )}
            {held.place !== undefined && (
              <div>
                {t.rich("place", {
                  text: held.place.trim() || t("notYetRecorded"),
                  v: (chunks) => (
                    <span className="text-foreground">{chunks}</span>
                  ),
                })}
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-[11px] text-xs leading-[1.6]">
            {t("heldNote")}
          </p>
        </div>
      )}

      <DialogTitle className="text-foreground! mb-2 font-serif text-[29px]/[1.12]! font-normal!">
        {t("title")}
      </DialogTitle>
      <p className="text-muted-foreground mb-6 max-w-[44ch] text-[13.5px] leading-[1.6]">
        {t("lead")}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-[17px]"
        noValidate
      >
        <div>
          <label htmlFor="signin-email" className={labelClass}>
            {t("email")}
          </label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-status-error mt-1.5 text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signin-password" className={labelClass}>
            {t("password")}
          </label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-10 -translate-y-1/2 text-xs font-semibold"
            >
              {showPassword ? t("hide") : t("show")}
            </button>
          </div>
          {errors.password && (
            <p className="text-status-error mt-1.5 text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        {errorMsg && (
          <p role="alert" className="text-status-error text-sm">
            {errorMsg}
          </p>
        )}

        <AnimatedButton
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="mt-1 w-full"
        >
          {held ? t("submitHeld") : t("submit")}
        </AnimatedButton>
      </form>

      <div className="border-border-subtle mt-[22px] border-t pt-5">
        <div className="flex flex-wrap items-baseline gap-[7px]">
          <span className="text-muted-foreground text-[13px]">
            {t("noAccount")}
          </span>
          <Link
            href="/signup?returnUrl=%2Fcontribute%2Fmedia"
            className="text-ocean-blue text-[13px] font-semibold hover:underline"
          >
            {t("createOne")}
          </Link>
        </div>
        <p className="text-muted-foreground mt-2 text-xs leading-[1.6]">
          {held ? t("createNoteHeld") : t("createNote")}
        </p>
      </div>

      <p className="text-muted-foreground mt-4 max-w-[52ch] text-[11.5px] leading-[1.6]">
        {t("accountNote")}
      </p>
    </Dialog>
  );
}
