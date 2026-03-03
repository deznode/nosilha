-- V9: Event Publication Table
-- Spring Modulith event publication tracking for reliable cross-module delivery.

CREATE TABLE event_publication (
    id                      UUID PRIMARY KEY,
    listener_id             TEXT NOT NULL,
    event_type              TEXT NOT NULL,
    serialized_event        TEXT NOT NULL,
    publication_date        TIMESTAMP NOT NULL,
    completion_date         TIMESTAMP,
    status                  TEXT,
    completion_attempts     INTEGER,
    last_resubmission_date  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_event_publication_completion_date ON event_publication(completion_date);
CREATE INDEX idx_event_publication_listener_completion ON event_publication(listener_id, completion_date);
