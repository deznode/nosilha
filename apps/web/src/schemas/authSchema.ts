import { z } from "zod";

import type { Translator } from "@/i18n/types";

/**
 * Zod schemas for authentication and user validation.
 * Used with React Hook Form for form validation and API response validation.
 *
 * Each is a factory taking a `validation` translator, so the messages follow
 * the page's language.
 */

function emailField(t: Translator<"validation">) {
  return z.string().min(1, t("emailRequired")).email(t("emailInvalid"));
}

function strongPassword(t: Translator<"validation">) {
  return z
    .string()
    .min(8, t("passwordMin8"))
    .max(100, t("passwordTooLong"))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t("passwordStrength"));
}

// Login form validation schema
export function createLoginSchema(t: Translator<"validation">) {
  return z.object({
    email: emailField(t),
    password: z
      .string()
      .min(6, t("passwordMin6"))
      .max(100, t("passwordTooLong")),
  });
}

// Signup form validation schema
export function createSignupSchema(t: Translator<"validation">) {
  return z
    .object({
      email: emailField(t),
      password: strongPassword(t),
      confirmPassword: z.string().min(1, t("confirmPassword")),
      displayName: z
        .string()
        .min(2, t("displayNameMin"))
        .max(50, t("displayNameTooLong"))
        .optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

// Password reset request schema
export function createPasswordResetRequestSchema(t: Translator<"validation">) {
  return z.object({ email: emailField(t) });
}

// Password reset confirmation schema
export function createPasswordResetSchema(t: Translator<"validation">) {
  return z
    .object({
      password: strongPassword(t),
      confirmPassword: z.string().min(1, t("confirmPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

// Export inferred types
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupInput = z.infer<ReturnType<typeof createSignupSchema>>;
export type PasswordResetRequestInput = z.infer<
  ReturnType<typeof createPasswordResetRequestSchema>
>;
export type PasswordResetInput = z.infer<
  ReturnType<typeof createPasswordResetSchema>
>;
