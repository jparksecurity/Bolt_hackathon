-- =====================================================
-- COMPREHENSIVE SCHEMA UPDATES AND ENUM MIGRATION
-- =====================================================
-- This migration consolidates the following changes:
-- - Add project_status enum and migrate projects table
-- - Add multiple enums for better type safety (roadmap_status, document_source_type, property_status, property_current_state, tour_status)
-- - Migrate project_roadmap, project_documents, and properties tables to use enums
-- - Handle storage_path field correctly 
-- - Add dashboard_card_order field to projects table
-- - Update get_public_project function with proper enum types
-- =====================================================

-- 1. CREATE ALL ENUM TYPES
-- =====================================================

-- Project status enum
CREATE TYPE project_status AS ENUM ('Active', 'Pending', 'Completed', 'On Hold');

-- Roadmap status enum  
CREATE TYPE roadmap_status AS ENUM ('completed', 'in-progress', 'pending');

-- Document source type enum
CREATE TYPE document_source_type AS ENUM ('upload', 'google_drive', 'onedrive', 'url');

-- Property status enum
CREATE TYPE property_status AS ENUM ('new', 'active', 'pending', 'under_review', 'negotiating', 'on_hold', 'declined', 'accepted');

-- Property current state enum
CREATE TYPE property_current_state AS ENUM ('Available', 'Under Review', 'Negotiating', 'On Hold', 'Declined');

-- Tour status enum
CREATE TYPE tour_status AS ENUM ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled');

-- 2. MIGRATE PROJECTS TABLE TO USE project_status ENUM
-- =====================================================

-- Add new enum column for projects
ALTER TABLE projects ADD COLUMN status_enum project_status;

-- Migrate existing project status data
UPDATE projects 
SET status_enum = CASE 
  WHEN status = 'Active' THEN 'Active'::project_status
  WHEN status = 'Pending' THEN 'Pending'::project_status  
  WHEN status = 'Completed' THEN 'Completed'::project_status
  WHEN status = 'On Hold' THEN 'On Hold'::project_status
  ELSE 'Pending'::project_status -- default fallback
END;

-- Make the new column NOT NULL and replace the old one
ALTER TABLE projects ALTER COLUMN status_enum SET NOT NULL;
ALTER TABLE projects DROP COLUMN status;
ALTER TABLE projects RENAME COLUMN status_enum TO status;

-- 3. MIGRATE PROJECT_ROADMAP TABLE TO USE roadmap_status ENUM
-- =====================================================

-- Add new enum column for project_roadmap
ALTER TABLE project_roadmap ADD COLUMN status_enum roadmap_status;

-- Migrate existing roadmap status data
UPDATE project_roadmap 
SET status_enum = CASE 
  WHEN status = 'completed' THEN 'completed'::roadmap_status
  WHEN status = 'in-progress' THEN 'in-progress'::roadmap_status
  WHEN status = 'pending' THEN 'pending'::roadmap_status
  ELSE 'pending'::roadmap_status -- default fallback
END;

-- Make the new column NOT NULL and replace the old one
ALTER TABLE project_roadmap ALTER COLUMN status_enum SET NOT NULL;
ALTER TABLE project_roadmap DROP COLUMN status;
ALTER TABLE project_roadmap RENAME COLUMN status_enum TO status;

-- 4. MIGRATE PROJECT_DOCUMENTS TABLE TO USE document_source_type ENUM
-- =====================================================

-- Add storage_path field temporarily (was missing in some schemas)
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add new enum column for project_documents
ALTER TABLE project_documents ADD COLUMN source_type_enum document_source_type;

-- Migrate existing document source_type data
UPDATE project_documents 
SET source_type_enum = CASE 
  WHEN source_type = 'upload' THEN 'upload'::document_source_type
  WHEN source_type = 'google_drive' THEN 'google_drive'::document_source_type
  WHEN source_type = 'onedrive' THEN 'onedrive'::document_source_type
  WHEN source_type = 'url' THEN 'url'::document_source_type
  ELSE 'url'::document_source_type -- default fallback
