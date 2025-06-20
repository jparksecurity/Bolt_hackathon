-- =====================================================
-- ADD CLIENT TOUR AVAILABILITY TABLE
-- Allows clients to propose tour availability through public project pages
-- =====================================================

-- Create client_tour_availability table
CREATE TABLE client_tour_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_name TEXT,
  client_email TEXT,
  proposed_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE client_tour_availability ENABLE ROW LEVEL SECURITY;

-- Add policy for authenticated users to view their project's availability requests
CREATE POLICY "Users can view availability for their projects" ON client_tour_availability
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Add policy for anonymous users to insert availability for publicly shared projects
CREATE POLICY "Anonymous users can submit availability for shared projects" ON client_tour_availability
  FOR INSERT TO anon WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
        AND public_share_id IS NOT NULL 
        AND deleted_at IS NULL
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_tour_availability_project_id ON client_tour_availability(project_id);
CREATE INDEX IF NOT EXISTS idx_client_tour_availability_datetime ON client_tour_availability(project_id, proposed_datetime);

-- Create function to get client tour availability for public projects
CREATE OR REPLACE FUNCTION get_public_client_tour_availability(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  client_name TEXT,
  client_email TEXT,
  proposed_datetime TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    cta.id,
    cta.project_id,
    cta.client_name,
    cta.client_email,
    cta.proposed_datetime,
    cta.notes,
    cta.created_at
  FROM client_tour_availability cta
  JOIN projects p ON cta.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY cta.proposed_datetime;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION get_public_client_tour_availability(UUID) TO anon;