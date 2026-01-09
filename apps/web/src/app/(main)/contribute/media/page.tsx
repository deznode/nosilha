"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Play,
  Upload,
  X,
  Check,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import type { MediaType } from "@/types/media";
import type { ExternalPlatform } from "@/types/gallery";
import { useR2Upload } from "@/hooks/useR2Upload";
import { BackendApiClient } from "@/lib/backend-api";
import { useAuth } from "@/components/providers/auth-provider";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";

interface FormData {
  title: string;
  type: MediaType;
  description: string;
  url: string;
  author: string;
  preview: string;
}

/**
 * Parses a video URL to extract platform and video ID.
 * Supports YouTube (various formats) and Vimeo.
 */
function parseVideoUrl(
  url: string
): { platform: ExternalPlatform; externalId: string } | null {
  // YouTube patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: "YOUTUBE", externalId: match[1] };
    }
  }

  // Vimeo patterns: vimeo.com/ID
  const vimeoPattern = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return { platform: "VIMEO", externalId: vimeoMatch[1] };
  }

  return null;
}

export default function MediaContributionPage() {
  const { user, loading: authLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "IMAGE",
    description: "",
    url: "",
    author: "",
    preview: "",
  });
  // Store the actual file for R2 upload
  const selectedFileRef = useRef<File | null>(null);
  const apiClient = useRef(new BackendApiClient());

  // Check if user needs to authenticate (all media submissions require auth)
  const requiresAuth = !authLoading && !user;

  // Use the R2 upload hook for actual file uploads
  const {
    state: uploadState,
    progress,
    error: uploadError,
    upload,
    reset: resetUpload,
  } = useR2Upload();

  const isSubmitting =
    uploadState === "requesting-url" ||
    uploadState === "uploading" ||
    uploadState === "confirming" ||
    videoSubmitting;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file reference for later upload
      selectedFileRef.current = file;

      // Create preview for display
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData({
          ...formData,
          preview: reader.result as string,
          url: "local-upload",
        });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "IMAGE" && selectedFileRef.current) {
      // Upload image to R2 storage
      const result = await upload(selectedFileRef.current, {
        category: "gallery",
        description: formData.description || formData.title,
      });

      if (result) {
        setSubmitted(true);
      }
      // Error handling is done by the hook (uploadError state)
    } else if (formData.type === "VIDEO") {
      // Parse the URL to extract platform and video ID
      const parsed = parseVideoUrl(formData.url);
      if (!parsed) {
        setVideoError("Please enter a valid YouTube or Vimeo URL");
        return;
      }

      setVideoSubmitting(true);
      setVideoError(null);

      try {
        await apiClient.current.submitExternalMedia({
          title: formData.title,
          description: formData.description || undefined,
          mediaType: "VIDEO",
          platform: parsed.platform,
          url: formData.url,
          externalId: parsed.externalId,
          author: formData.author || undefined,
          category: "Community", // Default category for user submissions
        });
        setSubmitted(true);
      } catch (err) {
        setVideoError(
          err instanceof Error ? err.message : "Failed to submit video"
        );
      } finally {
        setVideoSubmitting(false);
      }
    }
  };

  const clearFile = () => {
    selectedFileRef.current = null;
    setFormData({ ...formData, preview: "", url: "" });
    resetUpload();
  };

  // Success confirmation screen
  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-6 dark:bg-slate-900">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-valley-green)]/10">
            <Check className="h-10 w-10 text-[var(--color-valley-green)]" />
          </div>
          <h2 className="mb-3 font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Archive Updated
          </h2>
          <p className="mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
            Thank you for contributing to our visual history. Your item is
            pending verification by our team.
          </p>
          <Link
            href="/gallery"
            className="block w-full rounded-2xl bg-[var(--color-ocean-blue)] py-4 font-bold text-white shadow-lg transition-colors hover:bg-[var(--color-ocean-blue-deep)]"
          >
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-slate-900">
      <div className="mx-auto max-w-xl">
        <Link
          href="/gallery"
          className="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to Gallery
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div className="bg-[var(--color-bougainvillea-pink)] px-10 py-10 text-white">
            <h1 className="font-serif text-2xl font-bold">Add to Archive</h1>
            <p className="mt-1 text-xs text-white/60">
              Expanding Brava&apos;s visual memory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-10">
            {/* Type Switcher */}
            <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-700">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "IMAGE" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                  formData.type === "IMAGE"
                    ? "bg-white text-[var(--color-ocean-blue)] shadow-sm dark:bg-slate-600"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <ImageIcon size={14} /> Photograph
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "VIDEO" })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                  formData.type === "VIDEO"
                    ? "bg-white text-[var(--color-bougainvillea-pink)] shadow-sm dark:bg-slate-600"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <Play size={14} /> Video / Podcast
              </button>
            </div>

            {/* Auth Prompt - shown when user is not authenticated */}
            {requiresAuth && (
              <InlineAuthPrompt
                title={
                  formData.type === "IMAGE"
                    ? "Sign in to Share Photos"
                    : "Sign in to Share Videos"
                }
                description="Media submissions require an account to ensure proper attribution and moderation."
                returnUrl="/contribute/media"
              />
            )}

            {/* Core Fields */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Title of Item
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-900 transition-all outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g., Festival of São João, 1984"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Image Upload or Video URL */}
              {formData.type === "IMAGE" ? (
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Image File
                  </label>
                  <div
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                      formData.preview
                        ? "border-[var(--color-valley-green)] bg-[var(--color-valley-green)]/5"
                        : "border-slate-200 hover:border-[var(--color-ocean-blue)]/50 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                    }`}
                    onClick={() =>
                      document.getElementById("media-upload")?.click()
                    }
                  >
                    {formData.preview ? (
                      <div className="relative">
                        <img
                          src={formData.preview}
                          className="max-h-40 rounded-xl border-2 border-white shadow-lg"
                          alt="Preview"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile();
                          }}
                          className="absolute -top-3 -right-3 rounded-full bg-red-500 p-1.5 text-white shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto opacity-20" />
                        <p className="mt-2 text-sm text-slate-400">
                          Click to upload or drag and drop
                        </p>
                      </>
                    )}
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Embed Link
                  </label>
                  <div className="relative">
                    <input
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 transition-all outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="YouTube or Vimeo URL"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                    />
                    <LinkIcon
                      className="absolute top-3 left-3.5 text-[var(--color-bougainvillea-pink)] opacity-50"
                      size={16}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 leading-relaxed text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Additional context or story..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Author/Credit */}
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Archive Credit
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Name of owner or photographer"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Error Display */}
            {(uploadError || videoError) && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{uploadError || videoError}</span>
              </div>
            )}

            {/* Upload Progress */}
            {uploadState === "uploading" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Uploading...</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-[var(--color-ocean-blue)] transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  requiresAuth ||
                  !formData.title ||
                  !formData.url
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-[var(--color-ocean-blue)] disabled:opacity-30 dark:bg-slate-700 dark:hover:bg-[var(--color-ocean-blue)]"
              >
                {uploadState === "requesting-url" && "Preparing upload..."}
                {uploadState === "uploading" &&
                  `Uploading ${progress.percentage}%...`}
                {uploadState === "confirming" && "Finalizing..."}
                {videoSubmitting && "Submitting video..."}
                {requiresAuth && "Sign in to Submit"}
                {!isSubmitting && !requiresAuth && "Add to Visual Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
