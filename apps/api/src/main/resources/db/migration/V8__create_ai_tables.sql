-- V8: AI Tables (ai_analysis_log, ai_analysis_batch, ai_api_usage, ai_feature_config)
-- AI module: image analysis, batch processing, API usage metering, feature toggles.

-- ============================================================
-- AI Analysis Log: Execution history + moderation state per media item
-- ============================================================
CREATE TABLE ai_analysis_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id            UUID NOT NULL REFERENCES gallery_media(id),
    batch_id            UUID,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    providers_used      TEXT[],
    raw_results         JSONB,
    result_tags         TEXT[],
    result_labels       JSONB,
    result_alt_text     VARCHAR(1024),
    result_description  VARCHAR(2048),
    result_title        VARCHAR(256),
    moderation_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW',
    moderated_by        UUID,
    moderated_at        TIMESTAMPTZ,
    moderator_notes     TEXT,
    error_message       TEXT,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    requested_by        UUID NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_ai_analysis_log_media_id ON ai_analysis_log(media_id);
CREATE INDEX idx_ai_analysis_log_batch_id ON ai_analysis_log(batch_id);
CREATE INDEX idx_ai_analysis_log_moderation_status ON ai_analysis_log(moderation_status);
CREATE INDEX idx_ai_analysis_log_status ON ai_analysis_log(status);

-- ============================================================
-- AI Analysis Batch: Batch request tracking with progress counters
-- ============================================================
CREATE TABLE ai_analysis_batch (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_items     INT NOT NULL,
    completed_items INT NOT NULL DEFAULT 0,
    failed_items    INT NOT NULL DEFAULT 0,
    requested_by    UUID NOT NULL,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id)
);

-- Add FK from ai_analysis_log.batch_id now that ai_analysis_batch exists
ALTER TABLE ai_analysis_log
    ADD CONSTRAINT fk_ai_analysis_log_batch
    FOREIGN KEY (batch_id) REFERENCES ai_analysis_batch(id);

-- ============================================================
-- AI API Usage: Monthly usage counters per provider
-- ============================================================
CREATE TABLE ai_api_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(50) NOT NULL,
    year_month      VARCHAR(7) NOT NULL,
    request_count   INT NOT NULL DEFAULT 0,
    monthly_limit   INT NOT NULL,
    last_request_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),
    UNIQUE(provider, year_month)
);

CREATE INDEX idx_ai_api_usage_provider_month ON ai_api_usage(provider, year_month);

-- ============================================================
-- AI Feature Config: Domain-level AI feature toggles
-- ============================================================
CREATE TABLE ai_feature_config (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain      VARCHAR(50) NOT NULL UNIQUE,
    enabled     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID
);

COMMENT ON TABLE ai_feature_config IS 'Domain-level AI feature toggles (gallery, stories, directory)';
COMMENT ON COLUMN ai_feature_config.domain IS 'Domain identifier: gallery, stories, directory';
COMMENT ON COLUMN ai_feature_config.enabled IS 'Whether AI features are enabled for this domain';
