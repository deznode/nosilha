import { z } from "zod";

/**
 * Zod schema for directory entry submission.
 * Used with React Hook Form for form validation.
 */

export const directorySubmissionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  category: z.enum(["Restaurant", "Hotel", "Beach", "Heritage", "Nature", "Town", "Viewpoint", "Trail", "Church", "Port"], {
    message: "Please select a category",
  }),
  town: z.string().min(1, "Please select a town"),
  customTown: z.string().optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long"),
  tags: z.string().optional(), // Comma-separated, processed before submission
  latitude: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      },
      { message: "Latitude must be between -90 and 90" }
    ),
  longitude: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      },
      { message: "Longitude must be between -180 and 180" }
    ),
  imageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  priceLevel: z.enum(["$", "$$", "$$$"]).optional(),
});

// Export inferred type
export type DirectorySubmissionInput = z.infer<
  typeof directorySubmissionSchema
>;
