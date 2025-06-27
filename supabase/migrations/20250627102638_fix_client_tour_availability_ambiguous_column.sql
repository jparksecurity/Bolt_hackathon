-- =====================================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN CLIENT TOUR AVAILABILITY
-- =====================================================
-- This migration fixes the ambiguous column reference error in the
-- submit_client_tour_availability function by using underscore-prefixed
-- parameter names to avoid conflicts with table column names
-- =====================================================

-- Drop all versions of the function that have ambiguous column references
DROP FUNCTION IF EXISTS submit_client_tour_availability(UUID, timestamptz[], text, text, text);
DROP FUNCTION IF EXISTS submit_client_tour_availability(uuid, timestamptz[], text, text, text, text, text);

-- Recreate only the function we actually use (5 parameters, returns integer)
CREATE OR REPLACE FUNCTION submit_client_tour_availability(
  _share_id uuid,
  _proposed_slots timestamptz[],
  _client_name text DEFAULT NULL,
  _client_email text DEFAULT NULL,
  _notes text DEFAULT NULL
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
  SELECT p.id INTO target_project_id
  FROM projects p
  WHERE p.public_share_id = _share_id
  AND p.deleted_at IS NULL;

  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found or not accessible';
  END IF;

  -- Insert each proposed slot
  FOREACH slot IN ARRAY _proposed_slots
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
      _client_name,
      _client_email,
      _notes
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
GRANT EXECUTE ON FUNCTION submit_client_tour_availability(UUID, timestamptz[], text, text, text) TO anon;