-- Migration: Move client tour availability to RPC and tighten RLS
-- This migration:
-- 1. Adds UPDATE and DELETE RLS policies for authenticated brokers
-- 2. Adds UNIQUE constraint to prevent duplicate submissions
-- 3. Creates submit_client_tour_availability RPC function
-- 4. Drops unused get_public_client_tour_availability function

-- Add UPDATE RLS policy for authenticated brokers
CREATE POLICY "Brokers can update availability for their projects" ON client_tour_availability
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = client_tour_availability.project_id 
      AND projects.clerk_user_id = (auth.jwt() ->> 'sub')
      AND projects.deleted_at IS NULL
    )
  );

-- Add DELETE RLS policy for authenticated brokers  
CREATE POLICY "Brokers can delete availability for their projects" ON client_tour_availability
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = client_tour_availability.project_id 
      AND projects.clerk_user_id = (auth.jwt() ->> 'sub')
      AND projects.deleted_at IS NULL
    )
  );

-- Add composite UNIQUE constraint to prevent duplicate submissions
ALTER TABLE client_tour_availability 
ADD CONSTRAINT unique_project_client_datetime 
UNIQUE (project_id, client_email, proposed_datetime);

-- Create the submit_client_tour_availability RPC function
CREATE OR REPLACE FUNCTION submit_client_tour_availability(
  share_id uuid,
  proposed_slots timestamptz[],
  client_name text DEFAULT NULL,
  client_email text DEFAULT NULL,
  notes text DEFAULT NULL
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_project_id uuid;
  slot_count int := 0;
  proposed_slot timestamptz;
BEGIN
  -- Look up project_id from projects using share_id
  SELECT id INTO target_project_id
  FROM projects 
  WHERE public_share_id = share_id 
  AND deleted_at IS NULL;
  
  -- Require project exists and isn't deleted
  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or deleted project share ID';
  END IF;
  
  -- Insert one row for every slot in proposed_slots
  FOREACH proposed_slot IN ARRAY proposed_slots
  LOOP
    BEGIN
      INSERT INTO client_tour_availability (
        project_id,
        client_name,
        client_email,
        proposed_datetime,
        notes
      ) VALUES (
        target_project_id,
        client_name,
        client_email,
        proposed_slot,
        notes
      );
      slot_count := slot_count + 1;
    EXCEPTION
      WHEN unique_violation THEN
        -- Skip duplicate entries silently
        CONTINUE;
    END;
  END LOOP;
  
  -- Return the number of rows inserted
  RETURN slot_count;
END;
$$;

-- Grant EXECUTE permission to anon role
GRANT EXECUTE ON FUNCTION submit_client_tour_availability(uuid, timestamptz[], text, text, text) TO anon;