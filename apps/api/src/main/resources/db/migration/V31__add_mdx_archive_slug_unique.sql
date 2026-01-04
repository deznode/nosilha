-- V31__add_mdx_archive_slug_unique.sql
-- Add unique constraint on slug to prevent race conditions during concurrent MDX commits
-- Fixes: Code review issue - slug generation race condition

-- Add unique constraint on slug
-- This provides database-level protection against duplicate slugs from concurrent requests
ALTER TABLE mdx_archives
    ADD CONSTRAINT uq_mdx_archives_slug UNIQUE (slug);

-- Add index for fast slug lookups (used by existsBySlug)
CREATE INDEX IF NOT EXISTS idx_mdx_archives_slug
    ON mdx_archives(slug);

COMMENT ON COLUMN mdx_archives.slug IS
    'URL-friendly unique identifier. Used in filesystem paths and URLs.';
