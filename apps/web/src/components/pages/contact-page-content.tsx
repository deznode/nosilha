"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, CheckCircle, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import { Checkbox, CheckboxField } from "@/components/catalyst-ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/api";
import { contactSchema, type ContactInput } from "@/schemas/contactSchema";
import { pageStagger, pageItem } from "@/lib/animation";
import type { ContactSubject } from "@/types/contact";

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "content", label: "Content Suggestion" },
  { value: "technical", label: "Technical Issue" },
  { value: "partnership", label: "Partnership Opportunity" },
];

export function ContactPageContent() {
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
    watch,
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

  const agreedToPrivacy = watch("agreedToPrivacy");

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
          setErrorMessage(
            "Too many submissions. Please wait an hour before trying again."
          );
        } else if (error.message.includes("Invalid contact form data")) {
          setErrorMessage(
            "Invalid form data. Please check your input and try again."
          );
        } else {
          setErrorMessage(
            "Failed to submit your message. Please try again later."
          );
        }
      } else {
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
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
        <PageHeader
          title="Contact Us"
          subtitle="Get in touch with the Nos Ilha community. We're here to help and would love to hear from you."
        />

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
                Send us a Message
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
                    Obrigado!
                  </h4>
                  <p className="text-muted mb-6 text-lg">
                    {confirmationMessage ||
                      "Thank you for your message. We'll get back to you within 24-48 hours."}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-button border-2 px-6 py-2 font-medium transition-colors hover:text-white"
                  >
                    Send Another Message
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
                      <Label>Your Name</Label>
                      <Input
                        {...register("name")}
                        type="text"
                        placeholder="Enter your name"
                        disabled={isSubmitting}
                        data-invalid={errors.name ? "" : undefined}
                      />
                      {errors.name && (
                        <ErrorMessage>{errors.name.message}</ErrorMessage>
                      )}
                    </Field>

                    <Field>
                      <Label>Email Address</Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="Enter your email"
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
                    <Label>Subject</Label>
                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={subjectOptions}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Select a subject"
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
                    <Label>Message</Label>
                    <Textarea
                      {...register("message")}
                      rows={6}
                      placeholder="Tell us how we can help you..."
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
                          I agree to the{" "}
                          <Link
                            href="/privacy"
                            className="text-ocean-blue hover:underline"
                          >
                            privacy policy
                          </Link>
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
                          Sending...
                        </>
                      ) : (
                        "Send Message"
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
            Frequently Asked Questions
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
                    How can I add my business to the directory?
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  Visit our{" "}
                  <Link
                    href="/contribute"
                    className="text-ocean-blue hover:underline"
                  >
                    contribute page
                  </Link>{" "}
                  for detailed instructions. We need your business name,
                  location, contact details, description, and photos if
                  possible. All submissions are reviewed by our volunteer team
                  within 1-2 weeks to ensure accuracy and cultural authenticity.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-valley-green mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    Can I contribute photos of Brava Island?
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  Yes! We especially welcome high-quality photos of landscapes,
                  cultural events, local businesses, and daily life on Brava.
                  Please ensure you own the photos or have permission to share
                  them. Use the contact form above with &quot;Content
                  Contribution&quot; selected to submit your photos with
                  location details.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-bougainvillea-pink mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    Is the platform available in other languages?
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  Currently available in English only. We&apos;re actively
                  planning Portuguese and Kriolu (Cape Verdean Crioulo) support
                  for 2026. If you&apos;re fluent in these languages and
                  interested in helping translate content, use the contact form
                  with &quot;Partnership Opportunity&quot; selected.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={pageItem}>
              <Card hoverable className="h-full p-6">
                <div className="mb-3 flex items-start">
                  <HelpCircle className="text-sobrado-ochre mt-0.5 mr-3 h-6 w-6 shrink-0" />
                  <h4 className="text-body font-semibold">
                    How can I get involved in development?
                  </h4>
                </div>
                <p className="text-muted ml-9">
                  Nos Ilha is fully open-source! Visit our{" "}
                  <a
                    href="https://github.com/deznode/nosilha"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sobrado-ochre hover:underline"
                  >
                    GitHub repository
                  </a>{" "}
                  to see current issues, contribution guidelines, and the tech
                  stack (Next.js, React, Spring Boot, Kotlin). New developers
                  can start with &quot;good first issue&quot; labels, or use the
                  contact form with &quot;Technical Support&quot; for guidance.
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
            Join Our Community
          </h3>
          <p className="text-muted mb-6 text-lg">
            Connect with other Brava Island enthusiasts and stay updated on
            platform developments.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-subtle rounded-button px-6 py-3 text-base font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              Contribute Content
            </Link>
            <a
              href="https://github.com/deznode/nosilha"
              target="_blank"
              rel="noopener noreferrer"
              className="border-bougainvillea-pink text-bougainvillea-pink hover:bg-bougainvillea-pink rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              View on GitHub
            </a>
            <Link
              href="/about"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Learn More About Us
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
