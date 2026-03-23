"use client";

import { useState, useRef } from "react";
import clsx from "clsx";
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
 * Homepage Newsletter Subscription Section
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Server Action integration
 * - Inline success/error messages with ARIA live regions
 * - Hidden honeypot field for spam prevention
 * - Ocean Blue gradient background (Nos Ilha brand)
 * - Mobile-first responsive design
 * - WCAG 2.1 Level AA accessible
 *
 * @see frontend/src/app/actions/newsletter.ts - Server Action
 * @see frontend/src/lib/validation/newsletter-schema.ts - Validation schema
 */
export default function HomepageNewsletterSection() {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<
    "success" | "error" | "info"
  >("success");
  const [isProcessing, setIsProcessing] = useState(false);
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
      // Clear any previous messages when form is submitted
      setResponseMessage(null);
      setIsProcessing(true);

      const normalizedEmail = data.email.trim().toLowerCase();

      // Security: Show same success message to prevent email enumeration attacks
      // (OWASP recommendation: consistent messages for existent/non-existent accounts)
      if (hasSubmittedEmail(normalizedEmail)) {
        setMessageVariant("success");
        setResponseMessage("Thank you for subscribing!");
        reset();
        emailInputRef.current?.focus();
        return;
      }

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
        setMessageVariant("success");
        setResponseMessage(response.message);
        reset();
        emailInputRef.current?.focus();
      } else {
        setMessageVariant("error");
        setResponseMessage(response.message);
      }
    } catch (_error) {
      setMessageVariant("error");
      setResponseMessage(
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle validation errors by clearing any existing messages.
   * This prevents message persistence when validation fails after showing
   * an "already subscribed" message.
   */
  const onInvalid = () => {
    // Clear the response message when validation fails
    setResponseMessage(null);
  };

  const messageClassName = clsx(
    "mt-4 rounded-md px-4 py-3 text-center text-base font-semibold",
    {
      "bg-white/10 text-white": messageVariant === "success",
      "bg-sobrado-ochre/20 text-sobrado-ochre": messageVariant === "info",
      "bg-white text-bougainvillea-pink": messageVariant === "error",
    }
  );

  return (
    <section className="bg-background-primary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="from-ocean-blue via-ocean-blue/80 to-ocean-blue/60 border-ocean-blue/30 shadow-elevated hover:shadow-floating relative isolate overflow-hidden rounded-lg border bg-gradient-to-br px-6 py-24 transition-shadow sm:px-24 xl:py-32">
          {/* Ocean-inspired radial gradient overlay */}
          <div
            className="absolute inset-0 -z-10 opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <h2 className="mx-auto max-w-3xl text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Stay Connected with Brava Island
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-center font-sans text-lg text-white/90">
              Get updates on cultural events, new heritage sites, and stories
              from our island community.
            </p>

            {/* Newsletter Form */}
            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="mx-auto mt-10 max-w-md"
              noValidate
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-x-4">
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    {...register("email", {
                      setValueAs: (value) => value,
                    })}
                    ref={(e) => {
                      register("email").ref(e);
                      emailInputRef.current = e;
                    }}
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter subscription"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    disabled={isProcessing}
                    className="focus:ring-offset-ocean-blue w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-sans text-base text-white transition-all placeholder:text-white/60 focus:border-white/40 focus:bg-white/20 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
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
                      id="email-error"
                      role="alert"
                      className="mt-2 text-sm font-medium text-white"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="text-ocean-blue shadow-subtle flex-none rounded-lg bg-white px-6 py-3 font-sans text-sm font-semibold transition-all hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:active:scale-100"
                >
                  {isProcessing ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              {/* Success/Error message */}
              {responseMessage && (
                <div
                  role={messageVariant === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={messageClassName}
                >
                  {responseMessage}
                </div>
              )}
            </form>

            {/* Privacy Note */}
            <p className="mx-auto mt-6 max-w-md text-center font-sans text-sm text-white/70">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Decorative Ocean Blue Glow - Nos Ilha Brand Identity */}
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 opacity-10"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#nos-ilha-newsletter-gradient)"
              fillOpacity="0.4"
            />
            <defs>
              <radialGradient
                id="nos-ilha-newsletter-gradient"
                cx={0}
                cy={0}
                r={1}
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(512 512) rotate(90) scale(512)"
              >
                <stop stopColor="var(--brand-ocean-blue)" />
                <stop offset={0.5} stopColor="var(--brand-valley-green)" />
                <stop offset={1} stopColor="transparent" stopOpacity={0} />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
