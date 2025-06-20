-- Update get_public_project RPC function to include missing fields
-- This fixes the issue where the public project page was missing contact information and other key fields

-- Drop the existing function first since we're changing the return type
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