"use server";

import { Resend } from "resend";
import crypto from "crypto";
import { newsletterSchema } from "@/lib/validation/newsletter-schema";
import type {
  NewsletterActionResponse,
  NewsletterResponse,
  NewsletterErrorResponse,
} from "@/types/newsletter";

/**
 * Newsletter Subscription Server Action
 *
 * Handles newsletter subscription requests with:
 * - FormData parsing and Zod validation
 * - Honeypot spam detection (silent rejection)
 * - Resend API integration with error handling
 * - Retry logic (5-second timeout, single retry)
 * - Logging with hashed emails (30-day retention tracking)
 * - Duplicate email detection via Resend API
 *
 * @param formData - Form data containing email and optional honeypot field
 * @returns NewsletterActionResponse - Success or error response
 *
 * @see frontend/src/lib/validation/newsletter-schema.ts - Validation schema
 * @see frontend/src/types/newsletter.ts - Response types
 * @see plan/specs/006-newsletter-subscription/research.md - Implementation patterns
 */
export async function subscribeToNewsletter(
  formData: FormData
): Promise<NewsletterActionResponse> {
  try {
    // 1. Extract and parse FormData
    // Note: FormData.get() returns null for missing fields, but Zod .optional() expects undefined
    const rawData = {
      email: (formData.get("email") as string) || "",
      website: formData.get("website") ?? undefined, // Convert null → undefined for Zod
    };

    // 2. Validate input with Zod
    const validationResult = newsletterSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validation failed",
        errors,
      } as NewsletterErrorResponse;
    }

    const { email, website } = validationResult.data;

    // 3. Honeypot check (spam prevention)
    if (website) {
      // Silent rejection - don't reveal honeypot to bots
      const emailHash = hashEmail(email);
      const spamEvent = {
        event: "spam_detected",
        timestamp: new Date().toISOString(),
        email_hash: emailHash,
        source: "newsletter_form",
        method: "honeypot",
      };

      console.log(`[SPAM] ${JSON.stringify(spamEvent)}`);

      // Return fake success to avoid revealing honeypot
      return {
        success: true,
        message: "Thank you for subscribing!",
      } as NewsletterResponse;
    }

    // 4. Call Resend API with retry logic
    const result = await subscribeWithRetry(email);

    return result;
  } catch (error: unknown) {
    console.error("[Newsletter] Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    } as NewsletterErrorResponse;
  }
}

/**
 * Subscribe to newsletter with retry logic
 *
 * Implements single retry on timeout or server errors (5xx).
 * Does not retry on client errors (4xx) like rate limiting or invalid email.
 *
 * @param email - Validated email address
 * @returns NewsletterActionResponse - Success or error response
 */
async function subscribeWithRetry(
  email: string
): Promise<NewsletterActionResponse> {
  const TIMEOUT_MS = 5000;
  const MAX_RETRIES = 1;

  // Initialize Resend client
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create timeout promise that rejects after TIMEOUT_MS
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject({
            name: "AbortError",
            message: "Request timeout",
          });
        }, TIMEOUT_MS);
      });

      // Race between API call and timeout
      const response = await Promise.race([
        resend.contacts.create({
          email,
          unsubscribed: false,
        }),
        timeoutPromise,
      ]);

      // Log success event
      const successEvent = {
        event: "newsletter_subscription_success",
        timestamp: new Date().toISOString(),
        email_hash: hashEmail(email),
        contact_id: response.data?.id,
      };
      console.log(`[Newsletter] ${JSON.stringify(successEvent)}`);

      return {
        success: true,
        message: "Thank you for subscribing!",
      } as NewsletterResponse;
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        statusCode?: number;
        name?: string;
      };

      // Handle duplicate email detection
      // Security: Return same success message to prevent email enumeration attacks
      // (OWASP recommendation: consistent messages for existent/non-existent accounts)
      if (err.message?.includes("Contact already exists")) {
        const duplicateEvent = {
          event: "newsletter_duplicate_detected",
          timestamp: new Date().toISOString(),
          email_hash: hashEmail(email),
        };
        console.log(`[Newsletter] ${JSON.stringify(duplicateEvent)}`);

        // Return identical message as new subscription to prevent enumeration
        return {
          success: true,
          message: "Thank you for subscribing!",
        } as NewsletterResponse;
      }

      // Handle rate limiting
      if (err.statusCode === 429) {
        return {
          success: false,
          message: "Too many requests. Please try again in a few minutes.",
        } as NewsletterErrorResponse;
      }

      // Retry on timeout or server errors (5xx)
      if (
        attempt < MAX_RETRIES &&
        (err.name === "AbortError" || (err.statusCode && err.statusCode >= 500))
      ) {
        const retryEvent = {
          event: "newsletter_retry_attempt",
          timestamp: new Date().toISOString(),
          email_hash: hashEmail(email),
          attempt: attempt + 1,
          error_type: err.name,
          error_code: err.statusCode,
        };
        console.log(`[Newsletter] ${JSON.stringify(retryEvent)}`);
        continue; // Retry
      }

      // Don't retry on client errors (4xx) or after max retries
      const errorEvent = {
        event: "newsletter_subscription_failed",
        timestamp: new Date().toISOString(),
        email_hash: hashEmail(email),
        error_type: err.name,
        error_code: err.statusCode,
        error_message: err.message,
      };
      console.error(`[Newsletter] ${JSON.stringify(errorEvent)}`);

      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
      } as NewsletterErrorResponse;
    }
  }

  // Fallback (should never reach here due to loop logic)
  return {
    success: false,
    message: "Failed to subscribe. Please try again later.",
  } as NewsletterErrorResponse;
}

/**
 * Hash email for privacy-compliant logging
 *
 * Uses SHA-256 to create one-way hash of email address.
 * Ensures GDPR compliance by never storing plaintext emails in logs.
 *
 * @param email - Email address to hash
 * @returns SHA-256 hash of email (hex format)
 */
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}
