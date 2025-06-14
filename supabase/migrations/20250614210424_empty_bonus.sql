-- =====================================================
-- FIX LEASE TYPE CONSTRAINT IN PROPERTIES TABLE
-- Adds missing lease_structure column and updates constraints
-- =====================================================

-- First, add the missing lease_structure column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'lease_structure'
    ) THEN
        ALTER TABLE properties ADD COLUMN lease_structure TEXT;
    END IF;
END $$;

-- Drop the existing lease_type constraint if it exists
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_lease_type_check;

-- Add the correct lease_type constraint that includes all valid options
ALTER TABLE properties 
ADD CONSTRAINT properties_lease_type_check 
CHECK (lease_type IS NULL OR lease_type IN ('Direct Lease', 'Sublease', 'Sub-sublease', 'Coworking'));

-- Add constraint for lease_structure
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_lease_structure_check;

ALTER TABLE properties 
ADD CONSTRAINT properties_lease_structure_check 
CHECK (lease_structure IS NULL OR lease_structure IN ('NNN', 'Full Service'));

-- Update the get_public_properties function to include lease_structure
DROP FUNCTION IF EXISTS get_public_properties(UUID);

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
  expected_monthly_cost TEXT,
  contract_term TEXT,
  availability TEXT,
  lease_type TEXT,
  lease_structure TEXT,
  current_state TEXT,
  condition TEXT,
  misc_notes TEXT,
  virtual_tour_url TEXT,
  suggestion TEXT,
  flier_url TEXT,
  tour_datetime TIMESTAMP WITH TIME ZONE,
  tour_location TEXT,
  tour_status TEXT,
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