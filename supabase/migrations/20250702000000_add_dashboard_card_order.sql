-- Add dashboard card order persistence to projects table
ALTER TABLE projects
  ADD COLUMN dashboard_card_order JSONB;

-- Create index for better query performance
CREATE INDEX idx_projects_dashboard_card_order ON projects(id) WHERE dashboard_card_order IS NOT NULL;

-- Drop and recreate get_public_project function to include dashboard_card_order
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
  status TEXT,
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

-- Grant execute permission to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon; 