END;

-- Make the new column NOT NULL and replace the old one
ALTER TABLE project_documents ALTER COLUMN source_type_enum SET NOT NULL;
ALTER TABLE project_documents DROP COLUMN source_type;
ALTER TABLE project_documents RENAME COLUMN source_type_enum TO source_type;

-- Remove storage_path field (no longer needed)
ALTER TABLE project_documents DROP COLUMN IF EXISTS storage_path;

-- 5. MIGRATE PROPERTIES TABLE TO USE MULTIPLE ENUMS
-- =====================================================

-- Add new enum columns for properties
ALTER TABLE properties ADD COLUMN status_enum property_status;
ALTER TABLE properties ADD COLUMN current_state_enum property_current_state;
ALTER TABLE properties ADD COLUMN tour_status_enum tour_status;

-- Migrate existing property status data
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
END;

-- Migrate existing property current_state data
UPDATE properties 
SET current_state_enum = CASE 
  WHEN current_state = 'Available' THEN 'Available'::property_current_state
  WHEN current_state = 'Under Review' THEN 'Under Review'::property_current_state
  WHEN current_state = 'Negotiating' THEN 'Negotiating'::property_current_state
  WHEN current_state = 'On Hold' THEN 'On Hold'::property_current_state
  WHEN current_state = 'Declined' THEN 'Declined'::property_current_state
  ELSE 'Available'::property_current_state -- default fallback
END;

-- Migrate existing tour_status data (allowing NULL)
UPDATE properties 
SET tour_status_enum = CASE 
  WHEN tour_status = 'Scheduled' THEN 'Scheduled'::tour_status
  WHEN tour_status = 'Completed' THEN 'Completed'::tour_status
  WHEN tour_status = 'Cancelled' THEN 'Cancelled'::tour_status
  WHEN tour_status = 'Rescheduled' THEN 'Rescheduled'::tour_status
  ELSE NULL -- allow NULL for properties without tours
END;

-- Replace old columns with enum columns for properties
ALTER TABLE properties DROP COLUMN status;
ALTER TABLE properties DROP COLUMN current_state;
ALTER TABLE properties DROP COLUMN tour_status;
ALTER TABLE properties RENAME COLUMN status_enum TO status;
ALTER TABLE properties RENAME COLUMN current_state_enum TO current_state;
ALTER TABLE properties RENAME COLUMN tour_status_enum TO tour_status;

-- Make status and current_state NOT NULL but allow tour_status to be NULL
ALTER TABLE properties ALTER COLUMN status SET NOT NULL;
ALTER TABLE properties ALTER COLUMN current_state SET NOT NULL;

-- 6. ADD DASHBOARD CARD ORDER TO PROJECTS TABLE
-- =====================================================

-- Add dashboard card order persistence to projects table
ALTER TABLE projects ADD COLUMN dashboard_card_order JSONB;

-- Create index for better query performance
CREATE INDEX idx_projects_dashboard_card_order ON projects(id) WHERE dashboard_card_order IS NOT NULL;

-- 7. UPDATE ALL PUBLIC FUNCTIONS WITH PROPER ENUM TYPES
-- =====================================================

-- Drop and recreate get_public_project function to include dashboard_card_order and proper enum types
DROP FUNCTION IF EXISTS get_public_project(UUID);

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
  created_at TIMESTAMP WITH TIME ZONE
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
    p.created_at
  FROM projects p
  WHERE p.public_share_id = share_id
    AND p.deleted_at IS NULL;
END;
$$;

-- Drop and recreate get_public_project_roadmap function with proper enum types
DROP FUNCTION IF EXISTS get_public_project_roadmap(UUID);

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

-- Drop and recreate get_public_properties function with proper enum types
DROP FUNCTION IF EXISTS get_public_properties(UUID);

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

-- Grant execute permission to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_roadmap(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_properties(UUID) TO anon; 