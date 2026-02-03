import { z } from "zod";

/**
 * Zod schema for contact form submission.
 * Used with React Hook Form for form validation.
 */

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  subject: z.enum(["general", "content", "technical", "partnership"], {
    message: "Please select a subject",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

// Export inferred type
export type ContactInput = z.infer<typeof contactSchema>;
