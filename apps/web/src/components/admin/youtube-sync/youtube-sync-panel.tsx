"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ChevronDown,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Youtube,
  X,
} from "lucide-react";
import {
  useYouTubeSyncConfig,
  useUpdateYouTubeSyncConfig,
  useTriggerYouTubeSync,
  useYouTubeSyncPlaylists,
  useSaveYouTubeSyncPlaylist,
  useUpdateYouTubeSyncPlaylist,
  useDeleteYouTubeSyncPlaylist,
  useSyncSavedPlaylist,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { YouTubeSyncPlaylist, YouTubeSyncResult } from "@/types/youtube";

const INPUT_CLASS =
  "border-hairline bg-canvas text-body focus:ring-brand rounded-button w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none";

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
              className={clsx(INPUT_CLASS, "flex-1")}
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

      {/* Saved Playlists section */}
      <div
        className={clsx(
          "border-b border-inherit p-6 transition-opacity",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <SavedPlaylistsSection />
      </div>

      {/* Quick Sync section */}
      <div
        className={clsx(
          "space-y-6 p-6 transition-opacity",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div>
          <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
            Quick Sync
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
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
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

// --- Saved Playlists ---

function SavedPlaylistsSection() {
  const toast = useToast();
  const { data: playlists, isLoading } = useYouTubeSyncPlaylists();
  const savePlaylist = useSaveYouTubeSyncPlaylist();
  const updatePlaylist = useUpdateYouTubeSyncPlaylist();
  const deletePlaylist = useDeleteYouTubeSyncPlaylist();
  const syncPlaylist = useSyncSavedPlaylist();

  const [showForm, setShowForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] =
    useState<YouTubeSyncPlaylist | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<YouTubeSyncPlaylist | null>(
    null
  );
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSave = (data: {
    playlistId: string;
    label: string;
    category?: string;
  }) => {
    if (editingPlaylist) {
      updatePlaylist.mutate(
        { id: editingPlaylist.id, request: data },
        {
          onSuccess: () => {
            toast.success("Playlist updated").show();
            setEditingPlaylist(null);
            setShowForm(false);
          },
          onError: (err) => {
            toast.error(`Failed to update: ${err.message}`).show();
          },
        }
      );
    } else {
      savePlaylist.mutate(data, {
        onSuccess: () => {
          toast.success("Playlist saved").show();
          setShowForm(false);
        },
        onError: (err) => {
          toast.error(`Failed to save: ${err.message}`).show();
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePlaylist.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Playlist deleted").show();
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`).show();
        setDeleteTarget(null);
      },
    });
  };

  const handleSync = (playlist: YouTubeSyncPlaylist) => {
    setSyncingId(playlist.id);
    syncPlaylist.mutate(playlist.id, {
      onSuccess: (result) => {
        setSyncingId(null);
        if (result.errors.length > 0) {
          toast
            .warning(
              `Synced ${result.synced} video(s) with ${result.errors.length} error(s)`
            )
            .show();
        } else {
          toast.success(`Synced ${result.synced} video(s)`).show();
        }
      },
      onError: (err) => {
        setSyncingId(null);
        toast.error(`Sync failed: ${err.message}`).show();
      },
    });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted text-xs font-semibold tracking-wider uppercase">
          Saved Playlists
        </p>
        <button
          type="button"
          onClick={() => {
            setEditingPlaylist(null);
            setShowForm(!showForm);
          }}
          className="text-brand hover:text-brand/80 inline-flex items-center gap-1 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <SavePlaylistForm
          key={editingPlaylist?.id ?? "new"}
          initial={editingPlaylist}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPlaylist(null);
          }}
          isPending={savePlaylist.isPending || updatePlaylist.isPending}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="bg-surface-alt h-16 animate-pulse rounded" />
      ) : playlists && playlists.length > 0 ? (
        <div className="space-y-2">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="border-hairline flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-body truncate text-sm font-medium">
                    {pl.label}
                  </span>
                  {pl.category && (
                    <span className="bg-surface-alt text-muted rounded-badge shrink-0 px-2 py-0.5 text-xs">
                      {pl.category}
                    </span>
                  )}
                </div>
                <div className="text-muted mt-0.5 flex items-center gap-2 text-xs">
                  <span className="font-mono">{pl.playlistId}</span>
                  <span>&middot;</span>
                  {pl.lastSyncedAt ? (
                    <span>
                      {formatRelativeTime(pl.lastSyncedAt)} &middot;{" "}
                      {pl.lastSyncCount} videos
                    </span>
                  ) : (
                    <span>Never synced</span>
                  )}
                </div>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSync(pl)}
                  disabled={syncingId === pl.id}
                  title="Sync playlist"
                  className="text-muted hover:text-brand rounded p-1.5 transition-colors disabled:opacity-50"
                >
                  {syncingId === pl.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlaylist(pl);
                    setShowForm(true);
                  }}
                  title="Edit playlist"
                  className="text-muted hover:text-body rounded p-1.5 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(pl)}
                  title="Delete playlist"
                  className="text-muted hover:text-status-error rounded p-1.5 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-muted py-4 text-center text-sm">
            No saved playlists yet. Click &ldquo;Add&rdquo; to save one.
          </p>
        )
      )}

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Saved Playlist"
        description={`Remove "${deleteTarget?.label}" from saved playlists? This won't delete any synced videos.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deletePlaylist.isPending}
      />
    </>
  );
}

function SavePlaylistForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: YouTubeSyncPlaylist | null;
  onSave: (data: {
    playlistId: string;
    label: string;
    category?: string;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [playlistId, setPlaylistId] = useState(initial?.playlistId ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistId.trim() || !label.trim()) return;
    onSave({
      playlistId: playlistId.trim(),
      label: label.trim(),
      category: category.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pl-label"
            className="text-body mb-1 block text-xs font-medium"
          >
            Label
          </label>
          <input
            id="pl-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Brava Music"
            required
            maxLength={200}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor="pl-id"
            className="text-body mb-1 block text-xs font-medium"
          >
            Playlist ID
          </label>
          <input
            id="pl-id"
            type="text"
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            placeholder="PLxyz..."
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="pl-category"
          className="text-body mb-1 block text-xs font-medium"
        >
          Category (optional)
        </label>
        <input
          id="pl-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Overrides global default for this playlist"
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || !playlistId.trim() || !label.trim()}
          className={clsx(
            "rounded-button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors",
            isPending
              ? "bg-brand/60 cursor-not-allowed"
              : "bg-brand hover:bg-brand/90"
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Update" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted hover:text-body rounded-button px-4 py-2 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- Shared Components ---

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
