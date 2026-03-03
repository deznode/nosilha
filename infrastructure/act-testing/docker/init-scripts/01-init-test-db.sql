-- Initialize test database for Act testing
-- This script runs when PostgreSQL container starts

-- Create test database if it doesn't exist
SELECT 'CREATE DATABASE nosilha_integration'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nosilha_integration')\gexec

-- Create test user with appropriate permissions
CREATE USER IF NOT EXISTS integration_test WITH PASSWORD 'integration_test';
GRANT ALL PRIVILEGES ON DATABASE nosilha_test TO integration_test;
GRANT ALL PRIVILEGES ON DATABASE nosilha_integration TO integration_test;

-- Set up additional test schemas if needed
\c nosilha_test;
CREATE SCHEMA IF NOT EXISTS test_data;
GRANT ALL ON SCHEMA test_data TO test;
GRANT ALL ON SCHEMA test_data TO integration_test;