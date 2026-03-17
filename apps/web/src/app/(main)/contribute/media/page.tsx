"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
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
import type { MediaType, ManualMetadata, MediaCategory } from "@/types/media";
import { GALLERY_CATEGORIES } from "@/types/media";
import type { ExternalPlatform } from "@/types/gallery";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { BackendApiClient } from "@/lib/backend-api";
import { useAuth } from "@/components/providers/auth-provider";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import { useToast } from "@/hooks/use-toast";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { ManualMetadataForm } from "@/components/gallery/manual-metadata-form";
import { detectCreditPlatform, type DetectedCredit } from "@/lib/credit-utils";
import { CreditPreviewBadge } from "@/components/ui/credit-display";

interface FormData {
  title: string;
  type: MediaType;
  category: MediaCategory | null;
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
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "IMAGE",
    category: null,
    description: "",
    url: "",
    author: "",
    preview: "",
  });
  // Manual metadata for historical photos without EXIF
  const [manualMetadata, setManualMetadata] = useState<ManualMetadata>({});
  const [showManualForm, setShowManualForm] = useState(false);
  const apiClient = useRef(new BackendApiClient());

  // Check if user needs to authenticate (all media submissions require auth)
  const requiresAuth = !authLoading && !user;

  // Use the photo upload hook with EXIF extraction
  const {
    state: uploadState,
    progress,
    error: uploadError,
    file: selectedFile,
    metadata,
    photoType,
    setPhotoType,
    selectFile,
    upload,
    reset: resetUpload,
  } = usePhotoUpload();

  // Reset form state when Activity restores this route (cacheComponents).
  // Activity destroys effects on hide and re-creates them on show,
  // so this runs on initial mount (harmless) AND every return visit.
  useEffect(() => {
    setSubmitted(false);
    setFormData({
      title: "",
      type: "IMAGE",
      category: null,
      description: "",
      url: "",
      author: "",
      preview: "",
    });
    setManualMetadata({});
    setShowManualForm(false);
    setVideoError(null);
    resetUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect social platform from credit input for instant preview
  const detectedCredit: DetectedCredit | null = useMemo(
    () => detectCreditPlatform(formData.author),
    [formData.author]
  );

  const isSubmitting =
    uploadState === "requesting-url" ||
    uploadState === "uploading" ||
    uploadState === "confirming" ||
    videoSubmitting;

  function getSubmitButtonLabel(): string {
    if (uploadState === "extracting") return "Reading photo metadata...";
    if (uploadState === "requesting-url") return "Preparing upload...";
    if (uploadState === "uploading") return `Uploading ${progress}%...`;
    if (uploadState === "confirming") return "Finalizing...";
    if (videoSubmitting) return "Submitting video...";
    if (requiresAuth) return "Sign in to Submit";
    return "Add to Visual Record";
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use the photo upload hook to select file and extract EXIF
      await selectFile(file);

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

    if (formData.type === "IMAGE" && selectedFile) {
      // Upload image to R2 storage with EXIF metadata and credit
      const result = await upload({
        category: formData.category ?? undefined,
        description: formData.description || formData.title,
        photographerCredit: formData.author || undefined,
      });

      if (result) {
        toast.success("Media uploaded successfully").show();
        setSubmitted(true);
      }
      // Error handling is done by the hook (uploadError state)
      if (!result) {
        toast.error("Upload failed. Please try again.").show();
      }
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
          category: formData.category ?? undefined,
        });
        toast.success("Video submitted successfully").show();
        setSubmitted(true);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to submit video";
        setVideoError(errorMsg);
        toast.error(errorMsg).show();
      } finally {
        setVideoSubmitting(false);
      }
    }
  };

  const clearFile = () => {
    setFormData({ ...formData, preview: "", url: "" });
    setManualMetadata({});
    setShowManualForm(false);
    resetUpload();
  };

  // Success confirmation screen
  if (submitted) {
    return (
      <div className="bg-canvas flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="bg-valley-green/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Check className="text-valley-green h-10 w-10" />
          </div>
          <h2 className="text-body mb-3 font-serif text-3xl font-bold">
            Archive Updated
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            Thank you for contributing to our visual history. Your item is
            pending verification by our team.
          </p>
          <Link
            href="/gallery"
            className="bg-ocean-blue hover:bg-ocean-blue-deep rounded-button shadow-lift block w-full py-4 font-bold text-white transition-colors"
          >
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen px-4 py-10 sm:py-20">
      <div className="mx-auto max-w-xl">
        <Link
          href="/gallery"
          className="text-muted hover:text-body mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase"
        >
          <ArrowLeft size={14} /> Back to Gallery
        </Link>

        <div className="rounded-container border-hairline bg-canvas shadow-floating overflow-hidden border">
          {/* Header */}
          <div className="bg-bougainvillea-pink px-10 py-6 text-white sm:py-10">
            <h1 className="font-serif text-2xl font-bold">Add to Archive</h1>
            <p className="mt-1 text-xs text-white/60">
              Expanding Brava&apos;s visual memory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-10">
            {/* Type Switcher */}
            <div className="rounded-card bg-surface flex p-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "IMAGE" })}
                className={clsx(
                  "rounded-card flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold transition-all",
                  formData.type === "IMAGE"
                    ? "bg-canvas text-ocean-blue shadow-subtle"
                    : "text-muted hover:text-body"
                )}
              >
                <ImageIcon size={14} /> Photograph
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "VIDEO" })}
                className={clsx(
                  "rounded-card flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold transition-all",
                  formData.type === "VIDEO"
                    ? "bg-canvas text-bougainvillea-pink shadow-subtle"
                    : "text-muted hover:text-body"
                )}
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
                <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                  Title of Item
                </label>
                <input
                  required
                  type="text"
                  className="border-hairline bg-surface text-body focus-visible:ring-ocean-blue rounded-card w-full border px-5 py-3 font-medium transition-all outline-none focus:ring-2 focus-visible:ring-offset-2"
                  placeholder="e.g., Festival of São João, 1984"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Image Upload or Video URL */}
              {formData.type === "IMAGE" ? (
                <>
                  <div>
                    <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                      Image File
                    </label>
                    <div
                      className={clsx(
                        "rounded-card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-all",
                        formData.preview
                          ? "border-valley-green bg-valley-green/5"
                          : "border-hairline hover:border-ocean-blue/50 hover:bg-surface"
                      )}
                      onClick={() =>
                        document.getElementById("media-upload")?.click()
                      }
                    >
                      {formData.preview ? (
                        <div className="relative">
                          <Image
                            src={formData.preview}
                            width={160}
                            height={160}
                            className="rounded-card shadow-elevated max-h-40 border-2 border-white object-contain"
                            alt="Preview"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
                            }}
                            className="bg-status-error shadow-elevated absolute -top-3 -right-3 rounded-full p-1.5 text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className="mx-auto opacity-20" />
                          <p className="text-muted mt-2 text-sm">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-muted/60 mt-1 text-xs">
                            Supports JPEG, PNG, HEIC
                          </p>
                        </>
                      )}
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* Metadata display and controls - shown after file selected */}
                  {selectedFile && metadata && (
                    <div className="space-y-4">
                      {/* Metadata badges showing extracted data */}
                      <MetadataBadges
                        metadata={metadata}
                        showManualPrompt={!metadata.hasExifData}
                      />

                      {/* Photo type selector for GPS privacy */}
                      <PhotoTypeSelector
                        value={photoType}
                        onChange={setPhotoType}
                        disabled={isSubmitting}
                      />

                      {/* Manual metadata form for photos without EXIF */}
                      {!metadata.hasExifData && (
                        <ManualMetadataForm
                          value={manualMetadata}
                          onChange={(updates) =>
                            setManualMetadata({ ...manualMetadata, ...updates })
                          }
                          expanded={showManualForm}
                          onExpandedChange={setShowManualForm}
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                    Embed Link
                  </label>
                  <div className="relative">
                    <input
                      required
                      className="border-hairline bg-surface text-body rounded-card w-full border py-3 pr-4 pl-10 transition-all outline-none"
                      placeholder="YouTube or Vimeo URL"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                    />
                    <LinkIcon
                      className="text-bougainvillea-pink absolute top-3 left-3.5 opacity-50"
                      size={16}
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                  Category
                </label>
                <select
                  required
                  value={formData.category ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: (e.target.value as MediaCategory) || null,
                    })
                  }
                  className={clsx(
                    "border-hairline bg-surface rounded-card w-full border px-5 py-3 text-sm font-medium transition-all outline-none focus:ring-2 focus-visible:ring-offset-2",
                    formData.category
                      ? "text-body focus-visible:ring-ocean-blue"
                      : "text-muted focus-visible:ring-ocean-blue"
                  )}
                >
                  <option value="" disabled>
                    Select a category...
                  </option>
                  {GALLERY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="border-hairline bg-surface text-body rounded-card w-full border px-5 py-3 leading-relaxed outline-none"
                  placeholder="Additional context or story..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Author/Credit */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                  Creator Credit
                </label>
                <input
                  type="text"
                  className="border-hairline bg-surface text-body rounded-card w-full border px-5 py-3 outline-none"
                  placeholder="Name, @handle, or profile URL"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
                {detectedCredit && (
                  <CreditPreviewBadge
                    detected={detectedCredit}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {/* Error Display */}
            {(uploadError || videoError) && (
              <div className="border-status-error/20 bg-status-error/10 text-status-error rounded-card flex items-center gap-3 border p-4 text-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{uploadError || videoError}</span>
              </div>
            )}

            {/* Upload Progress */}
            {uploadState === "uploading" && (
              <div className="space-y-2">
                <div className="text-muted flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="bg-surface-alt h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-ocean-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
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
                  !formData.category ||
                  !formData.url ||
                  uploadState === "extracting"
                }
                className="rounded-card bg-body shadow-elevated hover:bg-ocean-blue flex w-full items-center justify-center gap-3 py-4 font-bold text-white transition-all disabled:opacity-30"
              >
                {getSubmitButtonLabel()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
