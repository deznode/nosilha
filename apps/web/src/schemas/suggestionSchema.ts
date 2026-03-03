import { z } from "zod";

/**
 * Zod schema for suggestion/improvement form submission.
 * Used with React Hook Form for form validation.
 */

export const suggestionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  suggestionType: z.enum(["CORRECTION", "ADDITION", "FEEDBACK"], {
    message: "Please select a suggestion type",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
  // Honeypot field - must be empty (bots fill this in)
  honeypot: z.string().max(0, "Invalid submission").optional(),
});

// Export inferred type
export type SuggestionInput = z.infer<typeof suggestionSchema>;
