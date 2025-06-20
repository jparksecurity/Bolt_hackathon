// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";
import { createRemoteJWKSet, jwtVerify } from "npm:jose";
import { DateTime } from "npm:luxon";

// Zod schema as single source of truth
const UpdateSuggestionSchema = z.object({
  /**
   * A unique identifier generated for each AI suggestion. This **does not**
   * correspond to any record in the database – it is only used for tracking
   * the suggestion in the UI (e.g. as a React key).
   */
  id: z
    .string()
    .describe("Unique identifier for this suggestion (not a DB entity id)"),

  /**
   * The kind of entity that will be affected when the suggestion is applied.
   * Determines which table the update should target on the frontend.
   */
  type: z
    .enum(["project", "property", "client_requirement"])
    .describe("Target entity type"),

  /**
   * The primary-key ID of the existing entity that should be updated.
   */
  entityId: z.string().describe("Database id of the entity to update"),

  /**
   * Human-readable name of the entity – e.g. the project title or property
   * name – useful for showing in the UI and for AI reasoning.
   */
  entityName: z.string().describe("Display name of the entity"),

  /**
   * The specific field/column that is being suggested for change.
   */
  field: z.string().describe("Field to be updated"),

  /**
   * The current value in the database for this field (may be omitted if null
   * or unknown at suggestion-time).
   */
  currentValue: z.string().optional().describe("Existing value (if any)"),

  /**
   * The value the AI recommends setting.
   */
  suggestedValue: z.string().describe("AI-proposed new value"),

  /**
   * Explanation from the AI about why this change is being proposed.
   */
  reasoning: z.string().describe("Rationale for the suggestion"),
});

// Infer TypeScript type from Zod schema
type UpdateSuggestion = z.infer<typeof UpdateSuggestionSchema>;

const UpdateSuggestionsArraySchema = z.array(UpdateSuggestionSchema);

// Basic types for update operations
interface ProjectRecord {
  id: string;
  title: string;
  company_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_title?: string | null;
  desired_move_in_date?: string | null;
  expected_fee?: number | null;
  broker_commission?: number | null;
  expected_headcount?: string | null;
  status: string;
  start_date?: string | null;
  city?: string | null;
  state?: string | null;
}

interface PropertyRecord {
  id: string;
  name: string;
  project_id?: string | null;
  address?: string | null;
  sf?: string | null;
  monthly_cost?: string | null;
  price_per_sf?: string | null;
  people_capacity?: string | null;
  lease_type?: string | null;
  contract_term?: string | null;
  status?: string | null;
  current_state?: string | null;
  availability?: string | null;
  tour_status?: string | null;
  tour_datetime?: string | null;
}

interface ClientRequirementRecord {
  id: string;
  project_id?: string | null;
  category: string;
  requirement_text: string;
}

// Request validation schema
const ProcessRequestSchema = z.object({
  inputText: z.string().min(1, "Input text is required"),
});

