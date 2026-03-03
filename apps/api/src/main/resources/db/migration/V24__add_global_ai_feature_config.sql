-- Add global AI toggle to feature config.
-- Acts as a master switch: when disabled, all AI operations are off
-- regardless of domain-level toggles.

INSERT INTO ai_feature_config (domain, enabled)
VALUES ('global', true);
