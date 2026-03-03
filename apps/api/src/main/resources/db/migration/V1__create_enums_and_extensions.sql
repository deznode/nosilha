-- V1: Enum Types
-- Creates enum types required by subsequent table migrations.

CREATE TYPE gallery_media_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'PENDING_REVIEW',
    'ACTIVE',
    'ARCHIVED',
    'FLAGGED',
    'REJECTED'
);

CREATE TYPE media_source AS ENUM ('LOCAL', 'GOOGLE_PHOTOS', 'ADOBE_LIGHTROOM');
