-- V19__create_user_profiles.sql

-- Platform-specific user preferences, linked to Supabase user ID
-- Stores user profile information and preferences for the Nos Ilha platform

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    location VARCHAR(255),
    preferred_language VARCHAR(3) NOT NULL DEFAULT 'EN',
    notification_preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    -- Constraints
    CONSTRAINT chk_preferred_language CHECK (preferred_language IN ('EN', 'PT', 'KEA')),
    CONSTRAINT chk_display_name_length CHECK (
        display_name IS NULL OR (LENGTH(display_name) >= 2 AND LENGTH(display_name) <= 100)
    )
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Comments
COMMENT ON TABLE user_profiles IS 'Platform-specific user preferences, linked to Supabase user ID';
COMMENT ON COLUMN user_profiles.user_id IS 'Supabase user ID (from JWT sub claim)';
COMMENT ON COLUMN user_profiles.preferred_language IS 'EN=English, PT=Portuguese, KEA=Kriolu';
