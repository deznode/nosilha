import { describe, it, expect } from "vitest";
import { apiErrorMessage } from "@/lib/backend-api";

describe("apiErrorMessage", () => {
  const fallback = "Upload confirmation failed: 400";

  it("surfaces the field-level message from a validation 400", () => {
    // The shape GlobalExceptionHandler.handleValidationErrors returns: no top-level message.
    const body = {
      error: "Validation failed",
      details: [
        {
          field: "photographerCredit",
          message: "Photographer credit is required — a name, or 'not known'",
        },
      ],
    };

    expect(apiErrorMessage(body, fallback)).toBe(
      "Photographer credit is required — a name, or 'not known'"
    );
  });

  it("joins several field messages", () => {
    const body = {
      error: "Validation failed",
      details: [
        { field: "photographerCredit", message: "Credit is required" },
        { field: "fileSize", message: "File size exceeds 50MB limit" },
      ],
    };

    expect(apiErrorMessage(body, fallback)).toBe(
      "Credit is required. File size exceeds 50MB limit"
    );
  });

  it("uses a top-level message when there are no details", () => {
    expect(apiErrorMessage({ message: "Storage key expired" }, fallback)).toBe(
      "Storage key expired"
    );
  });

  it("falls back when the body carries nothing readable", () => {
    expect(apiErrorMessage(null, fallback)).toBe(fallback);
    expect(apiErrorMessage({ details: [] }, fallback)).toBe(fallback);
    expect(apiErrorMessage("not json", fallback)).toBe(fallback);
  });
});
