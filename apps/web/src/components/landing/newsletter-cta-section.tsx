"use client";

import { useState, useRef } from "react";
import { Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/validation/newsletter-schema";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import {
  hasSubmittedEmail,
  recordSubmittedEmail,
} from "@/lib/newsletter-submission-cache";

/**
 * NewsletterCtaSection - Join the community CTA
 *
 * Full-width blue section with newsletter signup form.
 * Integrates with Resend for newsletter subscription.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Server Action integration with Resend
 * - Hidden honeypot field for spam prevention
 * - Client-side duplicate detection
 * - WCAG 2.1 Level AA accessible
 */
export function NewsletterCtaSection() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterInput) => {
    try {
      setMessage(null);
      const normalizedEmail = data.email.trim().toLowerCase();

      // Security: Show same success message to prevent email enumeration attacks
      // (OWASP recommendation: consistent messages for existent/non-existent accounts)
      if (hasSubmittedEmail(normalizedEmail)) {
        setMessage({
          type: "success",
          text: "Thank you for subscribing!",
        });
        reset();
        emailInputRef.current?.focus();
        return;
      }

      setIsProcessing(true);

      // Create FormData for Server Action
      const formData = new FormData();
      formData.append("email", data.email);
      if (data.website) {
        formData.append("website", data.website);
      }

      // Call Server Action
      const response = await subscribeToNewsletter(formData);

      if (response.success) {
        recordSubmittedEmail(normalizedEmail);
        // Always show success message (server no longer returns duplicate flag)
        setMessage({ type: "success", text: response.message });
        reset();
        emailInputRef.current?.focus();
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch (_error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onInvalid = () => {
    // Clear any previous messages when validation fails
    setMessage(null);
  };

  return (
    <section className="bg-ocean-blue-deep relative overflow-hidden py-24 text-white">
      <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
        {/* Icon */}
        <div className="text-bougainvillea-pink mb-6 inline-block rounded-full bg-white/10 p-4 backdrop-blur-md">
          <Users size={32} />
        </div>

        {/* Heading */}
        <h2 className="mb-8 font-serif text-4xl font-bold text-white md:text-5xl">
          Join the Brava Community
        </h2>

        {/* Description */}
        <p className="mb-4 text-lg leading-relaxed text-white/90">
          Join our community of storytellers. Stay connected with updates and
          learn how you can contribute photos, stories, and knowledge to the
          archive.
        </p>
        <p className="mb-10 text-base leading-relaxed text-white/80">
          Whether you live on the island or across the world, you&apos;re part
          of Brava&apos;s story. Get occasional updates with new stories,
          interactive map features, and ways to support local projects and
          cultural preservation.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row sm:items-start"
          noValidate
        >
          <div className="flex-grow">
            <label htmlFor="landing-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              {...register("email")}
              ref={(e) => {
                register("email").ref(e);
                emailInputRef.current = e;
              }}
              id="landing-newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address…"
              aria-label="Email address for newsletter subscription"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={
                errors.email ? "landing-email-error" : undefined
              }
              disabled={isProcessing}
              className="focus:ring-bougainvillea-pink rounded-button w-full border border-white/30 bg-white/10 px-6 py-3 text-white placeholder-white/70 backdrop-blur-sm transition-all focus:bg-white/20 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />

            {/* Honeypot field (hidden from users and screen readers) */}
            <input
              {...register("website")}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="absolute left-[-9999px]"
              aria-hidden="true"
            />

            {/* Validation error message */}
            {errors.email && (
              <p
                id="landing-email-error"
                role="alert"
                className="mt-2 text-left text-sm font-medium text-white"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 focus-visible:ring-offset-ocean-blue-deep rounded-button px-8 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`mt-4 text-sm ${
              message.type === "success"
                ? "text-green-300"
                : message.type === "info"
                  ? "text-yellow-300"
                  : "text-red-300"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Privacy note */}
        <p className="mt-6 text-xs text-white/60">
          We respect your privacy. No spam, just meaningful stories and updates.
          Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
