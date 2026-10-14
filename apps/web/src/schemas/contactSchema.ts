import { z } from "zod";
import type { Translator } from "@/i18n/types";

/**
 * Zod schema for contact form submission.
 * Used with React Hook Form for form validation. Validation messages come from
 * the `contact.validation` messages, so the schema is built per translator.
 */
export function createContactSchema(t: Translator<"contact">) {
  return z.object({
    name: z
      .string()
      .min(2, t("validation.nameMin"))
      .max(255, t("validation.nameMax")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    subject: z.enum(["general", "content", "technical", "partnership"], {
      message: t("validation.subjectRequired"),
    }),
    message: z
      .string()
      .min(10, t("validation.messageMin"))
      .max(5000, t("validation.messageMax")),
    agreedToPrivacy: z.boolean().refine((val) => val === true, {
      message: t("validation.privacyRequired"),
    }),
  });
}

// Export inferred type
export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>;
