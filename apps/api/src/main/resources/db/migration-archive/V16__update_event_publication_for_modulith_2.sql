-- Update event_publication table for Spring Modulith 2.0 compatibility
-- Adds new columns required by Spring Modulith 2.0
-- See: https://docs.spring.io/spring-modulith/reference/appendix.html

-- Add new columns for Spring Modulith 2.0
ALTER TABLE event_publication
ADD COLUMN IF NOT EXISTS status TEXT;

ALTER TABLE event_publication
ADD COLUMN IF NOT EXISTS completion_attempts INTEGER;

ALTER TABLE event_publication
ADD COLUMN IF NOT EXISTS last_resubmission_date TIMESTAMP WITH TIME ZONE;

-- Comments for new columns
COMMENT ON COLUMN event_publication.status IS 'Current status of the event publication';
COMMENT ON COLUMN event_publication.completion_attempts IS 'Number of completion attempts';
COMMENT ON COLUMN event_publication.last_resubmission_date IS 'Last date the event was resubmitted for processing';
