"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  Play,
  Youtube,
  X,
} from "lucide-react";
import {
  useYouTubeSyncConfig,
  useUpdateYouTubeSyncConfig,
  useTriggerYouTubeSync,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import type { YouTubeSyncResult } from "@/types/youtube";

export function YouTubeSyncPanel() {
  const { data: config, isLoading, error } = useYouTubeSyncConfig();

  if (isLoading) {
    return <PanelSkeleton />;
  }

  if (error || !config) {
    return (
      <div className="bg-surface rounded-card border-hairline flex flex-col items-center justify-center border p-12">
        <AlertTriangle className="text-status-error mb-3 h-8 w-8" />
        <p className="text-body font-medium">
          Failed to load YouTube sync configuration
        </p>
        <p className="text-muted mt-1 text-sm">
          {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!config.apiKeyConfigured) {
    return (
      <div className="bg-surface rounded-card border-hairline border p-6">
        <div className="flex items-center gap-3">
          <Youtube className="text-muted h-6 w-6" />
          <div>
            <p className="text-body font-medium">YouTube Sync Not Available</p>
            <p className="text-muted mt-1 text-sm">
              The YouTube API key is not configured on the server. Set the{" "}
              <code className="bg-surface-alt rounded px-1 py-0.5 text-xs">
                youtube.sync.api-key
              </code>{" "}
              environment variable to enable this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <SyncCard config={config} />;
}

interface SyncCardProps {
  config: {
    enabled: boolean;
    defaultCategory: string | null;
    apiKeyConfigured: boolean;
    updatedAt: string | null;
    videoCount: number;
  };
}

function SyncCard({ config }: SyncCardProps) {
  const toast = useToast();
  const updateConfig = useUpdateYouTubeSyncConfig();
  const triggerSync = useTriggerYouTubeSync();

  const [defaultCategory, setDefaultCategory] = useState(
    config.defaultCategory ?? ""
  );
  const [playlistId, setPlaylistId] = useState("");
  const [categoryOverride, setCategoryOverride] = useState("");
  const [syncResult, setSyncResult] = useState<YouTubeSyncResult | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const handleToggle = () => {
    const newEnabled = !config.enabled;
    updateConfig.mutate(
      { enabled: newEnabled, defaultCategory: defaultCategory || null },
      {
        onSuccess: () => {
          toast
            .success(
              newEnabled ? "YouTube sync enabled" : "YouTube sync disabled"
            )
            .show();
        },
        onError: (err) => {
          toast.error(`Failed to update config: ${err.message}`).show();
        },
      }
    );
  };

  const handleSaveCategory = () => {
    updateConfig.mutate(
      { enabled: config.enabled, defaultCategory: defaultCategory || null },
      {
        onSuccess: () => {
          toast.success("Default category updated").show();
        },
        onError: (err) => {
          toast.error(`Failed to save: ${err.message}`).show();
        },
      }
    );
  };

  const handleSync = () => {
    const request =
      playlistId || categoryOverride
        ? {
            playlistId: playlistId || undefined,
            category: categoryOverride || undefined,
          }
        : undefined;

    triggerSync.mutate(request, {
      onSuccess: (result) => {
        setSyncResult(result);
        setLastSynced(new Date());
        if (result.errors.length > 0) {
          toast
            .warning(`Sync completed with ${result.errors.length} error(s)`)
            .show();
        } else {
          toast.success(`Synced ${result.synced} video(s)`).show();
        }
      },
      onError: (err) => {
        toast.error(`Sync failed: ${err.message}`).show();
      },
    });
  };

  const disabled = !config.enabled;

  return (
    <div className="bg-surface rounded-card border-hairline border">
      {/* Header with toggle */}
      <div className="flex items-center justify-between border-b border-inherit p-6">
        <div className="flex items-center gap-3">
          <Youtube className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-body font-semibold">YouTube Channel Sync</p>
            <p className="text-muted text-sm">
              Import videos from @nosilha into the gallery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {config.videoCount > 0 && (
            <span className="bg-surface-alt text-muted rounded-badge px-2.5 py-0.5 text-xs font-medium">
              {config.videoCount} {config.videoCount === 1 ? "video" : "videos"}
            </span>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={handleToggle}
            disabled={updateConfig.isPending}
            className={clsx(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
              config.enabled ? "bg-brand" : "bg-surface-alt",
              updateConfig.isPending && "opacity-50"
            )}
          >
            <span
              className={clsx(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                config.enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* Configuration section */}
      <div
        className={clsx(
          "border-b border-inherit p-6 transition-opacity",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
          Configuration
        </p>
        <div>
          <label
            htmlFor="defaultCategory"
            className="text-body mb-1.5 block text-sm font-medium"
          >
            Default Category
          </label>
          <div className="flex gap-2">
            <input
              id="defaultCategory"
              type="text"
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              placeholder="e.g. Culture, Music, Travel"
              className="border-hairline bg-canvas text-body focus:ring-brand rounded-button flex-1 border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveCategory}
              disabled={
                updateConfig.isPending ||
                defaultCategory === (config.defaultCategory ?? "")
              }
              className="rounded-button bg-surface-alt text-body hover:bg-surface border-hairline border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
          <p className="text-muted mt-1 text-xs">
            Applied to all synced videos unless overridden below.
          </p>
        </div>
      </div>

      {/* Sync section */}
      <div
        className={clsx(
          "space-y-6 p-6 transition-opacity",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div>
          <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
            Sync
          </p>

          {/* Playlist ID */}
          <div className="mb-4">
            <label
              htmlFor="playlistId"
              className="text-body mb-1.5 block text-sm font-medium"
            >
              Playlist ID
            </label>
            <input
              id="playlistId"
              type="text"
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              placeholder="Optional — leave empty for full channel sync"
              className="border-hairline bg-canvas text-body focus:ring-brand rounded-button w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            <p className="text-muted mt-1 text-xs">
              Sync a specific playlist instead of the channel uploads.
            </p>
          </div>

          {/* Category override */}
          <div className="mb-6">
            <label
              htmlFor="categoryOverride"
              className="text-body mb-1.5 block text-sm font-medium"
            >
              Category
            </label>
            <input
              id="categoryOverride"
              type="text"
              value={categoryOverride}
              onChange={(e) => setCategoryOverride(e.target.value)}
              placeholder="Optional — overrides default for this sync"
              className="border-hairline bg-canvas text-body focus:ring-brand rounded-button w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Sync button + last synced */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSync}
              disabled={triggerSync.isPending}
              className={clsx(
                "rounded-button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors",
                triggerSync.isPending
                  ? "bg-brand/60 cursor-not-allowed"
                  : "bg-brand hover:bg-brand/90"
              )}
            >
              {triggerSync.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {triggerSync.isPending ? "Syncing..." : "Sync Now"}
            </button>
            {lastSynced && (
              <span className="text-muted text-xs">
                Last synced:{" "}
                {lastSynced.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Sync result banner */}
        {syncResult && (
          <SyncResultBanner
            result={syncResult}
            onDismiss={() => setSyncResult(null)}
          />
        )}
      </div>
    </div>
  );
}

function SyncResultBanner({
  result,
  onDismiss,
}: {
  result: YouTubeSyncResult;
  onDismiss: () => void;
}) {
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const hasErrors = result.errors.length > 0;

  return (
    <div
      className={clsx(
        "rounded-button border p-4",
        hasErrors
          ? "border-status-warning/30 bg-status-warning/5"
          : "border-status-success/30 bg-status-success/5"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{result.synced} synced</span>
          <span className="text-muted">&middot;</span>
          <span className="text-muted">{result.skipped} skipped</span>
          <span className="text-muted">&middot;</span>
          <span
            className={clsx(
              hasErrors ? "text-status-warning font-medium" : "text-muted"
            )}
          >
            {result.errors.length} error(s)
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted hover:text-body -mt-1 -mr-1 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {hasErrors && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setErrorsExpanded(!errorsExpanded)}
            className="text-muted hover:text-body inline-flex items-center gap-1 text-xs"
          >
            <ChevronDown
              className={clsx(
                "h-3 w-3 transition-transform",
                errorsExpanded && "rotate-180"
              )}
            />
            {errorsExpanded ? "Hide errors" : "Show errors"}
          </button>
          {errorsExpanded && (
            <ul className="text-status-warning mt-2 space-y-1 text-xs">
              {result.errors.map((err, i) => (
                <li key={i} className="font-mono">
                  {err}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="bg-surface rounded-card border-hairline animate-pulse border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-surface-alt h-6 w-6 rounded" />
          <div className="space-y-2">
            <div className="bg-surface-alt h-4 w-40 rounded" />
            <div className="bg-surface-alt h-3 w-56 rounded" />
          </div>
        </div>
        <div className="bg-surface-alt h-6 w-11 rounded-full" />
      </div>
      <div className="mt-6 space-y-4">
        <div className="bg-surface-alt h-10 w-full rounded" />
        <div className="bg-surface-alt h-10 w-full rounded" />
        <div className="bg-surface-alt h-10 w-32 rounded" />
      </div>
    </div>
  );
}
