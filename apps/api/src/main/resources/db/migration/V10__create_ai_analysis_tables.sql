-- ===================================================================
-- V10: AI Analysis Tracking Tables
-- Supports: execution tracking, batch management, API usage metering
-- ===================================================================

-- -------------------------------------------------------------------
-- AI Analysis Log - Execution history + moderation state per media item
-- -------------------------------------------------------------------
CREATE TABLE ai_analysis_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id        UUID NOT NULL REFERENCES gallery_media(id),
    batch_id        UUID,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    providers_used  TEXT[],
    raw_results     JSONB,
    result_tags     TEXT[],
    result_labels   JSONB,
    result_alt_text VARCHAR(1024),
    result_description VARCHAR(2048),
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW',
    moderated_by    UUID,
    moderated_at    TIMESTAMPTZ,
    moderator_notes TEXT,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    requested_by    UUID NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_analysis_log_media_id ON ai_analysis_log(media_id);
CREATE INDEX idx_ai_analysis_log_batch_id ON ai_analysis_log(batch_id);
CREATE INDEX idx_ai_analysis_log_moderation_status ON ai_analysis_log(moderation_status);
CREATE INDEX idx_ai_analysis_log_status ON ai_analysis_log(status);

-- -------------------------------------------------------------------
-- AI Analysis Batch - Batch request tracking with progress counters
-- -------------------------------------------------------------------
CREATE TABLE ai_analysis_batch (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_items     INT NOT NULL,
    completed_items INT NOT NULL DEFAULT 0,
    failed_items    INT NOT NULL DEFAULT 0,
    requested_by    UUID NOT NULL,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add FK now that ai_analysis_batch exists
ALTER TABLE ai_analysis_log
    ADD CONSTRAINT fk_ai_analysis_log_batch
    FOREIGN KEY (batch_id) REFERENCES ai_analysis_batch(id);

-- -------------------------------------------------------------------
-- AI API Usage - Monthly usage counters per provider
-- -------------------------------------------------------------------
CREATE TABLE ai_api_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(50) NOT NULL,
    year_month      VARCHAR(7) NOT NULL,
    request_count   INT NOT NULL DEFAULT 0,
    monthly_limit   INT NOT NULL,
    last_request_at TIMESTAMPTZ,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, year_month)
);

CREATE INDEX idx_ai_api_usage_provider_month ON ai_api_usage(provider, year_month);
