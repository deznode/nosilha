"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Link2,
  Trash2,
  ChevronDown,
  Loader2,
  CheckCircle,
  Unlink,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/catalyst-ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useR2Orphans,
  useLinkR2Orphan,
  useDeleteR2Orphan,
} from "@/hooks/queries/admin";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isImageKey(key: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(key);
}

/**
 * Orphans Tab — detect R2 objects with no corresponding DB record.
 * Supports scanning, linking orphans to new media records, and deleting.
 */
export function OrphansTab() {
  const [hasScanned, setHasScanned] = useState(false);
  const [continuationToken, setContinuationToken] = useState<
    string | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const toast = useToast();

  const orphansQuery = useR2Orphans({
    continuationToken,
    enabled: hasScanned,
  });

  const linkOrphan = useLinkR2Orphan();
  const deleteOrphan = useDeleteR2Orphan();

  const handleScan = () => {
    setHasScanned(true);
    setContinuationToken(undefined);
    orphansQuery.refetch();
  };

  const handleLoadMore = () => {
    if (orphansQuery.data?.continuationToken) {
      setContinuationToken(orphansQuery.data.continuationToken);
    }
  };

  const handleLink = (storageKey: string) => {
    linkOrphan.mutate(
      { storageKey },
      {
        onSuccess: () => {
          toast.success("Orphan linked to new media record").show();
        },
        onError: (err) => {
          toast
            .error(err instanceof Error ? err.message : "Failed to link orphan")
            .show();
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteOrphan.mutate(
      { storageKey: deleteTarget },
      {
        onSuccess: () => {
          toast.success("Orphan deleted from R2").show();
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast
            .error(
              err instanceof Error ? err.message : "Failed to delete orphan"
            )
            .show();
          setDeleteTarget(null);
        },
      }
    );
  };

  const data = orphansQuery.data;
  const isScanning = orphansQuery.isFetching;

  return (
    <div className="space-y-4">
      {/* Scan button */}
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">
          {hasScanned && data
            ? `${data.orphans.length} unlinked file${data.orphans.length !== 1 ? "s" : ""} found (${data.totalScanned} scanned) — these files have no matching database record`
            : "Scan the R2 bucket for objects without a database record."}
        </p>
        <Button color="blue" onClick={handleScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <Loader2 data-slot="icon" className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search data-slot="icon" />
              Scan for Orphans
            </>
          )}
        </Button>
      </div>

      {/* Scanning state */}
      {isScanning && !data && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-alt h-20 animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {hasScanned && !isScanning && data && data.orphans.length === 0 && (
        <div className="border-hairline flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <CheckCircle className="text-valley-green mb-2 h-8 w-8" />
          <p className="text-body text-sm font-medium">No orphans found</p>
          <p className="text-muted mt-1 text-xs">
            All R2 objects are linked to database records.
          </p>
        </div>
      )}

      {/* Error state */}
      {orphansQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-sm text-red-800 dark:text-red-300">
            Failed to scan for orphans.{" "}
            {orphansQuery.error instanceof Error
              ? orphansQuery.error.message
              : "Unknown error"}
          </p>
        </div>
      )}

      {/* Orphan list */}
      {data && data.orphans.length > 0 && (
        <>
          <div className="space-y-3">
            {data.orphans.map((orphan) => (
              <div
                key={orphan.key}
                className={clsx(
                  "border-hairline bg-surface flex items-start gap-4 rounded-lg border p-3",
                  "transition-colors"
                )}
              >
                {/* Thumbnail */}
                <div className="bg-surface-alt relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  {isImageKey(orphan.key) ? (
                    <Image
                      src={orphan.publicUrl}
                      alt={orphan.key}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted flex h-full items-center justify-center text-xs">
                      File
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-body truncate text-sm font-medium"
                    title={orphan.key}
                  >
                    {orphan.key}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted text-xs">
                      {formatBytes(orphan.size)} &middot;{" "}
                      {formatDate(orphan.lastModified)}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <Unlink size={10} /> Unlinked
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <Button
                    color="blue"
                    onClick={() => handleLink(orphan.key)}
                    disabled={linkOrphan.isPending}
                  >
                    <Link2 data-slot="icon" />
                    Link
                  </Button>
                  <Button
                    color="red"
                    onClick={() => setDeleteTarget(orphan.key)}
                    disabled={deleteOrphan.isPending}
                  >
                    <Trash2 data-slot="icon" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {data.isTruncated && (
            <div className="flex justify-center pt-2">
              <Button outline onClick={handleLoadMore} disabled={isScanning}>
                <ChevronDown data-slot="icon" />
                {isScanning ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete orphan from R2?"
        description={`This will permanently delete "${deleteTarget}" from R2 storage. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteOrphan.isPending}
      />
    </div>
  );
}
