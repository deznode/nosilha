-- Bookmarks table for user-saved directory entries
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    entry_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,

    -- Constraints
    CONSTRAINT uq_bookmark_user_entry UNIQUE (user_id, entry_id),
    CONSTRAINT fk_bookmarks_entry FOREIGN KEY (entry_id)
        REFERENCES directory_entries(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_entry_id ON bookmarks(entry_id);

-- Comments for documentation
COMMENT ON TABLE bookmarks IS 'User-saved directory entries';
COMMENT ON COLUMN bookmarks.user_id IS 'Supabase user ID (String from JWT sub claim)';
COMMENT ON COLUMN bookmarks.entry_id IS 'Reference to directory entry';
COMMENT ON COLUMN bookmarks.created_at IS 'Timestamp when bookmark was created (set by @CreationTimestamp in entity)';
