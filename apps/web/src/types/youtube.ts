/**
 * YouTube sync configuration from the backend.
 */
export interface YouTubeSyncConfig {
  enabled: boolean;
  defaultCategory: string | null;
  apiKeyConfigured: boolean;
  updatedAt: string | null;
  videoCount: number;
}

/**
 * Request to update YouTube sync configuration.
 */
export interface UpdateYouTubeSyncConfigRequest {
  enabled: boolean;
  defaultCategory: string | null;
}

/**
 * Request to trigger a YouTube sync operation.
 */
export interface YouTubeSyncRequest {
  playlistId?: string;
  category?: string;
}

/**
 * Response from a YouTube sync operation.
 */
export interface YouTubeSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  totalProcessed: number;
}

/**
 * A saved YouTube playlist for one-click sync.
 */
export interface YouTubeSyncPlaylist {
  id: string;
  playlistId: string;
  label: string;
  category: string | null;
  lastSyncedAt: string | null;
  lastSyncCount: number;
  createdAt: string;
}

/**
 * Request to save or update a YouTube sync playlist.
 */
export interface SaveYouTubeSyncPlaylistRequest {
  playlistId: string;
  label: string;
  category?: string;
}
