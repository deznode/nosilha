"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import { ImageIcon, Loader2, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/catalyst-ui/button";
import { useR2Upload, UploadProgress } from "@/hooks/useR2Upload";
import clsx from "clsx";

interface ImageUploaderProps {
  /** Called when upload completes successfully with the public URL */
  onUploadComplete?: (url: string) => void;
  /** Called when a file is selected (before upload starts) */
  onFileSelect?: (file: File | null) => void;
  /** Optional entry ID to associate the uploaded media with */
  entryId?: string;
  /** Optional category for the uploaded media */
  category?: string;
  /** Optional description for the uploaded media */
  description?: string;
  /** Whether to auto-upload on file selection (default: true) */
  autoUpload?: boolean;
}

/**
 * Progress bar component for upload progress visualization
 */
function UploadProgressBar({ progress }: { progress: UploadProgress }) {
  return (
    <div className="w-full px-4">
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>Uploading...</span>
        <span>{progress.percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[var(--color-ocean-blue)] transition-all duration-300 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-slate-500">
        {(progress.loaded / 1024 / 1024).toFixed(1)} MB /{" "}
        {(progress.total / 1024 / 1024).toFixed(1)} MB
      </p>
    </div>
  );
}

export function ImageUploader({
  onUploadComplete,
  onFileSelect,
  entryId,
  category,
  description,
  autoUpload = true,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { state, progress, error, upload, cancel, reset } = useR2Upload();

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) {
        onFileSelect?.(null);
        return;
      }

      // Check if it's an image file
      if (!file.type.startsWith("image/") && file.type !== "video/mp4") {
        onFileSelect?.(null);
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      onFileSelect?.(file);

      // Auto-upload if enabled
      if (autoUpload) {
        const result = await upload(file, {
          entryId,
          category,
          description,
        });

        if (result) {
          onUploadComplete?.(result.publicUrl);
        }
      }
    },
    [
      onFileSelect,
      autoUpload,
      upload,
      entryId,
      category,
      description,
      onUploadComplete,
    ]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleRemoveImage = () => {
    cancel();
    reset();
    setPreviewUrl(null);
    setSelectedFile(null);
    onFileSelect?.(null);
  };

  const handleRetry = async () => {
    if (selectedFile) {
      reset();
      const result = await upload(selectedFile, {
        entryId,
        category,
        description,
      });
      if (result) {
        onUploadComplete?.(result.publicUrl);
      }
    }
  };

  // Render upload state
  const renderUploadState = () => {
    switch (state) {
      case "requesting-url":
        return (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-ocean-blue)]" />
            <span className="text-sm text-slate-600">Preparing upload...</span>
          </div>
        );

      case "uploading":
        return (
          <div className="py-4">
            <UploadProgressBar progress={progress} />
            <div className="mt-2 text-center">
              <Button type="button" plain onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        );

      case "confirming":
        return (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-ocean-blue)]" />
            <span className="text-sm text-slate-600">Finalizing upload...</span>
          </div>
        );

      case "error":
        return (
          <div className="py-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
            <div className="flex justify-center gap-2">
              <Button type="button" plain onClick={handleRetry}>
                Retry
              </Button>
              <Button type="button" plain onClick={handleRemoveImage}>
                Remove
              </Button>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="border-t border-slate-200 p-2 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-green-600">
              <span className="text-sm font-medium">Upload complete!</span>
            </div>
            <Button type="button" plain onClick={handleRemoveImage}>
              Remove / Change File
            </Button>
          </div>
        );

      default:
        return (
          <div className="border-t border-slate-200 p-2 text-center">
            <Button type="button" plain onClick={handleRemoveImage}>
              Remove / Change File
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        // Image Preview State with Upload Progress
        <div className="border-border-primary relative rounded-lg border">
          <div className="relative aspect-video">
            <Image
              src={previewUrl}
              alt="Selected image preview"
              fill
              className="rounded-lg object-contain"
            />
            {/* Overlay during upload states */}
            {(state === "requesting-url" ||
              state === "uploading" ||
              state === "confirming") && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                {state === "uploading" ? (
                  <UploadProgressBar progress={progress} />
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--color-ocean-blue)]" />
                    <span className="text-slate-600">
                      {state === "requesting-url"
                        ? "Preparing..."
                        : "Finalizing..."}
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Cancel button during upload */}
            {state === "uploading" && (
              <button
                type="button"
                onClick={cancel}
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1 shadow-sm transition-colors hover:bg-white"
                aria-label="Cancel upload"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            )}
          </div>
          {renderUploadState()}
        </div>
      ) : (
        // Drag and Drop State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            "flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors duration-200",
            activeDrag
              ? "border-[var(--color-ocean-blue)] bg-[var(--color-ocean-blue)]/10"
              : "border-border-primary"
          )}
        >
          <div className="text-center">
            <ImageIcon
              aria-hidden="true"
              className="text-text-tertiary mx-auto h-12 w-12"
            />
            <div className="text-text-secondary mt-4 flex text-sm leading-6">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-[var(--color-ocean-blue)] focus-within:ring-2 focus-within:ring-[var(--color-ocean-blue)] focus-within:ring-offset-2 focus-within:outline-none hover:text-[var(--color-ocean-blue)]/80"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-text-secondary text-xs leading-5">
              JPEG, PNG, WebP, GIF or MP4 up to 50MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
