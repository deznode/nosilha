"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/catalyst-ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitSuggestion } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  suggestionSchema,
  type SuggestionInput,
} from "@/schemas/suggestionSchema";

type SuggestionType = "CORRECTION" | "ADDITION" | "FEEDBACK";

const suggestionTypeOptions = [
  {
    value: "CORRECTION",
    label: "Correction - Fix factual errors or inaccuracies",
  },
  { value: "ADDITION", label: "Addition - Add missing information or context" },
  {
    value: "FEEDBACK",
    label: "Feedback - General feedback on content quality",
  },
];

interface SuggestImprovementFormProps {
  contentId: string;
  contentTitle: string;
  contentType: string;
  pageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestImprovementForm({
  contentId,
  contentTitle,
  contentType,
  pageUrl,
  isOpen,
  onClose,
}: SuggestImprovementFormProps) {
  const { user, session } = useAuth();
  const isAuthenticated = !!session;
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SuggestionInput>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      name: "",
      email: "",
      suggestionType: "FEEDBACK",
      message: "",
      honeypot: "",
    },
  });

  const messageValue = watch("message");

  // Auto-populate email for authenticated users
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue("email", user.email);
    }
  }, [isAuthenticated, user?.email, setValue]);

  const onSubmit = async (data: SuggestionInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Honeypot check (client-side)
    if (data.honeypot) {
      // Silently fail for bots
      setSubmitSuccess(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // Use authenticated user's email if logged in, otherwise use form input
      const submissionEmail =
        isAuthenticated && user?.email ? user.email : (data.email || "").trim();

      await submitSuggestion({
        contentId,
        pageTitle: contentTitle,
        pageUrl,
        contentType,
        name: data.name.trim(),
        email: submissionEmail.toLowerCase(),
        suggestionType: data.suggestionType,
        message: data.message.trim(),
        honeypot: data.honeypot || undefined,
      });

      setSubmitSuccess(true);
      setSubmitError(null);

      // Show success toast
      toast.success("Thank you! Your suggestion has been submitted.").show();

      // Reset form
      reset();

      // Close dialog after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred while submitting your suggestion. Please try again later.";
      setSubmitError(errorMsg);

      // Show error toast
      toast.error(errorMsg).show();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitSuccess) {
      // Reset success state when closing
      setSubmitSuccess(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Suggest Improvement</DialogTitle>
      <DialogDescription>
        Help us improve this content about <strong>{contentTitle}</strong>. Your
        suggestions help preserve the accuracy and richness of Brava Island's
        cultural heritage.
      </DialogDescription>

      {submitSuccess ? (
        <DialogBody>
          <div className="bg-valley-green/10 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="text-valley-green h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-valley-green text-sm font-medium">
                  Thank you for helping preserve our cultural heritage!
                </p>
                <p className="text-valley-green/90 mt-2 text-sm">
                  Your suggestion has been received and will be reviewed by our
                  team. We appreciate your contribution to maintaining the
                  accuracy of Brava Island's cultural content.
                </p>
              </div>
            </div>
          </div>
        </DialogBody>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            {/* Hidden fields for context */}
            <input type="hidden" name="contentId" value={contentId} />
            <input type="hidden" name="contentType" value={contentType} />
            <input type="hidden" name="pageTitle" value={contentTitle} />
            <input type="hidden" name="pageUrl" value={pageUrl} />

            {/* Honeypot field (hidden from real users, visible to bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                {...register("honeypot")}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-4">
              <Field>
                <Label>Your Name *</Label>
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                  data-invalid={errors.name ? "" : undefined}
                />
                {errors.name && (
                  <ErrorMessage>{errors.name.message}</ErrorMessage>
                )}
              </Field>

              {/* Only show email input for anonymous users */}
              {!isAuthenticated && (
                <Field>
                  <Label>Your Email *</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                    data-invalid={errors.email ? "" : undefined}
                  />
                  <p className="text-muted mt-1 text-sm">
                    We may contact you for clarification on your suggestion.
                  </p>
                  {errors.email && (
                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                  )}
                </Field>
              )}

              {/* Show email info for authenticated users */}
              {isAuthenticated && user?.email && (
                <div className="text-muted text-sm">
                  Submitting as: <strong>{user.email}</strong>
                </div>
              )}

              <Field>
                <Label>Suggestion Type *</Label>
                <Controller
                  name="suggestionType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={suggestionTypeOptions}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(value as SuggestionType)
                      }
                      disabled={isSubmitting}
                      invalid={!!errors.suggestionType}
                      placeholder="Select suggestion type"
                    />
                  )}
                />
                {errors.suggestionType && (
                  <ErrorMessage>{errors.suggestionType.message}</ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>Your Suggestion *</Label>
                <Textarea
                  {...register("message")}
                  rows={6}
                  placeholder="Please provide details about your suggestion..."
                  disabled={isSubmitting}
                  data-invalid={errors.message ? "" : undefined}
                />
                <p className="text-muted mt-1 text-sm">
                  {(messageValue || "").length}/5000 characters (minimum 10)
                </p>
                {errors.message && (
                  <ErrorMessage>{errors.message.message}</ErrorMessage>
                )}
              </Field>

              {submitError && (
                <div className="bg-status-error/10 rounded-md p-4">
                  <p className="text-status-error text-sm">{submitError}</p>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogActions>
            <Button plain onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </DialogActions>
        </form>
      )}

      {submitSuccess && (
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
