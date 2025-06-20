-- Remove storage_path field from project_documents table
-- This field is no longer needed for the application

ALTER TABLE project_documents DROP COLUMN IF EXISTS storage_path;
