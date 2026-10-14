import { z } from "zod";

import type { Translator } from "@/i18n/types";

/**
 * Newsletter subscription form validation schema
 *
 * Validates email input and includes honeypot field for spam prevention.
 * Uses Zod's built-in email validator which follows RFC 5322 standard.
 *
 * @see https://zod.dev/ - Zod documentation
 * @see https://datatracker.ietf.org/doc/html/rfc5322 - RFC 5322 Email Format
 *
 * A factory taking a `validation` translator, so the messages follow the
 * page's language (the server action passes one for the form's locale).
 */
export const createNewsletterSchema = (t: Translator<"validation">) =>
  z.object({
    /**
     * Email address field
     *
     * Validation rules:
     * - Whitespace trimmed automatically
     * - Required field (cannot be empty)
     * - Must be valid email format per RFC 5322
     * - Supports internationalized domain names (IDN)
     * - Supports Unicode characters in local part
     * - Maximum 254 characters (enforced by RFC 5322)
     */
    email: z
      .string()
      .trim()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid")),

    /**
     * Honeypot field for spam prevention
     *
     * This field is hidden from legitimate users but visible to bots.
     * If filled, the submission is silently rejected as spam.
     *
     * Implementation notes:
     * - Hidden via CSS: `absolute left-[-9999px]`
     * - Not visible to users or screen readers
     * - Prevents keyboard navigation: `tabIndex={-1}`
     * - No autocomplete: `autoComplete="off"`
     *
     * @see research.md - Research Task 4: Honeypot Implementation
     */
    website: z.string().optional(),
  });

/**
 * TypeScript type inferred from newsletter schema
 *
 * Use this type for form data throughout the application.
 */
export type NewsletterInput = z.infer<
  ReturnType<typeof createNewsletterSchema>
>;
