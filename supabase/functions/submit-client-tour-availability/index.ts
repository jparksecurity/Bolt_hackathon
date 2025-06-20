// Edge Function for submitting client tour availability
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SubmitAvailabilityRequest {
  shareId: string;
  clientName?: string;
  clientEmail?: string;
  proposedSlots: string[]; // Array of ISO datetime strings
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const requestBody: SubmitAvailabilityRequest = await req.json();
    const { shareId, clientName, clientEmail, proposedSlots, notes } = requestBody;

    // Validate required fields
    if (!shareId || !proposedSlots || proposedSlots.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: shareId and proposedSlots are required" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client (no auth needed for this operation)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // First, verify that the shareId corresponds to a valid, publicly shared project
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("public_share_id", shareId)
      .is("deleted_at", null)
      .single();

    if (projectError || !projects) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired share link" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const projectId = projects.id;

    // Validate and parse proposed datetime slots
    const validSlots: Date[] = [];
    for (const slot of proposedSlots) {
      try {
        const date = new Date(slot);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${slot}`);
        }
        validSlots.push(date);
      } catch {
        return new Response(
          JSON.stringify({ 
            error: `Invalid datetime format: ${slot}. Please use ISO format.` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Insert availability records for each proposed slot
    const availabilityRecords = validSlots.map(datetime => ({
      project_id: projectId,
      client_name: clientName?.trim() || null,
      client_email: clientEmail?.trim() || null,
      proposed_datetime: datetime.toISOString(),
      notes: notes?.trim() || null,
    }));

    const { error: insertError } = await supabase
      .from("client_tour_availability")
      .insert(availabilityRecords);

    if (insertError) {
      console.error("Error inserting availability records:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit availability. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Tour availability submitted successfully",
        slotsSubmitted: validSlots.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});