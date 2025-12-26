-- V3__create_users_table.sql
-- This script creates the public 'users' table to store profile information that
-- complements the private user data in Supabase's 'auth.users' table.

CREATE TABLE users (
    -- The primary key for our public user profile.
    -- It MUST match the corresponding user's ID in the auth.users table.
    id UUID PRIMARY KEY,

    -- User's full name, can be nullable.
    full_name VARCHAR(255),

    -- User's email, which should be unique and is required.
    email VARCHAR(255) UNIQUE NOT NULL,

    -- User's role within the application (e.g., 'ADMIN', 'USER').
    -- Defaults to 'USER' for any new sign-ups.
    role VARCHAR(50) NOT NULL DEFAULT 'USER',

    -- Timestamp for when the profile was created in our public table.
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- Optional: Add comments on columns for better schema documentation in database tools.
COMMENT ON TABLE users IS 'Public user profiles, linked to Supabase auth users.';
COMMENT ON COLUMN users.id IS 'Primary key, references auth.users.id.';
COMMENT ON COLUMN users.role IS 'Application-specific user role (e.g., ADMIN, USER).';