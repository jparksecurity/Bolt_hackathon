-- Migration: Add required field defaults and NOT NULL constraints
-- This prevents UI crashes when fields that are assumed to be non-null are actually null

-- 1. PROPERTIES table - fix the status field that causes crashes
-- Back-fill existing NULL status values
UPDATE properties SET status = 'prospect' WHERE status IS NULL;

-- Set default and make NOT NULL
ALTER TABLE properties 
  ALTER COLUMN status SET DEFAULT 'prospect',
  ALTER COLUMN status SET NOT NULL;

-- Ensure project_id is always set (UI assumes this)
ALTER TABLE properties 
  ALTER COLUMN project_id SET NOT NULL;

-- 2. CLIENT_REQUIREMENTS table
-- Ensure project_id is always set
ALTER TABLE client_requirements 
  ALTER COLUMN project_id SET NOT NULL;

-- 3. PROJECT_DOCUMENTS table  
-- Ensure project_id is always set
ALTER TABLE project_documents 
  ALTER COLUMN project_id SET NOT NULL;

-- 4. PROJECT_ROADMAP table
-- Back-fill existing NULL status values
UPDATE project_roadmap SET status = 'pending' WHERE status IS NULL;

-- Set default and make NOT NULL for status
ALTER TABLE project_roadmap 
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

-- Ensure project_id is always set
ALTER TABLE project_roadmap 
  ALTER COLUMN project_id SET NOT NULL;

-- 5. PROJECT_UPDATES table
-- Ensure project_id is always set
ALTER TABLE project_updates 
  ALTER COLUMN project_id SET NOT NULL;

-- Set default for update_date to NOW for convenience
ALTER TABLE project_updates 
  ALTER COLUMN update_date SET DEFAULT NOW(); 