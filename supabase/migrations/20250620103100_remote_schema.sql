drop function if exists "public"."get_public_project"(share_id uuid);

drop function if exists "public"."get_public_project_roadmap"(share_id uuid);

drop function if exists "public"."get_public_properties"(share_id uuid);

drop function if exists "public"."submit_client_tour_availability"(share_id uuid, proposed_slots timestamp with time zone[], client_name text, client_email text, client_phone text, client_company text, notes text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.submit_client_tour_availability(share_id uuid, proposed_slots timestamp with time zone[], client_name text DEFAULT NULL::text, client_email text DEFAULT NULL::text, notes text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_public_project(share_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    project_data JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'share_id', p.share_id,
        'name', p.name,
        'description', p.description,
        'status', p.status,
        'location', p.location,
        'price_range', p.price_range,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'tags', p.tags,
        'dashboard_card_order', p.dashboard_card_order
    ) INTO project_data
    FROM projects p
    WHERE p.share_id = get_public_project.share_id
    AND p.deleted_at IS NULL;
    
    IF project_data IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;
    
    RETURN project_data;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_public_project_roadmap(share_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    roadmap_data JSON;
    target_project_id UUID;
BEGIN
    -- Get project ID from share_id
    SELECT id INTO target_project_id
    FROM projects 
    WHERE projects.share_id = get_public_project_roadmap.share_id
    AND deleted_at IS NULL;

    IF target_project_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', pr.id,
            'title', pr.title,
            'description', pr.description,
            'status', pr.status,
            'target_date', pr.target_date,
            'completion_date', pr.completion_date,
            'sort_order', pr.sort_order,
            'created_at', pr.created_at,
            'updated_at', pr.updated_at
        )
        ORDER BY pr.sort_order ASC, pr.created_at ASC
    ) INTO roadmap_data
    FROM project_roadmap pr
    WHERE pr.project_id = target_project_id
    AND pr.deleted_at IS NULL;
    
    RETURN COALESCE(roadmap_data, '[]'::json);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_public_properties(share_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    properties_data JSON;
    target_project_id UUID;
BEGIN
    -- Get project ID from share_id
    SELECT id INTO target_project_id
    FROM projects 
    WHERE projects.share_id = get_public_project_roadmap.share_id
    AND deleted_at IS NULL;

    IF target_project_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or not accessible';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', prop.id,
            'name', prop.name,
            'address', prop.address,
            'description', prop.description,
            'price', prop.price,
            'size_sqft', prop.size_sqft,
            'status', prop.status,
            'current_state', prop.current_state,
            'tour_status', prop.tour_status,
            'lease_type', prop.lease_type,
            'availability_date', prop.availability_date,
            'tour_date', prop.tour_date,
            'tour_time', prop.tour_time,
            'created_at', prop.created_at,
            'updated_at', prop.updated_at
        )
        ORDER BY prop.created_at DESC
    ) INTO properties_data
    FROM properties prop
    WHERE prop.project_id = target_project_id
    AND prop.deleted_at IS NULL;
    
    RETURN COALESCE(properties_data, '[]'::json);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_client_tour_availability(share_id uuid, proposed_slots timestamp with time zone[], client_name text DEFAULT NULL::text, client_email text DEFAULT NULL::text, client_phone text DEFAULT NULL::text, client_company text DEFAULT NULL::text, notes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_project_id uuid;
  slot timestamptz;
  inserted_count integer := 0;
  result_data json;
BEGIN
  -- Get project ID from share_id (RLS bypassed since this is SECURITY DEFINER)
  SELECT id INTO target_project_id
  FROM projects 
  WHERE share_id = submit_client_tour_availability.share_id
  AND deleted_at IS NULL;

  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found or not accessible';
  END IF;

  -- Insert each proposed slot
  FOREACH slot IN ARRAY proposed_slots
  LOOP
    INSERT INTO client_tour_availability (
      project_id,
      proposed_datetime,
      client_name,
      client_email,
      client_phone,
      client_company,
      notes
    ) VALUES (
      target_project_id,
      slot,
      client_name,
      client_email,
      client_phone,
      client_company,
      notes
    )
    ON CONFLICT (project_id, client_email, proposed_datetime) DO NOTHING;
    
    -- Count successful insertions
    IF FOUND THEN
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;

  -- Return summary
  SELECT json_build_object(
    'success', true,
    'inserted_slots', inserted_count,
    'total_proposed', array_length(proposed_slots, 1),
    'project_id', target_project_id
  ) INTO result_data;

  RETURN result_data;
END;
$function$
;


