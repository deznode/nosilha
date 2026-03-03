-- V2: Auth Tables
-- Users table: public profiles linked to Supabase auth.
-- Must be created first — referenced by FK from nearly every other table.

CREATE TABLE users (
    id          UUID PRIMARY KEY,
    full_name   VARCHAR(255),
    email       VARCHAR(255) UNIQUE NOT NULL,
    role        VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID
);

CREATE INDEX idx_users_email ON users(email);

-- Self-referential FK (created_by points to another user)
ALTER TABLE users
    ADD CONSTRAINT fk_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);
