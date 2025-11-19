"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/validation/newsletter-schema";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useToast } from "@/hooks/use-toast";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterInput) => {
    try {
      // Create FormData for Server Action
      const formData = new FormData();
      formData.append("email", data.email);
      if (data.website) {
        formData.append("website", data.website);
      }

      // Call Server Action
      const response = await subscribeToNewsletter(formData);

      if (response.success) {
        // Show success toast (5 seconds per tasks.md)
        toast.showSuccess(response.message, 5000);
        reset(); // Clear form on success
      } else {
        // Show error toast (8 seconds per tasks.md)
        toast.showError(response.message, 8000);
      }
    } catch (_error) {
      // Show error toast for unexpected errors (8 seconds)
      toast.showError(
        "An unexpected error occurred. Please try again later.",
        8000
      );
    }
  };

  return (
    <div className="mt-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sm:flex sm:max-w-md"
        noValidate
      >
        <div className="flex-1">
          <label htmlFor="footer-email-address" className="sr-only">
            Email address
          </label>
          <input
            {...register("email")}
            id="footer-email-address"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-label="Email address for newsletter subscription"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "footer-email-error" : undefined}
            disabled={isSubmitting}
            className="bg-background-primary text-text-primary ring-border-primary placeholder:text-text-tertiary focus:ring-ocean-blue w-full min-w-0 appearance-none rounded-md border-0 px-3 py-1.5 text-base shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-60 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
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
              className="text-destructive mt-2 text-sm font-medium"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ocean-blue hover:bg-ocean-blue/90 focus-visible:outline-ocean-blue disabled:hover:bg-ocean-blue flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            {isSubmitting ? "..." : "Subscribe"}
          </button>
        </div>
      </form>

      {/* Privacy message */}
      <p className="text-text-tertiary mt-4 text-sm">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
