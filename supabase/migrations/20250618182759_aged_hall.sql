-- =====================================================
-- ADD LOCATION FIELDS TO PROJECTS TABLE
-- Adds city and state fields for quick location identification
-- =====================================================

-- Add location fields to projects table
ALTER TABLE projects 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT;

-- Add indexes for better query performance on location fields
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(state, city) WHERE state IS NOT NULL OR city IS NOT NULL;

-- Update the get_public_project function to include location fields
DROP FUNCTION IF EXISTS get_public_project(UUID);

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
  city TEXT,
  state TEXT,
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
    p.city,
    p.state,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL;
$$;

-- Grant execute permission to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;