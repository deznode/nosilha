import { z } from "zod";

import type { Translator } from "@/i18n/types";

/**
 * Zod schema for suggestion/improvement form submission.
 * Used with React Hook Form for form validation. A factory taking a
 * `validation` translator, so the messages follow the page's language.
 */
export function createSuggestionSchema(t: Translator<"validation">) {
  return z.object({
    name: z.string().min(2, t("nameMin")).max(255, t("nameTooLong")),
    email: z.string().email(t("emailInvalid")).optional().or(z.literal("")),
    suggestionType: z.enum(["CORRECTION", "ADDITION", "FEEDBACK"], {
      message: t("suggestionType"),
    }),
    message: z.string().min(10, t("messageMin")).max(5000, t("messageTooLong")),
    // Honeypot field - must be empty (bots fill this in)
    honeypot: z.string().max(0, t("invalidSubmission")).optional(),
  });
}

// Export inferred type
export type SuggestionInput = z.infer<
  ReturnType<typeof createSuggestionSchema>
>;
