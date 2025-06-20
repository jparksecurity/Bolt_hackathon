-- =====================================================
-- SAFE COMPREHENSIVE SCHEMA AND RPC UPDATES
-- =====================================================
-- This migration safely consolidates multiple related changes:
-- - Add project_status enum and migrate projects table (safe)
-- - Add multiple enums for better type safety (safe)
-- - Migrate project_roadmap, project_documents, and properties tables to use enums
-- - Add dashboard_card_order field to projects table
-- - Migrate client tour availability to RPC and tighten RLS
-- - Update get_public_project function with proper enum types and missing fields
-- =====================================================

-- 1. SAFELY CREATE ALL ENUM TYPES
-- =====================================================

-- Project status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('Active', 'Pending', 'Completed', 'On Hold');
    END IF;
END$$;

-- Roadmap status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roadmap_status') THEN
        CREATE TYPE roadmap_status AS ENUM ('completed', 'in-progress', 'pending');
    END IF;
END$$;

-- Document source type enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_source_type') THEN
        CREATE TYPE document_source_type AS ENUM ('upload', 'google_drive', 'onedrive', 'url');
    END IF;
END$$;

-- Property status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
        CREATE TYPE property_status AS ENUM ('new', 'active', 'pending', 'under_review', 'negotiating', 'on_hold', 'declined', 'accepted');
    END IF;
END$$;

-- Property current state enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_current_state') THEN
        CREATE TYPE property_current_state AS ENUM ('Available', 'Under Review', 'Negotiating', 'On Hold', 'Declined');
    END IF;
END$$;

-- Tour status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tour_status') THEN
        CREATE TYPE tour_status AS ENUM ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled');
    END IF;
END$$;

-- 2. SAFELY MIGRATE PROJECTS TABLE TO USE project_status ENUM
-- =====================================================

