"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/catalyst-ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBulkPresignR2, useBulkConfirmR2 } from "@/hooks/queries/admin";
import type {
  BulkPresignFileRequest,
  BulkConfirmUploadDto,
} from "@/types/r2-admin";

const ALLOWED_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "video/mp4": [".mp4"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 20;
const MAX_CONCURRENT = 3;

type FileStatus = "pending" | "uploading" | "completed" | "error";

interface FileQueueItem {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  key?: string;
  uploadUrl?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const statusConfig: Record<
  FileStatus,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  pending: { icon: Upload, color: "text-muted", label: "Pending" },
  uploading: { icon: Loader2, color: "text-ocean-blue", label: "Uploading" },
  completed: { icon: CheckCircle, color: "text-valley-green", label: "Done" },
  error: { icon: AlertCircle, color: "text-status-error", label: "Failed" },
};

/**
 * Bulk Upload Tab — drag-and-drop multi-file upload with per-file
 * progress bars, max 3 concurrent XHR uploads, and shared metadata inputs.
 *
 * Flow: batch presign → per-file XHR PUT → batch confirm
 */
export function BulkUploadTab() {
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const abortControllersRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  const toast = useToast();
  const bulkPresign = useBulkPresignR2();
  const bulkConfirm = useBulkConfirmR2();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isUploading) return;

      const totalAfterAdd = queue.length + acceptedFiles.length;
      if (totalAfterAdd > MAX_FILES) {
        toast
          .error(
            `Maximum ${MAX_FILES} files per batch. You have ${queue.length}, tried to add ${acceptedFiles.length}.`
          )
          .show();
        return;
      }

      const newItems: FileQueueItem[] = acceptedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        status: "pending" as const,
        progress: 0,
      }));

      setQueue((prev) => [...prev, ...newItems]);
    },
    [isUploading, queue.length, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
    onDropRejected: (rejections) => {
      const messages = rejections.map((r) => {
        const errors = r.errors.map((e) => e.message).join(", ");
        return `${r.file.name}: ${errors}`;
      });
      toast.error(messages.join("; ")).show();
    },
  });

  const removeFile = useCallback(
    (id: string) => {
      if (isUploading) return;
      setQueue((prev) => prev.filter((item) => item.id !== id));
    },
    [isUploading]
  );

  const clearAll = useCallback(() => {
    if (isUploading) return;
    setQueue([]);
  }, [isUploading]);

  const updateItem = useCallback(
    (id: string, updates: Partial<FileQueueItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  /**
   * Upload a single file via XHR PUT to its presigned URL.
   */
  const uploadFileXhr = useCallback(
    (item: FileQueueItem): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!item.uploadUrl) {
          reject(new Error("No upload URL"));
          return;
        }

        const xhr = new XMLHttpRequest();
        abortControllersRef.current.set(item.id, xhr);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            updateItem(item.id, { progress: pct });
          }
        };

        xhr.onload = () => {
          abortControllersRef.current.delete(item.id);
          if (xhr.status >= 200 && xhr.status < 300) {
            updateItem(item.id, { status: "completed", progress: 100 });
            resolve();
          } else {
            updateItem(item.id, {
              status: "error",
              error: `HTTP ${xhr.status}`,
            });
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          abortControllersRef.current.delete(item.id);
          updateItem(item.id, { status: "error", error: "Network error" });
          reject(new Error("Network error"));
        };

        xhr.onabort = () => {
          abortControllersRef.current.delete(item.id);
          updateItem(item.id, { status: "error", error: "Cancelled" });
          reject(new Error("Cancelled"));
        };

        updateItem(item.id, { status: "uploading", progress: 0 });
        xhr.open("PUT", item.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", item.file.type);
        xhr.send(item.file);
      });
    },
    [updateItem]
  );

  /**
   * Orchestrate: presign → upload (max 3 concurrent) → confirm.
   */
  const handleUpload = useCallback(async () => {
    const pending = queue.filter((item) => item.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);

    try {
      // Step 1: Batch presign
      const files: BulkPresignFileRequest[] = pending.map((item) => ({
        fileName: item.file.name,
        contentType: item.file.type,
        fileSize: item.file.size,
      }));

      const presignResult = await bulkPresign.mutateAsync({ files });

      // Map presign results back to queue items
      const itemsWithUrls: FileQueueItem[] = [];
      for (const presign of presignResult.presigns) {
        const match = pending.find(
          (item) => item.file.name === presign.fileName
        );
        if (match) {
          const updated = {
            ...match,
            uploadUrl: presign.uploadUrl,
            key: presign.key,
          };
          updateItem(match.id, {
            uploadUrl: presign.uploadUrl,
            key: presign.key,
          });
          itemsWithUrls.push(updated);
        }
      }

      // Step 2: Upload with concurrency limit
      const succeeded: FileQueueItem[] = [];
      const uploadQueue = [...itemsWithUrls];

      const runNext = async (): Promise<void> => {
        const item = uploadQueue.shift();
        if (!item) return;

        try {
          await uploadFileXhr(item);
          succeeded.push(item);
        } catch {
          // error already recorded in updateItem via XHR handler
        }

        await runNext();
      };

      const workers = Array.from(
        { length: Math.min(MAX_CONCURRENT, uploadQueue.length) },
        () => runNext()
      );
      await Promise.all(workers);

      // Step 3: Batch confirm — only successfully uploaded files
      const confirmedUploads: BulkConfirmUploadDto[] = succeeded
        .filter((item) => item.key)
        .map((item) => ({
          key: item.key!,
          originalName: item.file.name,
          contentType: item.file.type,
          fileSize: item.file.size,
          category: category || undefined,
          description: description || undefined,
        }));

      const errorCount = itemsWithUrls.length - succeeded.length;

      if (confirmedUploads.length > 0) {
        const confirmResult = await bulkConfirm.mutateAsync({
          uploads: confirmedUploads,
        });

        if (confirmResult.errors.length > 0) {
          toast
            .warning(
              `${confirmResult.accepted} confirmed, ${confirmResult.rejected} failed`
            )
            .show();
        } else {
          toast
            .success(`${confirmResult.accepted} files uploaded successfully`)
            .show();
        }
      }

      if (errorCount > 0 && succeeded.length === 0) {
        toast.error("All uploads failed").show();
      } else if (errorCount > 0) {
        toast
          .warning(`${succeeded.length} succeeded, ${errorCount} failed`)
          .show();
      }
    } catch (err) {
      toast
        .error(
          err instanceof Error ? err.message : "Upload failed unexpectedly"
        )
        .show();
    } finally {
      setIsUploading(false);
    }
  }, [
    queue,
    category,
    description,
    bulkPresign,
    bulkConfirm,
    uploadFileXhr,
    updateItem,
    toast,
  ]);

  const pendingCount = queue.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Drag-and-drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          "border-hairline cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive
            ? "border-ocean-blue bg-ocean-blue/5"
            : "hover:border-ocean-blue/40 hover:bg-surface-alt",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="text-muted mx-auto mb-3 h-8 w-8" />
        {isDragActive ? (
          <p className="text-ocean-blue text-sm font-medium">
            Drop files here...
          </p>
        ) : (
          <>
            <p className="text-body text-sm font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-muted mt-1 text-xs">
              JPEG, PNG, WebP, GIF, MP4 — max 50MB each, up to {MAX_FILES} files
            </p>
          </>
        )}
      </div>

      {/* Shared metadata */}
      {queue.length > 0 && (
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isUploading}
            className="border-hairline bg-canvas text-body placeholder:text-muted focus:ring-ocean-blue rounded-button flex-1 border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            className="border-hairline bg-canvas text-body placeholder:text-muted focus:ring-ocean-blue rounded-button flex-1 border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {/* File Queue */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-muted text-xs">
              {queue.length} {queue.length === 1 ? "file" : "files"} queued
            </p>
            <button
              type="button"
              onClick={clearAll}
              disabled={isUploading}
              className="text-muted hover:text-status-error text-xs transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="divide-hairline border-hairline divide-y rounded-lg border">
            {queue.map((item) => {
              const config = statusConfig[item.status];
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4 shrink-0",
                      config.color,
                      item.status === "uploading" && "animate-spin"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-body truncate text-sm"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </p>
                      <span className="text-muted ml-2 shrink-0 text-xs">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {item.status === "uploading" && (
                      <div className="bg-surface-alt mt-1 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-ocean-blue h-full rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {item.status === "error" && item.error && (
                      <p className="text-status-error mt-0.5 text-xs">
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  {!isUploading && item.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="text-muted hover:text-status-error shrink-0 transition-colors"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {queue.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button outline onClick={clearAll} disabled={isUploading}>
            <Trash2 data-slot="icon" />
            Clear
          </Button>
          <Button
            color="blue"
            onClick={handleUpload}
            disabled={isUploading || pendingCount === 0}
          >
            {isUploading ? (
              <>
                <Loader2 data-slot="icon" className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload data-slot="icon" />
                Upload {pendingCount} {pendingCount === 1 ? "File" : "Files"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
