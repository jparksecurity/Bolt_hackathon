-- =====================================================
-- ADD CAM RATE AND PARKING RATE FIELDS TO PROPERTIES TABLE
-- Adds CAM (Common Area Maintenance) rate and parking rate fields
-- =====================================================

-- Add CAM rate and parking rate fields to properties table
ALTER TABLE properties 
ADD COLUMN cam_rate TEXT,
ADD COLUMN parking_rate TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_cam_rate ON properties(project_id) WHERE cam_rate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_parking_rate ON properties(project_id) WHERE parking_rate IS NOT NULL;

-- Update the get_public_properties function to include the new fields
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
  cam_rate TEXT,
  parking_rate TEXT,
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
    prop.cam_rate,
    prop.parking_rate,
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