-- Migration: Create AI feature config table for domain-level toggles
-- Description: Stores per-domain AI feature enable/disable state with audit trail

CREATE TABLE ai_feature_config (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    domain      VARCHAR(50) NOT NULL UNIQUE,
    enabled     BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID
);

COMMENT ON TABLE ai_feature_config IS 'Domain-level AI feature toggles (gallery, stories, directory)';
COMMENT ON COLUMN ai_feature_config.domain IS 'Domain identifier: gallery, stories, directory';
COMMENT ON COLUMN ai_feature_config.enabled IS 'Whether AI features are enabled for this domain';

-- Seed initial domains (all disabled by default)
INSERT INTO ai_feature_config (domain, enabled) VALUES
    ('gallery', false),
    ('stories', false),
    ('directory', false);
