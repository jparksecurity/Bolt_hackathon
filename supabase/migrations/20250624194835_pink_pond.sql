-- Migration: Add brokerage field to projects table
-- This allows clients to see which brokerage company is handling their deal

-- Add brokerage field to projects table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'brokerage') THEN
        ALTER TABLE projects ADD COLUMN brokerage TEXT;
    END IF;
END $$;

-- Update the get_public_project function to include brokerage field
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
  expected_contract_value DECIMAL,
  dashboard_card_order JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  contact_name TEXT,
  contact_title TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  commission_paid_by TEXT,
  payment_due TEXT,
  expected_headcount TEXT,
  broker_contact_name TEXT,
  broker_contact_title TEXT,
  broker_contact_phone TEXT,
  broker_contact_email TEXT,
  brokerage TEXT
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
    p.expected_contract_value,
    p.dashboard_card_order,
    p.created_at,
    p.updated_at,
    p.contact_name,
    p.contact_title,
    p.contact_phone,
    p.contact_email,
    p.commission_paid_by,
    p.payment_due,
    p.expected_headcount,
    p.broker_contact_name,
    p.broker_contact_title,
    p.broker_contact_phone,
    p.broker_contact_email,
    p.brokerage
  FROM projects p
  WHERE p.public_share_id = share_id
    AND p.deleted_at IS NULL;
END;
$$;

-- Grant execute permission to anonymous users for public sharing
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;