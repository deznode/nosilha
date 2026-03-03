-- Spring Modulith Event Publication Table
-- This table is used by Spring Modulith to track published events and ensure reliable delivery
-- across module boundaries. It stores event publication metadata and completion status.

CREATE TABLE IF NOT EXISTS event_publication (
    id UUID PRIMARY KEY,
    listener_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    serialized_event TEXT NOT NULL,
    publication_date TIMESTAMP NOT NULL,
    completion_date TIMESTAMP
);

-- Index for querying incomplete event publications
CREATE INDEX idx_event_publication_completion_date ON event_publication(completion_date);

-- Index for querying by listener and completion status
CREATE INDEX idx_event_publication_listener_completion ON event_publication(listener_id, completion_date);

COMMENT ON TABLE event_publication IS 'Spring Modulith event publication tracking table for reliable cross-module event delivery';
COMMENT ON COLUMN event_publication.id IS 'Unique identifier for the event publication';
COMMENT ON COLUMN event_publication.listener_id IS 'Identifier of the event listener that should receive this event';
COMMENT ON COLUMN event_publication.event_type IS 'Fully qualified class name of the event type';
COMMENT ON COLUMN event_publication.serialized_event IS 'JSON serialization of the event data';
COMMENT ON COLUMN event_publication.publication_date IS 'Timestamp when the event was published';
COMMENT ON COLUMN event_publication.completion_date IS 'Timestamp when the event was successfully delivered (NULL if pending)';
