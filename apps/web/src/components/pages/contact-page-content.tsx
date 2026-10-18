"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HelpCircle, CheckCircle, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import { Checkbox, CheckboxField } from "@/components/catalyst-ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/api";
import {
  createContactSchema,
  type ContactInput,
} from "@/schemas/contactSchema";
import { pageStagger, pageItem } from "@/lib/animation";
import type { ContactSubject } from "@/types/contact";

const SUBJECTS = ["general", "content", "technical", "partnership"] as const;

export function ContactPageContent() {
  const t = useTranslations("contact");
  const contactSchema = useMemo(() => createContactSchema(t), [t]);
  const subjectOptions = SUBJECTS.map((value) => ({
    value,
    label: t(`subjects.${value}`),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: undefined,
      message: "",
      agreedToPrivacy: false,
    },
  });

  const agreedToPrivacy = useWatch({ control, name: "agreedToPrivacy" });

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Map form subject to ContactSubject enum
      const subjectMap: Record<string, ContactSubject> = {
        general: "GENERAL_INQUIRY",
        content: "CONTENT_SUGGESTION",
        technical: "TECHNICAL_ISSUE",
        partnership: "PARTNERSHIP",
      };

      const response = await submitContactMessage({
        name: data.name,
        email: data.email,
        subjectCategory: subjectMap[data.subject],
        message: data.message,
      });

      setConfirmationMessage(response.message);
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific error messages from backend
        if (error.message.includes("exceeded the maximum number")) {
          setErrorMessage(t("errors.rateLimited"));
        } else if (error.message.includes("Invalid contact form data")) {
          setErrorMessage(t("errors.invalid"));
        } else {
          setErrorMessage(t("errors.failed"));
        }
      } else {
        setErrorMessage(t("errors.unexpected"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsSubmitted(false);
    setConfirmationMessage("");
    setErrorMessage("");
  };

  return (
    <div className="bg-surface font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        {/* Contact Form - Ideate Style */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="border-hairline bg-canvas shadow-floating rounded-card overflow-hidden border">
            {/* Blue Header Bar */}
            <div className="bg-ocean-blue px-6 py-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Send className="h-5 w-5" />
                {t("form.heading")}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-6 py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="bg-valley-green/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                  >
                    <CheckCircle className="text-valley-green h-10 w-10" />
                  </motion.div>
                  <h4 className="text-body mb-2 font-serif text-2xl font-bold">
                    {t("success.heading")}
                  </h4>
                  <p className="text-muted mb-6 text-lg">
                    {confirmationMessage || t("success.defaultMessage")}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-button border-2 px-6 py-2 font-medium transition-colors hover:text-white"
                  >
                    {t("success.sendAnother")}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 p-6"
                >
                  {/* Error Message Display */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-status-error/20 bg-status-error/10 text-status-error rounded-card border p-4"
                    >
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Name and Email Row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field>
                      <Label>{t("form.nameLabel")}</Label>
                      <Input
                        {...register("name")}
                        type="text"
                        placeholder={t("form.namePlaceholder")}
                        disabled={isSubmitting}
                        data-invalid={errors.name ? "" : undefined}
                      />
                      {errors.name && (
                        <ErrorMessage>{errors.name.message}</ErrorMessage>
                      )}
                    </Field>

                    <Field>
                      <Label>{t("form.emailLabel")}</Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder={t("form.emailPlaceholder")}
                        disabled={isSubmitting}
                        data-invalid={errors.email ? "" : undefined}
                      />
                      {errors.email && (
                        <ErrorMessage>{errors.email.message}</ErrorMessage>
                      )}
                    </Field>
                  </div>

                  {/* Subject Dropdown */}
                  <Field>
                    <Label>{t("form.subjectLabel")}</Label>
                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={subjectOptions}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder={t("form.subjectPlaceholder")}
                          disabled={isSubmitting}
                          invalid={!!errors.subject}
                        />
                      )}
                    />
                    {errors.subject && (
                      <ErrorMessage>{errors.subject.message}</ErrorMessage>
                    )}
                  </Field>

                  {/* Message Textarea */}
                  <Field>
                    <Label>{t("form.messageLabel")}</Label>
                    <Textarea
                      {...register("message")}
                      rows={6}
                      placeholder={t("form.messagePlaceholder")}
                      disabled={isSubmitting}
                      data-invalid={errors.message ? "" : undefined}
                    />
                    {errors.message && (
                      <ErrorMessage>{errors.message.message}</ErrorMessage>
                    )}
                  </Field>

                  {/* Privacy Checkbox */}
                  <Controller
                    name="agreedToPrivacy"
                    control={control}
                    render={({ field }) => (
                      <CheckboxField>
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                        <Label className="text-text-muted text-sm">
                          {t.rich("form.privacyAgreement", {
                            link: (chunks) => (
                              <Link
                                href="/privacy"
                                className="text-ocean-blue hover:underline"
                              >
                                {chunks}
                              </Link>
                            ),
                          })}
                        </Label>
                      </CheckboxField>
                    )}
                  />
                  {errors.agreedToPrivacy && (
                    <ErrorMessage>
                      {errors.agreedToPrivacy.message}
                    </ErrorMessage>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      type="submit"
                      disabled={isSubmitting || !agreedToPrivacy}
                      className="bg-ocean-blue hover:bg-ocean-blue/90 disabled:bg-ocean-blue/50 shadow-subtle rounded-button inline-flex w-full items-center justify-center gap-2 px-8 py-3 text-base font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("form.sending")}
                        </>
                      ) : (
                        t("form.submit")
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <section className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-body mb-8 text-center font-serif text-2xl font-bold"
          >
            {t("faq.heading")}
          </motion.h3>

          <motion.div
            variants={pageStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-ocean-blue mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    {t("faq.business.question")}
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  {t.rich("faq.business.answer", {
                    link: (chunks) => (
                      <Link
                        href="/contribute"
                        className="text-ocean-blue hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-valley-green mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    {t("faq.photos.question")}
                  </h4>
                </div>
                <p className="text-muted ml-9">{t("faq.photos.answer")}</p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-bougainvillea-pink mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    {t("faq.languages.question")}
                  </h4>
                </div>
                <p className="text-muted ml-9">{t("faq.languages.answer")}</p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-sobrado-ochre mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    {t("faq.development.question")}
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  {t.rich("faq.development.answer", {
                    link: (chunks) => (
                      <a
                        href="https://github.com/deznode/nosilha"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sobrado-ochre hover:underline"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Community Links */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="from-ocean-blue/10 to-valley-green/10 rounded-card mt-16 bg-gradient-to-r p-8 text-center"
        >
          <h3 className="text-body mb-4 font-serif text-2xl font-bold">
            {t("community.heading")}
          </h3>
          <p className="text-muted mb-6 text-lg">{t("community.body")}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-subtle rounded-button px-6 py-3 text-base font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              {t("community.contribute")}
            </Link>
            <a
              href="https://github.com/deznode/nosilha"
              target="_blank"
              rel="noopener noreferrer"
              className="border-bougainvillea-pink text-bougainvillea-pink hover:bg-bougainvillea-pink rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              {t("community.github")}
            </a>
            <Link
              href="/about"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              {t("community.about")}
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
