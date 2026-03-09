-- YouTube sync runtime configuration (single-row table)
CREATE TABLE youtube_sync_config (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled          BOOLEAN NOT NULL DEFAULT false,
    default_category VARCHAR(100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by       UUID,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by       UUID
);
