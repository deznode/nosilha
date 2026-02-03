import { z } from "zod";

/**
 * Zod schema for story submission.
 * Used with React Hook Form for form validation.
 */

export const storySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title is too long"),
  content: z.string().min(50, "Story must be at least 50 characters"),
  author: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name is too long")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(200, "Location is too long")
    .optional()
    .or(z.literal("")),
});

// Export inferred type
export type StoryInput = z.infer<typeof storySchema>;
