import { z } from "zod";

import type { Translator } from "@/i18n/types";

/**
 * The Zod schema for the email-and-password form, which signs in and signs up.
 * Used with React Hook Form for form validation.
 *
 * A factory taking a `validation` translator, so the messages follow the page's
 * language.
 */
export function createLoginSchema(t: Translator<"validation">) {
  return z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z
      .string()
      .min(6, t("passwordMin6"))
      .max(100, t("passwordTooLong")),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
