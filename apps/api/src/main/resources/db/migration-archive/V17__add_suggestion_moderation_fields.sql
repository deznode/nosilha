ALTER TABLE suggestions
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ADD COLUMN admin_notes TEXT,
ADD COLUMN reviewed_by VARCHAR(255),
ADD COLUMN reviewed_at TIMESTAMP;

-- Constraint for valid status values
ALTER TABLE suggestions
ADD CONSTRAINT chk_suggestion_status
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Indexes
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_status_created ON suggestions(status, created_at DESC);
