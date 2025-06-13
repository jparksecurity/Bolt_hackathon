-- =====================================================
-- ADD TOUR FIELDS TO PROPERTIES TABLE
-- Adds tour scheduling functionality to properties
-- =====================================================

-- Add tour-related fields to properties table
ALTER TABLE properties 
ADD COLUMN tour_datetime TIMESTAMP WITH TIME ZONE,
ADD COLUMN tour_location TEXT,
ADD COLUMN tour_status TEXT;

-- Add CHECK constraint for tour_status
ALTER TABLE properties 
ADD CONSTRAINT properties_tour_status_check 
CHECK (tour_status IS NULL OR tour_status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_tour_datetime ON properties(project_id, tour_datetime) WHERE tour_datetime IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_tour_status ON properties(project_id, tour_status) WHERE tour_status IS NOT NULL;

-- Update the get_public_properties function to include tour fields
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
  contract_term TEXT,
  availability TEXT,
  lease_type TEXT,
  current_state TEXT,
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
    prop.contract_term,
    prop.availability,
    prop.lease_type,
    prop.current_state,
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
