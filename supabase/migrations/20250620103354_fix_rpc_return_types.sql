-- =====================================================
-- FIX RPC RETURN TYPES
-- =====================================================
-- This migration fixes the RPC functions to return strongly-typed
-- TABLE results instead of generic JSON for better TypeScript support
-- =====================================================

-- Drop existing functions that return JSON
DROP FUNCTION IF EXISTS get_public_project(UUID);
DROP FUNCTION IF EXISTS get_public_project_roadmap(UUID);
DROP FUNCTION IF EXISTS get_public_properties(UUID);
DROP FUNCTION IF EXISTS submit_client_tour_availability(UUID, timestamptz[], text, text, text, text, text);

-- Create get_public_project function with strongly-typed return
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

-- Create get_public_project_roadmap function with strongly-typed return
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

-- Create get_public_properties function with strongly-typed return
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

-- Create submit_client_tour_availability function with simple return type
CREATE OR REPLACE FUNCTION submit_client_tour_availability(
  share_id uuid,
  proposed_slots timestamptz[],
  client_name text DEFAULT NULL,
  client_email text DEFAULT NULL,
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

-- Grant execute permissions to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_roadmap(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_properties(UUID) TO anon;
GRANT EXECUTE ON FUNCTION submit_client_tour_availability(UUID, timestamptz[], text, text, text) TO anon;
