-- ============================================================================
-- V26: Add FLAGGED status to media_status enum
-- ============================================================================
-- PostgreSQL requires enum values to be committed before they can be used.
-- The FLAGGED value will be used in V27 for indexes and queries.
-- ============================================================================

-- Add FLAGGED status value to existing enum
-- Note: Using AFTER clause to insert in logical position after PENDING_REVIEW
ALTER TYPE media_status ADD VALUE IF NOT EXISTS 'FLAGGED' AFTER 'PENDING_REVIEW';
