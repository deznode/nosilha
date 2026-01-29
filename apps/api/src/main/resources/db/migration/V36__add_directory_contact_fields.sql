-- V36__add_directory_contact_fields.sql
-- Add email and website columns to directory_entries table
-- Required before V37 data corrections can populate these fields

ALTER TABLE directory_entries
ADD COLUMN email VARCHAR(255),
ADD COLUMN website VARCHAR(512);

COMMENT ON COLUMN directory_entries.email IS 'Business email address';
COMMENT ON COLUMN directory_entries.website IS 'Business website URL';
