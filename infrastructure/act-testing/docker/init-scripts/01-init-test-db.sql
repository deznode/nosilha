-- Initialize test database for Act testing
-- This script runs when PostgreSQL container starts
-- Compatible with PostgreSQL 16+

-- Create integration test database if it doesn't exist
SELECT 'CREATE DATABASE nosilha_integration'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nosilha_integration')\gexec

-- Create test user with appropriate permissions (PostgreSQL 16+ syntax)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'integration_test') THEN
        CREATE USER integration_test WITH PASSWORD 'integration_test';
    END IF;
END
$$;

-- Grant privileges on databases
GRANT ALL PRIVILEGES ON DATABASE nosilha_test TO integration_test;
GRANT ALL PRIVILEGES ON DATABASE nosilha_integration TO integration_test;

-- Set up additional test schemas
\c nosilha_test;
CREATE SCHEMA IF NOT EXISTS test_data;
GRANT ALL ON SCHEMA test_data TO test;
GRANT ALL ON SCHEMA test_data TO integration_test;