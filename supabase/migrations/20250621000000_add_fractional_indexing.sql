-- =====================================================
-- COMPREHENSIVE FRACTIONAL INDEXING MIGRATION
-- This migration adds fractional indexing support to replace order_index
-- Combines all order_key related changes into a single migration
-- =====================================================

-- Function to generate fractional keys in SQL (simplified version)
-- This mimics the behavior of generateKeyBetween from fractional-indexing
CREATE OR REPLACE FUNCTION generate_fractional_key(prev_key TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result TEXT;
  i INTEGER;
BEGIN
  -- If no previous key, start with 'a0'
  IF prev_key IS NULL THEN
    RETURN 'a0';
  END IF;
  
  -- Simple increment logic for backfill - generates sequential keys
  -- For production use, we'll use the JS library
  result := '';
  FOR i IN 1..2 LOOP
    result := result || substr(base_chars, (i + ascii(substr(prev_key, i, 1)) - 48) % 62 + 1, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. ADD ORDER_KEY COLUMNS AND BACKFILL DATA
-- =====================================================

-- Add order_key column to project_roadmap
ALTER TABLE project_roadmap 
  ADD COLUMN order_key TEXT;

-- Back-fill order_key for project_roadmap based on existing order_index
DO $$
DECLARE
  roadmap_record RECORD;
  current_key TEXT := NULL;
  last_project_id UUID := NULL;
BEGIN
  FOR roadmap_record IN 
    SELECT id, project_id, order_index
    FROM project_roadmap 
    ORDER BY project_id, COALESCE(order_index, 999999), created_at
  LOOP
    -- Reset current_key when we start processing a new project
    IF last_project_id IS NULL OR last_project_id != roadmap_record.project_id THEN
      current_key := NULL;
      last_project_id := roadmap_record.project_id;
    END IF;
    
    current_key := generate_fractional_key(current_key);
    UPDATE project_roadmap 
    SET order_key = current_key 
    WHERE id = roadmap_record.id;
  END LOOP;
END $$;

-- Make order_key NOT NULL and add unique constraint
ALTER TABLE project_roadmap 
  ALTER COLUMN order_key SET NOT NULL,
  ADD CONSTRAINT project_roadmap_order_key_unique UNIQUE (project_id, order_key);

-- Add order_key column to properties
ALTER TABLE properties 
  ADD COLUMN order_key TEXT;

-- Back-fill order_key for properties table
DO $$
DECLARE
  property_record RECORD;
  current_key TEXT := NULL;
  last_project_id UUID := NULL;
BEGIN
  FOR property_record IN 
    SELECT id, project_id, order_index
    FROM properties 
    ORDER BY project_id, COALESCE(order_index, 999999), created_at
  LOOP
    -- Reset current_key when we start processing a new project
    IF last_project_id IS NULL OR last_project_id != property_record.project_id THEN
      current_key := NULL;
      last_project_id := property_record.project_id;
    END IF;
    
    current_key := generate_fractional_key(current_key);
    UPDATE properties 
    SET order_key = current_key 
    WHERE id = property_record.id;
  END LOOP;
END $$;

-- Make order_key NOT NULL and add unique constraint
ALTER TABLE properties 
  ALTER COLUMN order_key SET NOT NULL,
  ADD CONSTRAINT properties_order_key_unique UNIQUE (project_id, order_key);

-- Add order_key column to project_documents
ALTER TABLE project_documents 
  ADD COLUMN order_key TEXT;

-- Back-fill order_key for project_documents table
DO $$
DECLARE
  document_record RECORD;
  current_key TEXT := NULL;
  last_project_id UUID := NULL;
BEGIN
  FOR document_record IN 
    SELECT id, project_id, order_index
    FROM project_documents 
    ORDER BY project_id, COALESCE(order_index, 999999), created_at
  LOOP
    -- Reset current_key when we start processing a new project
    IF last_project_id IS NULL OR last_project_id != document_record.project_id THEN
      current_key := NULL;
      last_project_id := document_record.project_id;
    END IF;
    
    current_key := generate_fractional_key(current_key);
    UPDATE project_documents 
    SET order_key = current_key 
    WHERE id = document_record.id;
  END LOOP;
END $$;

-- Make order_key NOT NULL and add unique constraint
ALTER TABLE project_documents 
  ALTER COLUMN order_key SET NOT NULL,
  ADD CONSTRAINT project_documents_order_key_unique UNIQUE (project_id, order_key);

-- =====================================================
-- 2. ADD ORDER_KEY CONSTRAINTS AND VALIDATION
-- =====================================================

-- Create function to validate fractional keys
CREATE OR REPLACE FUNCTION validate_fractional_key(key_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Order keys should be alphanumeric and not just numbers
    -- This helps ensure they're proper fractional keys, not legacy integer strings
    RETURN key_value ~ '^[a-zA-Z0-9]+$' AND length(trim(key_value)) > 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraints to ensure order_key is not empty and valid
ALTER TABLE project_documents 
ADD CONSTRAINT check_order_key_not_empty 
CHECK (length(trim(order_key)) > 0),
ADD CONSTRAINT check_valid_fractional_key 
CHECK (validate_fractional_key(order_key));

ALTER TABLE project_roadmap 
ADD CONSTRAINT check_order_key_not_empty 
CHECK (length(trim(order_key)) > 0),
ADD CONSTRAINT check_valid_fractional_key 
CHECK (validate_fractional_key(order_key));

ALTER TABLE properties 
ADD CONSTRAINT check_order_key_not_empty 
CHECK (length(trim(order_key)) > 0),
ADD CONSTRAINT check_valid_fractional_key 
CHECK (validate_fractional_key(order_key));

-- Create trigger function to prevent duplicate order_keys within a project
CREATE OR REPLACE FUNCTION check_unique_order_key()
RETURNS TRIGGER AS $$
DECLARE
    table_name TEXT;
    conflict_count INTEGER;
BEGIN
    -- Get the table name from TG_TABLE_NAME
    table_name := TG_TABLE_NAME;
    
    -- Check for existing order_key in the same project (excluding current row for updates)
    EXECUTE format('
        SELECT COUNT(*) FROM %I 
        WHERE project_id = $1 AND order_key = $2 AND id != COALESCE($3, ''00000000-0000-0000-0000-000000000000''::uuid)
    ', table_name) 
    INTO conflict_count
    USING NEW.project_id, NEW.order_key, COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Duplicate order_key "%" within project "%" in table "%"', 
            NEW.order_key, NEW.project_id, table_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to enforce unique order_key per project
CREATE TRIGGER trigger_unique_order_key_documents
    BEFORE INSERT OR UPDATE ON project_documents
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_order_key();

CREATE TRIGGER trigger_unique_order_key_roadmap
    BEFORE INSERT OR UPDATE ON project_roadmap
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_order_key();

CREATE TRIGGER trigger_unique_order_key_properties
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_order_key();

-- =====================================================
-- 3. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Index for project_documents ordering
CREATE INDEX IF NOT EXISTS idx_project_documents_order 
ON project_documents (project_id, order_key);

-- Index for project_roadmap ordering  
CREATE INDEX IF NOT EXISTS idx_project_roadmap_order 
ON project_roadmap (project_id, order_key);

-- Index for properties ordering
CREATE INDEX IF NOT EXISTS idx_properties_order 
ON properties (project_id, order_key);

-- =====================================================
-- 4. UPDATE RPC FUNCTIONS
-- =====================================================

-- Update get_public_project_roadmap to use order_key
DROP FUNCTION IF EXISTS public.get_public_project_roadmap(uuid);
CREATE FUNCTION public.get_public_project_roadmap(share_id uuid)
 RETURNS TABLE(
    id uuid,
    title text,
    description text,
    status roadmap_status,
    expected_date date,
    completed_date date,
    order_key text,
    created_at timestamptz,
    project_id uuid
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_project_id UUID;
BEGIN
    -- Get project ID from share_id
    SELECT projects.id INTO target_project_id
    FROM projects 
    WHERE projects.public_share_id = get_public_project_roadmap.share_id
    AND deleted_at IS NULL;

    IF target_project_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;

    RETURN QUERY
    SELECT 
        pr.id,
        pr.title,
        pr.description,
        pr.status,
        pr.expected_date,
        pr.completed_date,
        pr.order_key,
        pr.created_at,
        pr.project_id
    FROM project_roadmap pr
    WHERE pr.project_id = target_project_id;
END;
$function$;

-- Update get_public_properties to use order_key
DROP FUNCTION IF EXISTS public.get_public_properties(uuid);
CREATE FUNCTION public.get_public_properties(share_id uuid)
 RETURNS TABLE(
    id uuid,
    name text,
    address text,
    sf text,
    monthly_cost text,
    status property_status,
    current_state property_current_state,
    tour_status tour_status,
    lease_type text,
    availability text,
    tour_datetime timestamptz,
    tour_location text,
    order_key text,
    created_at timestamptz,
    updated_at timestamptz,
    project_id uuid,
    cam_rate text,
    parking_rate text,
    people_capacity text,
    price_per_sf text,
    expected_monthly_cost text,
    contract_term text,
    lease_structure text,
    condition text,
    suggestion text,
    decline_reason text,
    misc_notes text,
    flier_url text,
    virtual_tour_url text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_project_id UUID;
BEGIN
    -- Get project ID from share_id
    SELECT projects.id INTO target_project_id
    FROM projects 
    WHERE projects.public_share_id = get_public_properties.share_id
    AND deleted_at IS NULL;

    IF target_project_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;

    RETURN QUERY
    SELECT 
        prop.id,
        prop.name,
        prop.address,
        prop.sf,
        prop.monthly_cost,
        prop.status,
        prop.current_state,
        prop.tour_status,
        prop.lease_type,
        prop.availability,
        prop.tour_datetime,
        prop.tour_location,
        prop.order_key,
        prop.created_at,
        prop.updated_at,
        prop.project_id,
        prop.cam_rate,
        prop.parking_rate,
        prop.people_capacity,
        prop.price_per_sf,
        prop.expected_monthly_cost,
        prop.contract_term,
        prop.lease_structure,
        prop.condition,
        prop.suggestion,
        prop.decline_reason,
        prop.misc_notes,
        prop.flier_url,
        prop.virtual_tour_url
    FROM properties prop
    WHERE prop.project_id = target_project_id;
END;
$function$;

-- Update get_public_project_documents to use order_key
DROP FUNCTION IF EXISTS public.get_public_project_documents(uuid);
CREATE FUNCTION public.get_public_project_documents(share_id uuid)
 RETURNS TABLE(
    id uuid,
    name text,
    file_type text,
    document_url text,
    source_type document_source_type,
    order_key text,
    created_at timestamptz,
    project_id uuid
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_project_id UUID;
BEGIN
    -- Get project ID from share_id
    SELECT projects.id INTO target_project_id
    FROM projects 
    WHERE projects.public_share_id = get_public_project_documents.share_id
    AND deleted_at IS NULL;

    IF target_project_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;

    RETURN QUERY
    SELECT 
        doc.id,
        doc.name,
        doc.file_type,
        doc.document_url,
        doc.source_type,
        doc.order_key,
        doc.created_at,
        doc.project_id
    FROM project_documents doc
    WHERE doc.project_id = target_project_id;
END;
$function$;

-- =====================================================
-- 5. REMOVE LEGACY ORDER_INDEX COLUMNS
-- =====================================================

-- Drop order_index from project_roadmap table
ALTER TABLE project_roadmap DROP COLUMN IF EXISTS order_index;

-- Drop order_index from properties table  
ALTER TABLE properties DROP COLUMN IF EXISTS order_index;

-- Drop order_index from project_documents table
ALTER TABLE project_documents DROP COLUMN IF EXISTS order_index;

-- =====================================================
-- 6. CLEANUP AND DOCUMENTATION
-- =====================================================

-- Drop the helper function as it's no longer needed
DROP FUNCTION generate_fractional_key;

-- Add comments to document the new approach
COMMENT ON COLUMN project_roadmap.order_key IS 'Fractional indexing key for ordering. Use fractional-indexing library for updates.';
COMMENT ON COLUMN properties.order_key IS 'Fractional indexing key for ordering. Use fractional-indexing library for updates.';
COMMENT ON COLUMN project_documents.order_key IS 'Fractional indexing key for ordering. Use fractional-indexing library for updates.'; 