-- =====================================================
-- COMPLETE SCHEMA UPDATE FOR ENHANCED PROPERTIES & URL-ONLY DOCUMENTS
-- Updates properties table and converts documents to URL-only system
-- =====================================================

-- =====================================
-- 1. UPDATE PROJECTS TABLE
-- =====================================

-- Add desired_move_in_date field to projects
ALTER TABLE projects 
ADD COLUMN desired_move_in_date DATE;

-- Add contact fields to projects (single contact per project)
ALTER TABLE projects 
ADD COLUMN contact_name TEXT,
ADD COLUMN contact_title TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_email TEXT;

-- =====================================
-- 2. UPDATE PROPERTIES TABLE
-- =====================================

-- Add new property fields
ALTER TABLE properties 
ADD COLUMN address TEXT,
ADD COLUMN sf TEXT,
ADD COLUMN people_capacity TEXT,
ADD COLUMN price_per_sf TEXT,
ADD COLUMN monthly_cost TEXT,
ADD COLUMN contract_term TEXT,
ADD COLUMN current_state TEXT,
ADD COLUMN misc_notes TEXT,
ADD COLUMN virtual_tour_url TEXT,
ADD COLUMN suggestion TEXT,
ADD COLUMN flier_url TEXT;

-- Add CHECK constraint for current_state
ALTER TABLE properties 
ADD CONSTRAINT properties_current_state_check 
CHECK (current_state IS NULL OR current_state IN ('Available', 'Under Review', 'Negotiating', 'On Hold', 'Declined'));

-- Migrate existing data before dropping columns
UPDATE properties 
SET 
  sf = size,
  misc_notes = description
WHERE size IS NOT NULL OR description IS NOT NULL;

-- Drop deprecated columns
ALTER TABLE properties 
DROP COLUMN size,
DROP COLUMN rent,
DROP COLUMN description,
DROP COLUMN service_type;

-- Update the existing CHECK constraint for lease_type (remove service_type reference)
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_lease_type_check;

ALTER TABLE properties 
ADD CONSTRAINT properties_lease_type_check 
CHECK (lease_type IS NULL OR lease_type IN ('Direct Lease', 'Sublease', 'Sub-sublease'));

-- =====================================
-- 3. REMOVE STORAGE INFRASTRUCTURE FIRST
-- =====================================

-- Remove storage policies first (these depend on functions)
DROP POLICY IF EXISTS "Users can upload to their project folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their project files" ON storage.objects;
DROP POLICY IF EXISTS "Public document access for shared projects" ON storage.objects;

-- Drop storage-related functions after policies
DROP FUNCTION IF EXISTS get_public_document_info(UUID, UUID);
DROP FUNCTION IF EXISTS user_owns_project(TEXT);

-- Remove storage bucket (this might fail if bucket contains files)
-- Note: In production, manually clean up files first
DELETE FROM storage.buckets WHERE id = 'project-documents';

-- =====================================
-- 3.5. REMOVE PROPERTY FEATURES SYSTEM
-- =====================================

-- Drop property features table (UI now uses direct URL fields)
DROP TABLE IF EXISTS property_features CASCADE;

-- Remove the public function for property features
DROP FUNCTION IF EXISTS get_public_property_features(UUID);

-- =====================================
-- 3.6. MIGRATE AND REMOVE PROJECT_CONTACTS TABLE
-- =====================================

-- Migrate existing contact data to projects table
UPDATE projects 
SET 
  contact_name = pc.name,
  contact_title = pc.title,
  contact_phone = pc.phone,
  contact_email = pc.email
FROM project_contacts pc 
WHERE pc.project_id = projects.id AND pc.is_primary = true;

-- Drop project_contacts table (no longer needed)
DROP TABLE IF EXISTS project_contacts CASCADE;

-- =====================================
-- 4. UPDATE PROJECT DOCUMENTS TABLE
-- =====================================

-- Add document_url and source_type columns
ALTER TABLE project_documents 
ADD COLUMN document_url TEXT,
ADD COLUMN source_type TEXT DEFAULT 'upload';

-- Migrate any existing data (set placeholder URLs for existing records)
UPDATE project_documents 
SET document_url = 'https://example.com/placeholder-document'
WHERE storage_path IS NOT NULL;

-- Make document_url required and drop storage_path
ALTER TABLE project_documents 
ALTER COLUMN document_url SET NOT NULL,
DROP COLUMN storage_path;

-- Add constraint for source_type
ALTER TABLE project_documents 
ADD CONSTRAINT project_documents_source_type_check 
CHECK (source_type IN ('upload', 'google_drive', 'onedrive', 'url'));

-- =====================================
-- 5. UPDATE PUBLIC FUNCTIONS
-- =====================================

-- Drop existing functions that need parameter changes
DROP FUNCTION IF EXISTS get_public_project(UUID);
DROP FUNCTION IF EXISTS get_public_properties(UUID);
DROP FUNCTION IF EXISTS get_public_project_documents(UUID);
DROP FUNCTION IF EXISTS get_public_project_contacts(UUID);

-- Update get_public_project function to include contact fields
CREATE FUNCTION get_public_project(share_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  start_date DATE,
  desired_move_in_date DATE,
  expected_fee DECIMAL(10,2),
  broker_commission DECIMAL(10,2),
  commission_paid_by TEXT,
  payment_due TEXT,
  company_name TEXT,
  expected_headcount TEXT,
  contact_name TEXT,
  contact_title TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.title,
    p.status,
    p.start_date,
    p.desired_move_in_date,
    p.expected_fee,
    p.broker_commission,
    p.commission_paid_by,
    p.payment_due,
    p.company_name,
    p.expected_headcount,
    p.contact_name,
    p.contact_title,
    p.contact_phone,
    p.contact_email,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL;
$$;

-- Update get_public_properties function to include all new fields
CREATE FUNCTION get_public_properties(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  address TEXT,
  sf TEXT,
  people_capacity TEXT,
  price_per_sf TEXT,
  monthly_cost TEXT,
  contract_term TEXT,
  availability TEXT,
  lease_type TEXT,
  current_state TEXT,
  misc_notes TEXT,
  virtual_tour_url TEXT,
  suggestion TEXT,
  flier_url TEXT,
  status TEXT,
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
    prop.contract_term,
    prop.availability,
    prop.lease_type,
    prop.current_state,
    prop.misc_notes,
    prop.virtual_tour_url,
    prop.suggestion,
    prop.flier_url,
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

-- Update get_public_project_documents function to return document_url and source_type
CREATE FUNCTION get_public_project_documents(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  file_type TEXT,
  document_url TEXT,
  source_type TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pd.id,
    pd.project_id,
    pd.name,
    pd.file_type,
    pd.document_url,
    pd.source_type,
    pd.order_index,
    pd.created_at
  FROM project_documents pd
  JOIN projects p ON pd.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY pd.order_index;
$$;

-- =====================================
-- 6. ADD INDEXES FOR NEW FIELDS
-- =====================================

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_properties_current_state ON properties(project_id, current_state) WHERE current_state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(project_id) WHERE address IS NOT NULL;

-- =====================================
-- MIGRATION COMPLETE
-- =====================================

-- Add comment to track this migration
COMMENT ON TABLE properties IS 'Updated to support comprehensive property information with URL-based documents';
COMMENT ON TABLE project_documents IS 'Converted to URL-only system (no file storage)';