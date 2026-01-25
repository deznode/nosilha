"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/catalyst-ui/dialog";
import { submitSuggestion } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

type SuggestionType = "CORRECTION" | "ADDITION" | "FEEDBACK";

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestionType, setSuggestionType] =
    useState<SuggestionType>("FEEDBACK");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-populate email for authenticated users
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Client-side validation
    if (!name || name.length < 2 || name.length > 255) {
      setSubmitError("Name must be between 2 and 255 characters");
      setIsSubmitting(false);
      return;
    }

    // Email validation - only for anonymous users
    if (!isAuthenticated && (!email || !email.includes("@"))) {
      setSubmitError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!message || message.length < 10 || message.length > 5000) {
      setSubmitError("Message must be between 10 and 5000 characters");
      setIsSubmitting(false);
      return;
    }

    // Honeypot check (client-side)
    if (honeypot) {
      // Silently fail for bots
      setSubmitSuccess(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // Use authenticated user's email if logged in, otherwise use form input
      const submissionEmail =
        isAuthenticated && user?.email ? user.email : email.trim();

      await submitSuggestion({
        contentId,
        pageTitle: contentTitle,
        pageUrl,
        contentType,
        name: name.trim(),
        email: submissionEmail.toLowerCase(),
        suggestionType,
        message: message.trim(),
        honeypot: honeypot || undefined,
      });

      setSubmitSuccess(true);
      setSubmitError(null);

      // Show success toast
      toast.success("Thank you! Your suggestion has been submitted.").show();

      // Reset form
      setName("");
      setEmail("");
      setSuggestionType("FEEDBACK");
      setMessage("");
      setHoneypot("");

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
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
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
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Thank you for helping preserve our cultural heritage!
                </p>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  Your suggestion has been received and will be reviewed by our
                  team. We appreciate your contribution to maintaining the
                  accuracy of Brava Island's cultural content.
                </p>
              </div>
            </div>
          </div>
        </DialogBody>
      ) : (
        <form onSubmit={handleSubmit}>
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
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-4">
              <Field>
                <Label>Your Name *</Label>
                <Input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={255}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                />
              </Field>

              {/* Only show email input for anonymous users */}
              {!isAuthenticated && (
                <Field>
                  <Label>Your Email *</Label>
                  <Input
                    type="email"
                    name="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    We may contact you for clarification on your suggestion.
                  </p>
                </Field>
              )}

              {/* Show email info for authenticated users */}
              {isAuthenticated && user?.email && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Submitting as: <strong>{user.email}</strong>
                </div>
              )}

              <Field>
                <Label>Suggestion Type *</Label>
                <select
                  name="suggestionType"
                  required
                  value={suggestionType}
                  onChange={(e) =>
                    setSuggestionType(e.target.value as SuggestionType)
                  }
                  disabled={isSubmitting}
                  className="focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-lg border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="CORRECTION">
                    Correction - Fix factual errors or inaccuracies
                  </option>
                  <option value="ADDITION">
                    Addition - Add missing information or context
                  </option>
                  <option value="FEEDBACK">
                    Feedback - General feedback on content quality
                  </option>
                </select>
              </Field>

              <Field>
                <Label>Your Suggestion *</Label>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your suggestion..."
                  disabled={isSubmitting}
                  className="focus:border-ocean-blue focus:ring-ocean-blue block w-full rounded-lg border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {message.length}/5000 characters (minimum 10)
                </p>
              </Field>

              {submitError && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {submitError}
                  </p>
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
