/**
 * Newsletter Subscription Types
 *
 * Response types for newsletter subscription Server Action.
 * Used for type-safe communication between client and server.
 *
 * @see frontend/src/app/actions/newsletter.ts - Server Action implementation
 */

/**
 * Successful newsletter subscription response
 *
 * Returned when:
 * - Email successfully added to Resend audience
 * - Email already exists in audience (duplicate detection)
 * - Spam detected via honeypot (silent rejection with fake success)
 */
export interface NewsletterResponse {
  /**
   * Indicates successful operation
   */
  success: true;

  /**
   * User-friendly message to display
   *
   * Examples:
   * - "Thank you for subscribing!"
   * - "This email is already subscribed to our newsletter."
   */
  message: string;

  /**
   * Indicates duplicate email detection
   *
   * When true, the email already exists in the Resend audience.
   * UI should display informational styling (not error styling).
   *
   * @optional Only present when duplicate detected
   */
  duplicate?: boolean;
}

/**
 * Failed newsletter subscription response
 *
 * Returned when:
 * - Validation errors occur (invalid email format)
 * - Resend API errors (rate limiting, server errors)
 * - Network timeouts after retry attempts
 * - Unexpected system errors
 */
export interface NewsletterErrorResponse {
  /**
   * Indicates failed operation
   */
  success: false;

  /**
   * User-friendly error message to display
   *
   * Examples:
   * - "Failed to subscribe. Please try again later."
   * - "Too many requests. Please try again in a few minutes."
   */
  message: string;

  /**
   * Structured validation errors by field
   *
   * Maps field names to array of error messages.
   *
   * Example:
   * ```typescript
   * {
   *   email: ["Email is required", "Please enter a valid email address"]
   * }
   * ```
   *
   * @optional Only present for validation errors
   */
  errors?: Record<string, string[]>;
}

/**
 * Union type for all possible newsletter subscription responses
 *
 * Use this type for Server Action return value and client-side handling.
 *
 * Example usage:
 * ```typescript
 * const response: NewsletterActionResponse = await subscribeToNewsletter(formData);
 *
 * if (response.success) {
 *   // Handle success (NewsletterResponse)
 *   if (response.duplicate) {
 *     // Show informational message
 *   } else {
 *     // Show success message
 *   }
 * } else {
 *   // Handle error (NewsletterErrorResponse)
 *   if (response.errors) {
 *     // Display validation errors
 *   } else {
 *     // Display generic error message
 *   }
 * }
 * ```
 */
export type NewsletterActionResponse =
  | NewsletterResponse
  | NewsletterErrorResponse;
