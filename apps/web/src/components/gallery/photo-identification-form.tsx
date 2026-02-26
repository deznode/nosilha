"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { submitSuggestion } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

const photoIdentificationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  suggestedTitle: z
    .string()
    .max(255, "Title is too long")
    .optional()
    .or(z.literal("")),
  suggestedLocation: z
    .string()
    .max(255, "Location is too long")
    .optional()
    .or(z.literal("")),
  approximateDate: z
    .string()
    .max(100, "Date is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(5000, "Notes are too long"),
  honeypot: z.string().max(0, "Invalid submission").optional(),
});

type PhotoIdentificationInput = z.infer<typeof photoIdentificationSchema>;

interface PhotoIdentificationFormProps {
  mediaId: string;
  photoTitle: string;
  pageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoIdentificationForm({
  mediaId,
  photoTitle,
  pageUrl,
  isOpen,
  onClose,
}: PhotoIdentificationFormProps) {
  const { user, session } = useAuth();
  const isAuthenticated = !!session;
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PhotoIdentificationInput>({
    resolver: zodResolver(photoIdentificationSchema),
    defaultValues: {
      name: "",
      email: isAuthenticated && user?.email ? user.email : "",
      suggestedTitle: "",
      suggestedLocation: "",
      approximateDate: "",
      notes: "",
      honeypot: "",
    },
  });

  const notesValue = useWatch({ control, name: "notes" });

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue("email", user.email);
    }
  }, [isAuthenticated, user?.email, setValue]);

  const onSubmit = async (data: PhotoIdentificationInput) => {
    setIsSubmitting(true);

    if (data.honeypot) {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionEmail =
        isAuthenticated && user?.email
          ? user.email
          : (data.email || "").trim();

      // Build message from structured fields
      const messageParts: string[] = [];
      if (data.suggestedTitle) {
        messageParts.push(`Suggested title: ${data.suggestedTitle}`);
      }
      if (data.suggestedLocation) {
        messageParts.push(`Suggested location: ${data.suggestedLocation}`);
      }
      if (data.approximateDate) {
        messageParts.push(`Approximate date: ${data.approximateDate}`);
      }
      messageParts.push(data.notes.trim());
      const message = messageParts.join("\n\n");

      await submitSuggestion({
        contentId: mediaId,
        pageTitle: photoTitle,
        pageUrl,
        contentType: "gallery_media",
        name: data.name.trim(),
        email: submissionEmail.toLowerCase(),
        suggestionType: "PHOTO_IDENTIFICATION",
        message,
        mediaId,
        honeypot: data.honeypot || undefined,
      });

      setSubmitSuccess(true);
      toast.success("Thank you! Your identification has been submitted.").show();
      reset();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again later.";
      toast.error(errorMsg).show();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitSuccess) setSubmitSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Help Identify This Photo</DialogTitle>
      <DialogDescription>
        Know something about this photo? Help us identify the location, date, or
        subject. Any details you can share will help preserve this piece of
        Brava&apos;s history.
      </DialogDescription>

      {submitSuccess ? (
        <>
          <DialogBody>
            <div className="bg-valley-green/10 rounded-md p-4">
              <p className="text-valley-green text-sm font-medium">
                Thank you for helping identify this photo!
              </p>
              <p className="text-valley-green/90 mt-2 text-sm">
                Your contribution will be reviewed by our team and used to
                enrich the archive.
              </p>
            </div>
          </DialogBody>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            {/* Honeypot */}
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
                  {errors.email && (
                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                  )}
                </Field>
              )}

              {isAuthenticated && user?.email && (
                <div className="text-muted text-sm">
                  Submitting as: <strong>{user.email}</strong>
                </div>
              )}

              <Field>
                <Label>Suggested Title</Label>
                <Input
                  {...register("suggestedTitle")}
                  type="text"
                  placeholder="What do you think this photo shows?"
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <Label>Suggested Location</Label>
                <Input
                  {...register("suggestedLocation")}
                  type="text"
                  placeholder="Where was this taken? (e.g., Nova Sintra, Fajã d'Água)"
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <Label>Approximate Date</Label>
                <Input
                  {...register("approximateDate")}
                  type="text"
                  placeholder="When was this taken? (e.g., 1960s, Summer 1985)"
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <Label>Notes *</Label>
                <Textarea
                  {...register("notes")}
                  rows={4}
                  placeholder="Share what you know about this photo..."
                  disabled={isSubmitting}
                  data-invalid={errors.notes ? "" : undefined}
                />
                <p className="text-muted mt-1 text-sm">
                  {(notesValue || "").length}/5000 characters (minimum 10)
                </p>
                {errors.notes && (
                  <ErrorMessage>{errors.notes.message}</ErrorMessage>
                )}
              </Field>
            </div>
          </DialogBody>

          <DialogActions>
            <Button plain onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Identification"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
