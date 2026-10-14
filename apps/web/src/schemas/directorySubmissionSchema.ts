import { z } from "zod";

import type { Translator } from "@/i18n/types";

/**
 * Zod schema for directory entry submission.
 * Used with React Hook Form for form validation. A factory taking a
 * `validation` translator, so the messages follow the page's language.
 */
export function createDirectorySubmissionSchema(t: Translator<"validation">) {
  return z.object({
    name: z.string().min(2, t("nameMin")).max(255, t("nameTooLong")),
    category: z.enum(
      [
        "Restaurant",
        "Hotel",
        "Beach",
        "Heritage",
        "Nature",
        "Viewpoint",
        "Trail",
        "Church",
        "Port",
      ],
      {
        message: t("categoryRequired"),
      }
    ),
    town: z.string().min(1, t("townRequired")),
    customTown: z.string().optional(),
    description: z
      .string()
      .min(10, t("descriptionMin"))
      .max(5000, t("descriptionTooLong")),
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
        { message: t("latitudeRange") }
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
        { message: t("longitudeRange") }
      ),
    imageUrl: z.string().url(t("urlInvalid")).optional().or(z.literal("")),
    priceLevel: z.enum(["$", "$$", "$$$"]).optional(),
  });
}

// Export inferred type
export type DirectorySubmissionInput = z.infer<
  ReturnType<typeof createDirectorySubmissionSchema>
>;
