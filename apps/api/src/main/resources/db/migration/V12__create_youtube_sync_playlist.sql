-- Saved YouTube playlists for one-click sync
CREATE TABLE youtube_sync_playlist (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id      VARCHAR(100) NOT NULL,
    label            VARCHAR(200) NOT NULL,
    category         VARCHAR(100),
    last_synced_at   TIMESTAMPTZ,
    last_sync_count  INT DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by       UUID,
    CONSTRAINT uq_youtube_sync_playlist_playlist_id UNIQUE (playlist_id)
);
