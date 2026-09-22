"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/validation/newsletter-schema";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import {
  hasSubmittedEmail,
  recordSubmittedEmail,
} from "@/lib/newsletter-submission-cache";

/**
 * Footer Newsletter Form Component
 *
 * Features:
 * - React Hook Form with Zod validation (reuse newsletter-schema.ts)
 * - Compact horizontal layout (email input + Subscribe button side-by-side)
 * - Server Action integration
 * - Toast notifications for success/error
 * - Hidden honeypot field for spam prevention
 * - Inline validation error messages
 * - Dark mode compatible
 * - WCAG 2.1 Level AA accessible
 *
 * @see frontend/src/app/actions/newsletter.ts - Server Action
 * @see frontend/src/lib/validation/newsletter-schema.ts - Validation schema
 * @see frontend/src/hooks/use-toast.ts - Toast notification system
 */
export function FooterNewsletterForm() {
  const toast = useToast();
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

  // Combine RHF ref with our own ref for focus management
  const { ref: registerRef, ...emailRegister } = register("email");
  const setEmailRef = useCallback(
    (el: HTMLInputElement | null) => {
      registerRef(el);
      emailInputRef.current = el;
    },
    [registerRef]
  );

  const onSubmit = async (data: NewsletterInput) => {
    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      // Security: Show same success message to prevent email enumeration attacks
      // (OWASP recommendation: consistent messages for existent/non-existent accounts)
      if (hasSubmittedEmail(normalizedEmail)) {
        // Clear any existing toasts before showing new one
        toast.clearAll();

        toast.success("Thank you for subscribing!").duration(5000).show();
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
        // Always show success toast (server no longer returns duplicate flag)
        toast.success(response.message).duration(5000).show();
        reset(); // Clear form on success
        emailInputRef.current?.focus();
      } else {
        // Show error toast (8 seconds per tasks.md)
        toast.error(response.message).duration(8000).show();
      }
    } catch (_error) {
      // Show error toast for unexpected errors (8 seconds)
      toast
        .error("An unexpected error occurred. Please try again later.")
        .duration(8000)
        .show();
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle validation errors by clearing any existing toasts.
   * This prevents toast persistence when validation fails after showing
   * an "already subscribed" message.
   */
  const onInvalid = () => {
    // Clear all toasts when validation fails
    toast.clearAll();
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex items-start gap-2"
        noValidate
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="footer-email-address" className="sr-only">
            Email address
          </label>
          <Input
            {...emailRegister}
            ref={setEmailRef}
            id="footer-email-address"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            aria-label="Email address for newsletter subscription"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "footer-email-error" : undefined}
            disabled={isProcessing}
            data-invalid={errors.email ? "" : undefined}
            size="lg"
            appearance="onDark"
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

          {/* Inline validation error message */}
          {errors.email && (
            <p
              id="footer-email-error"
              role="alert"
              className="mt-2 text-sm font-medium text-[#F0B5B0]"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {/* Ochre, not ocean blue: #3D5A73 on the footer's #1B2127 measures
              2.18:1 and fails AA. Ocean blue is the token that fails on this
              ground. Spec 037 FR-009. */}
          <Button
            type="submit"
            size="lg"
            color="accentOnDark"
            disabled={isProcessing}
            className="px-[15px]"
          >
            {isProcessing ? "Subscribing\u2026" : "Subscribe"}
          </Button>
        </div>
      </form>

      {/* Privacy message */}
      <p className="text-footer-muted mt-3 text-xs">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