-- Add new enum column for projects (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status_enum') THEN
        ALTER TABLE projects ADD COLUMN status_enum project_status;
    END IF;
END$$;

-- Migrate existing project status data (only if status_enum is null)
UPDATE projects 
SET status_enum = CASE 
  WHEN status = 'Active' THEN 'Active'::project_status
  WHEN status = 'Pending' THEN 'Pending'::project_status  
  WHEN status = 'Completed' THEN 'Completed'::project_status
  WHEN status = 'On Hold' THEN 'On Hold'::project_status
  ELSE 'Pending'::project_status -- default fallback
END
WHERE status_enum IS NULL;

-- Replace the old column with enum column (if string column still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status' AND data_type = 'text') THEN
        ALTER TABLE projects ALTER COLUMN status_enum SET NOT NULL;
        ALTER TABLE projects DROP COLUMN status;
        ALTER TABLE projects RENAME COLUMN status_enum TO status;
    END IF;
END$$;

-- 3. SAFELY MIGRATE PROJECT_ROADMAP TABLE TO USE roadmap_status ENUM
-- =====================================================

-- Add new enum column for project_roadmap (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_roadmap' AND column_name = 'status_enum') THEN
        ALTER TABLE project_roadmap ADD COLUMN status_enum roadmap_status;
    END IF;
END$$;

-- Migrate existing roadmap status data (only if status_enum is null)
UPDATE project_roadmap 
SET status_enum = CASE 
  WHEN status = 'completed' THEN 'completed'::roadmap_status
  WHEN status = 'in-progress' THEN 'in-progress'::roadmap_status
  WHEN status = 'pending' THEN 'pending'::roadmap_status
  ELSE 'pending'::roadmap_status -- default fallback
END
WHERE status_enum IS NULL;

-- Replace the old column with enum column (if string column still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_roadmap' AND column_name = 'status' AND data_type = 'text') THEN
        ALTER TABLE project_roadmap ALTER COLUMN status_enum SET NOT NULL;
        ALTER TABLE project_roadmap DROP COLUMN status;
        ALTER TABLE project_roadmap RENAME COLUMN status_enum TO status;
    END IF;
END$$;

-- 4. SAFELY MIGRATE PROJECT_DOCUMENTS TABLE TO USE document_source_type ENUM
-- =====================================================

-- Add storage_path field temporarily (was missing in some schemas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'storage_path') THEN
        ALTER TABLE project_documents ADD COLUMN storage_path TEXT;
    END IF;
END$$;

-- Add new enum column for project_documents (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'source_type_enum') THEN
        ALTER TABLE project_documents ADD COLUMN source_type_enum document_source_type;
    END IF;
END$$;

-- Migrate existing document source_type data (only if source_type_enum is null)
UPDATE project_documents 
SET source_type_enum = CASE 
  WHEN source_type = 'upload' THEN 'upload'::document_source_type
  WHEN source_type = 'google_drive' THEN 'google_drive'::document_source_type
  WHEN source_type = 'onedrive' THEN 'onedrive'::document_source_type
  WHEN source_type = 'url' THEN 'url'::document_source_type
  ELSE 'url'::document_source_type -- default fallback
END
WHERE source_type_enum IS NULL;

-- Replace the old column with enum column (if string column still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'source_type' AND data_type = 'text') THEN
        ALTER TABLE project_documents ALTER COLUMN source_type_enum SET NOT NULL;
        ALTER TABLE project_documents DROP COLUMN source_type;
        ALTER TABLE project_documents RENAME COLUMN source_type_enum TO source_type;
    END IF;
END$$;

-- Remove storage_path field (no longer needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'storage_path') THEN
        ALTER TABLE project_documents DROP COLUMN storage_path;
    END IF;
END$$;

-- 5. SAFELY MIGRATE PROPERTIES TABLE TO USE MULTIPLE ENUMS
-- =====================================================

-- Add new enum columns for properties (if not exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status_enum') THEN
        ALTER TABLE properties ADD COLUMN status_enum property_status;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'current_state_enum') THEN
        ALTER TABLE properties ADD COLUMN current_state_enum property_current_state;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'tour_status_enum') THEN
        ALTER TABLE properties ADD COLUMN tour_status_enum tour_status;
    END IF;
END$$;

-- Migrate existing property status data (only if status_enum is null)
UPDATE properties 
SET status_enum = CASE 
  WHEN status = 'new' THEN 'new'::property_status
  WHEN status = 'active' THEN 'active'::property_status  
  WHEN status = 'pending' THEN 'pending'::property_status
  WHEN status = 'under_review' THEN 'under_review'::property_status
  WHEN status = 'negotiating' THEN 'negotiating'::property_status
  WHEN status = 'on_hold' THEN 'on_hold'::property_status
  WHEN status = 'declined' THEN 'declined'::property_status
  WHEN status = 'accepted' THEN 'accepted'::property_status
  ELSE 'new'::property_status -- default fallback
END
WHERE status_enum IS NULL;

-- Migrate existing property current_state data (only if current_state_enum is null)
UPDATE properties 
SET current_state_enum = CASE 
  WHEN current_state = 'Available' THEN 'Available'::property_current_state
  WHEN current_state = 'Under Review' THEN 'Under Review'::property_current_state
  WHEN current_state = 'Negotiating' THEN 'Negotiating'::property_current_state
  WHEN current_state = 'On Hold' THEN 'On Hold'::property_current_state
  WHEN current_state = 'Declined' THEN 'Declined'::property_current_state
  ELSE 'Available'::property_current_state -- default fallback
END
WHERE current_state_enum IS NULL;

-- Migrate existing tour_status data (only if tour_status_enum is null and allowing NULL)
UPDATE properties 
SET tour_status_enum = CASE 
  WHEN tour_status = 'Scheduled' THEN 'Scheduled'::tour_status
  WHEN tour_status = 'Completed' THEN 'Completed'::tour_status
  WHEN tour_status = 'Cancelled' THEN 'Cancelled'::tour_status
  WHEN tour_status = 'Rescheduled' THEN 'Rescheduled'::tour_status
  ELSE NULL -- allow NULL for properties without tours
END
WHERE tour_status_enum IS NULL;

-- Replace old columns with enum columns for properties (if string columns still exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status' AND data_type = 'text') THEN
        ALTER TABLE properties DROP COLUMN status;
        ALTER TABLE properties RENAME COLUMN status_enum TO status;
        ALTER TABLE properties ALTER COLUMN status SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'current_state' AND data_type = 'text') THEN
        ALTER TABLE properties DROP COLUMN current_state;
        ALTER TABLE properties RENAME COLUMN current_state_enum TO current_state;
        ALTER TABLE properties ALTER COLUMN current_state SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'tour_status' AND data_type = 'text') THEN
        ALTER TABLE properties DROP COLUMN tour_status;
        ALTER TABLE properties RENAME COLUMN tour_status_enum TO tour_status;
    END IF;
END$$;

-- 6. ADD DASHBOARD CARD ORDER TO PROJECTS TABLE
-- =====================================================

-- Add dashboard card order persistence to projects table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'dashboard_card_order') THEN
        ALTER TABLE projects ADD COLUMN dashboard_card_order JSONB;
    END IF;
END$$;

-- Create index for better query performance (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_projects_dashboard_card_order') THEN
        CREATE INDEX idx_projects_dashboard_card_order ON projects(id) WHERE dashboard_card_order IS NOT NULL;
    END IF;
END$$;

-- 7. CLIENT TOUR AVAILABILITY RLS AND RPC UPDATES
-- =====================================================

-- Add UPDATE RLS policy for authenticated brokers (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Brokers can update availability for their projects' AND tablename = 'client_tour_availability') THEN
        CREATE POLICY "Brokers can update availability for their projects" ON client_tour_availability
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = client_tour_availability.project_id 
              AND projects.clerk_user_id = (auth.jwt() ->> 'sub')
              AND projects.deleted_at IS NULL
            )
          );
    END IF;
END$$;

-- Add DELETE RLS policy for authenticated brokers (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Brokers can delete availability for their projects' AND tablename = 'client_tour_availability') THEN
        CREATE POLICY "Brokers can delete availability for their projects" ON client_tour_availability
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = client_tour_availability.project_id 
              AND projects.clerk_user_id = (auth.jwt() ->> 'sub')
              AND projects.deleted_at IS NULL
            )
          );
    END IF;
