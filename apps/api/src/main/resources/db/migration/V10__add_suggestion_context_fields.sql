-- Add page context fields required by FR-020 to the suggestions table
ALTER TABLE suggestions
    ADD COLUMN page_url TEXT,
    ADD COLUMN page_title TEXT,
    ADD COLUMN content_type VARCHAR(100);

-- Backfill existing rows with NULL-safe defaults (optional, handled implicitly)

COMMENT ON COLUMN suggestions.page_url IS 'Canonical page URL captured at submission time';
COMMENT ON COLUMN suggestions.page_title IS 'Content title captured at submission time';
COMMENT ON COLUMN suggestions.content_type IS 'High-level content classification (e.g., landmark, restaurant)';