const generateAISuggestions = async (
  text: string,
  projects: ProjectRecord[],
  properties: PropertyRecord[],
  clientRequirements: ClientRequirementRecord[],
): Promise<UpdateSuggestion[]> => {
  // Initialize LangChain with Google Generative AI
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-preview-05-20",
    apiKey: Deno.env.get("GOOGLE_API_KEY") ?? "",
    temperature: 0,
  });

  // Create structured output chain
  const structuredModel = model.withStructuredOutput(
    UpdateSuggestionsArraySchema,
  );

  // Create streamlined context with only fields useful for AI suggestions
  const context = {
    projects: projects.map((project) => {
      // Get all related data for this specific project
      const projectProperties = properties.filter(
        (p) => p.project_id === project.id,
      );
      const projectRequirements = clientRequirements.filter(
        (cr) => cr.project_id === project.id,
      );

      return {
        // Essential project info
        id: project.id,
        title: project.title,
        status: project.status,

        // Contact information (commonly extracted from text)
        company_name: project.company_name,
        contact_name: project.contact_name,
        contact_email: project.contact_email,
        contact_phone: project.contact_phone,
        contact_title: project.contact_title,

        // Location (commonly mentioned in communications)
        city: project.city,
        state: project.state,

        // Timeline (commonly mentioned in communications)
        desired_move_in_date: project.desired_move_in_date,
        start_date: project.start_date,

        // Financial (commonly extracted)
        expected_fee: project.expected_fee,
        broker_commission: project.broker_commission,

        // Requirements
        expected_headcount: project.expected_headcount,

        // Related data - only essential fields
        properties: projectProperties.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          sf: p.sf,
          monthly_cost: p.monthly_cost,
          price_per_sf: p.price_per_sf,
          people_capacity: p.people_capacity,
          lease_type: p.lease_type,
          contract_term: p.contract_term,
          status: p.status,
          current_state: p.current_state,
          availability: p.availability,
          tour_status: p.tour_status,
          tour_datetime: p.tour_datetime,
        })),

        client_requirements: projectRequirements.map((cr) => ({
          id: cr.id,
          category: cr.category,
          requirement_text: cr.requirement_text,
        })),
      };
    }),
  };

  const prompt = `You are an AI assistant specialized in commercial real estate project management. Analyze the provided text and suggest intelligent updates to existing project data.

INPUT TEXT TO ANALYZE:
"${text}"

CURRENT PROJECT DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Your task: Generate intelligent suggestions for updating existing project data based on the input text. 

IMPORTANT INSTRUCTIONS:
1. ONLY suggest updates to existing entities - do not create new records
2. Only suggest updates for fields that have clear, confident matches in the input text
3. Suggest realistic values that match the field data types
4. Provide clear reasoning for each suggestion
5. Return an array of update suggestions
6. If the entity has no existing value for a field, omit the "currentValue" property entirely

Focus on extracting and updating:

**PROJECT FIELDS (for existing projects):**
- Contact information (contact_name, contact_email, contact_phone, contact_title)
- Company details (company_name)
- Location information (city, state)
- Financial data (expected_fee, broker_commission, commission_paid_by, payment_due)
- Timeline (desired_move_in_date, start_date)
- Requirements (expected_headcount)
- Status updates

**PROPERTY FIELDS (for existing properties):**
- Basic details (name, address, sf, people_capacity)
- Financial (monthly_cost, expected_monthly_cost, price_per_sf)
- Lease terms (lease_type, lease_structure, contract_term)
- Status (status, current_state, availability, condition)
- Additional info (suggestion, misc_notes, decline_reason)
- Tour details (tour_status, tour_datetime, tour_location)

**CLIENT REQUIREMENT FIELDS (for existing requirements):**
- Update requirement text or category based on new information

**IDENTIFIERS:**
- For **every** suggestion:
  - id should be a unique suggestion identifier (can be any string) – _not_ a DB id.
  - entityId must be the DB primary-key of the existing entity you intend to update.

If you cannot confidently determine the appropriate entityId for an existing entity, do **not** emit the suggestion.

**RELATIONSHIP AWARENESS:**
- Each project contains its own nested properties and requirements
- When suggesting updates, consider the specific project context and its related data
- Only suggest updates to entities that already exist in the provided context
- Consider property-specific details when making property suggestions within a project context

### DATA FORMAT RULES (MANDATORY)
- **Numeric & Monetary fields** (expected_fee, broker_commission, monthly_cost, expected_monthly_cost, price_per_sf, sf, people_capacity, expected_headcount, etc.) → return a *pure number* with no currency symbols, commas, or units. Example: 46 (not "$46", "46 NNN", or "46 per sf").
- **Date fields** (desired_move_in_date, start_date) → use ISO-8601 format YYYY-MM-DD.
- **DateTime fields** (tour_datetime) → use full ISO-8601 timestamp format YYYY-MM-DDTHH:mm:ss when time is known; otherwise YYYY-MM-DD.
- **Enum-constrained fields** – return the value exactly as listed below (case sensitive):
  • status: "active" | "new" | "pending" | "declined"
  • current_state: "Available" | "Under Review" | "Negotiating" | "On Hold" | "Declined"
  • tour_status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled"
- If the input text suggests a value that does **not** conform to these rules, **omit** that suggestion entirely.

These formatting rules are critical for downstream processing – any suggestion that violates them will be discarded.`;

  try {
    const suggestions = await structuredModel.invoke(prompt);
    return suggestions;
  } catch (error) {
    console.error("Error calling LangChain structured output:", error);
    // Fallback to empty suggestions if AI fails
    return [];
  }
};