END$$;

-- Add composite UNIQUE constraint to prevent duplicate submissions (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_project_client_datetime') THEN
        ALTER TABLE client_tour_availability 
        ADD CONSTRAINT unique_project_client_datetime 
        UNIQUE (project_id, client_email, proposed_datetime);
    END IF;
END$$;

-- 8. CREATE/UPDATE RPC FUNCTIONS
-- =====================================================

-- Drop existing functions to allow return type changes
DROP FUNCTION IF EXISTS get_public_project(UUID);
DROP FUNCTION IF EXISTS get_public_project_roadmap(UUID);
DROP FUNCTION IF EXISTS get_public_properties(UUID);

-- Create the submit_client_tour_availability RPC function
CREATE OR REPLACE FUNCTION submit_client_tour_availability(
  share_id uuid,
  proposed_slots timestamptz[],
  client_name text DEFAULT NULL,
  client_email text DEFAULT NULL,
  client_phone text DEFAULT NULL,
  client_company text DEFAULT NULL,
  notes text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_project_id uuid;
  slot timestamptz;
  inserted_count integer := 0;
BEGIN
  -- Get project ID from share_id (RLS bypassed since this is SECURITY DEFINER)
  SELECT id INTO target_project_id
  FROM projects 
  WHERE public_share_id = submit_client_tour_availability.share_id
  AND deleted_at IS NULL;

  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found or not accessible';
  END IF;

  -- Insert each proposed slot
  FOREACH slot IN ARRAY proposed_slots
  LOOP
    INSERT INTO client_tour_availability (
      project_id,
      proposed_datetime,
      client_name,
      client_email,
      notes
    ) VALUES (
      target_project_id,
      slot,
      client_name,
      client_email,
      notes
    )
    ON CONFLICT (project_id, client_email, proposed_datetime) DO NOTHING;
    
    -- Count successful insertions
    IF FOUND THEN
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;

  RETURN inserted_count;
END;
$$;

-- Update get_public_project function with proper enum types and missing fields
CREATE OR REPLACE FUNCTION get_public_project(share_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_name TEXT,
  city TEXT,
  state TEXT,
  start_date DATE,
  desired_move_in_date DATE,
  status project_status,
  broker_commission DECIMAL,
  expected_fee DECIMAL,
  dashboard_card_order JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  contact_name TEXT,
  contact_title TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  commission_paid_by TEXT,
  payment_due TEXT,
  expected_headcount TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.company_name,
    p.city,
    p.state,
    p.start_date,
    p.desired_move_in_date,
    p.status,
    p.broker_commission,
    p.expected_fee,
    p.dashboard_card_order,
    p.created_at,
    p.updated_at,
    p.contact_name,
    p.contact_title,
    p.contact_phone,
    p.contact_email,
    p.commission_paid_by,
    p.payment_due,
    p.expected_headcount
  FROM projects p
  WHERE p.public_share_id = share_id
    AND p.deleted_at IS NULL;
END;
$$;

-- Create get_public_project_roadmap function with proper enum types
CREATE OR REPLACE FUNCTION get_public_project_roadmap(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  title TEXT,
  description TEXT,
  status roadmap_status,
  expected_date DATE,
  completed_date DATE,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pr.id,
    pr.project_id,
    pr.title,
    pr.description,
    pr.status,
    pr.expected_date,
    pr.completed_date,
    pr.order_index,
    pr.created_at
  FROM project_roadmap pr
  JOIN projects p ON pr.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY pr.order_index;
$$;

-- Create get_public_properties function with proper enum types
CREATE OR REPLACE FUNCTION get_public_properties(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  address TEXT,
  sf TEXT,
  people_capacity TEXT,
  price_per_sf TEXT,
  monthly_cost TEXT,
  expected_monthly_cost TEXT,
  contract_term TEXT,
  availability TEXT,
  lease_type TEXT,
  lease_structure TEXT,
  current_state property_current_state,
  condition TEXT,
  misc_notes TEXT,
  virtual_tour_url TEXT,
  suggestion TEXT,
  flier_url TEXT,
  tour_datetime TIMESTAMP WITH TIME ZONE,
  tour_location TEXT,
  tour_status tour_status,
  status property_status,
  decline_reason TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    prop.id,
    prop.project_id,
    prop.name,
    prop.address,
    prop.sf,
    prop.people_capacity,
    prop.price_per_sf,
    prop.monthly_cost,
    prop.expected_monthly_cost,
    prop.contract_term,
    prop.availability,
    prop.lease_type,
    prop.lease_structure,
    prop.current_state,
    prop.condition,
    prop.misc_notes,
    prop.virtual_tour_url,
    prop.suggestion,
    prop.flier_url,
    prop.tour_datetime,
    prop.tour_location,
    prop.tour_status,
    prop.status,
    prop.decline_reason,
    prop.order_index,
    prop.created_at,
    prop.updated_at
  FROM properties prop
  JOIN projects p ON prop.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY prop.order_index;
$$;

-- Grant execute permissions to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_roadmap(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_properties(UUID) TO anon;