Deno.serve(async (req) => {
  try {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify Clerk JWT manually since Edge Functions don't support third-party auth
    const authHeader = req.headers.get("Authorization");
    let clerkUserId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7); // Remove 'Bearer ' prefix

      // Get potential Clerk domains from environment
      const clerkDomain = Deno.env.get("CLERK_DOMAIN");
      const clerkDomain2 = Deno.env.get("CLERK_DOMAIN_2"); // Second instance

      const domainsToTry = [clerkDomain, clerkDomain2].filter(Boolean);

      if (domainsToTry.length === 0) {
        return new Response(
          JSON.stringify({ error: "No Clerk domains configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      let lastError: Error | null = null;

      // Try each Clerk domain until one works
      for (const domain of domainsToTry) {
        try {
          console.log(`Attempting to verify JWT with Clerk domain: ${domain}`);

          // Verify the JWT with Clerk's JWKS
          const issuer = `https://${domain}`;
          const jwks = createRemoteJWKSet(
            new URL(`${issuer}/.well-known/jwks.json`),
          );

          const { payload } = await jwtVerify(token, jwks, {
            issuer,
          });

          clerkUserId = payload.sub || null;
          console.log(
            `Successfully verified Clerk JWT for user: ${clerkUserId} using domain: ${domain}`,
          );
          break; // Success, exit the loop
        } catch (error) {
          console.error(`Failed to verify JWT with domain ${domain}:`, error);
          lastError = error as Error;
          continue; // Try the next domain
        }
      }

      // If all domains failed, return error
      if (!clerkUserId && lastError) {
        console.error("All Clerk domains failed JWT verification:", lastError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired JWT token" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Create Supabase client with optional auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      clerkUserId
        ? {
            accessToken: async () => authHeader?.slice(7) || null,
          }
        : {},
    );

    // Parse and validate request body
    const requestBody = await req.json();
    const parseResult = ProcessRequestSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: parseResult.error.issues,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { inputText } = parseResult.data;

    // First get non-deleted projects to get their IDs
    const projectsResult = await supabaseClient
      .from("projects")
      .select("*")
      .is("deleted_at", null);

    if (projectsResult.error) {
      console.error("Error fetching projects:", projectsResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch projects" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const projects = projectsResult.data || [];
    const projectIds = projects.map((p) => p.id);

    // If no projects found, return empty results
    if (projectIds.length === 0) {
      const data = {
        success: true,
        suggestions: [],
        processed_at: DateTime.now().toISO() || "",
        input_length: inputText.length,
      };

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query related data only for non-deleted projects
    const [propertiesResult, clientRequirementsResult] = await Promise.all([
      supabaseClient
        .from("properties")
        .select("*")
        .in("project_id", projectIds),
      supabaseClient
        .from("client_requirements")
        .select("*")
        .in("project_id", projectIds),
    ]);

    // Check for errors in the related data queries
    const errors = [
      propertiesResult.error,
      clientRequirementsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Error fetching related data:", errors);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch related project data",
          details: errors,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate AI-powered suggestions based on the input text and all project data
    const suggestions = await generateAISuggestions(
      inputText,
      projects,
      propertiesResult.data || [],
      clientRequirementsResult.data || [],
    );

    const data = {
      success: true,
      suggestions,
      processed_at: DateTime.now().toISO() || "",
      input_length: inputText.length,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Set your Google API key: `export GOOGLE_API_KEY=your_google_api_key_here`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/project-intelligence' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"inputText":"We need 5,000 sq ft office space at $30/sq ft. Contact: John Smith (john@company.com). Move-in by March 2024. Require parking spaces and conference rooms."}'

*/
