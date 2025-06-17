// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenAI } from 'npm:@google/genai'
import { corsHeaders } from '../_shared/cors.ts'

interface UpdateSuggestion {
  id: string;
  type: 'project' | 'property' | 'client_requirement';
  action: 'create' | 'update';
  entityId?: string;
  entityName: string;
  field: string;
  currentValue: string | null;
  suggestedValue: string;
  reasoning: string;
}

interface Project {
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
  commission_paid_by?: string | null;
  payment_due?: string | null;
  expected_headcount?: string | null;
  status: string;
  start_date?: string | null;
  clerk_user_id: string;
  public_share_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

interface Property {
  id: string;
  name: string;
  project_id?: string | null;
  address?: string | null;
  sf?: string | null;
  monthly_cost?: string | null;
  expected_monthly_cost?: string | null;
  price_per_sf?: string | null;
  people_capacity?: string | null;
  availability?: string | null;
  condition?: string | null;
  lease_type?: string | null;
  lease_structure?: string | null;
  contract_term?: string | null;
  status?: string | null;
  current_state?: string | null;
  decline_reason?: string | null;
  suggestion?: string | null;
  misc_notes?: string | null;
  flier_url?: string | null;
  virtual_tour_url?: string | null;
  tour_status?: string | null;
  tour_datetime?: string | null;
  tour_location?: string | null;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ClientRequirement {
  id: string;
  project_id?: string | null;
  category: string;
  requirement_text: string;
  created_at?: string | null;
}

interface ProjectData {
  projects: Project[];
  properties: Property[];
  clientRequirements: ClientRequirement[];
}

interface ProcessRequest {
  inputText: string;
}

const generateAISuggestions = async (text: string, data: ProjectData): Promise<UpdateSuggestion[]> => {
  const { projects, properties, clientRequirements } = data;
  
  // Initialize Gemini AI
  const genAI = new GoogleGenAI({
    apiKey: Deno.env.get('GEMINI_API_KEY') ?? ''
  });

  // Create streamlined context with only fields useful for AI suggestions
  const context = {
    projects: projects.map(project => {
      // Get all related data for this specific project
      const projectProperties = properties.filter(p => p.project_id === project.id);
      const projectRequirements = clientRequirements.filter(cr => cr.project_id === project.id);

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
        
        // Timeline (commonly mentioned in communications)
        desired_move_in_date: project.desired_move_in_date,
        start_date: project.start_date,
        
        // Financial (commonly extracted)
        expected_fee: project.expected_fee,
        broker_commission: project.broker_commission,
        
        // Requirements
        expected_headcount: project.expected_headcount,
        
        // Related data - only essential fields
        properties: projectProperties.map(p => ({
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
          tour_datetime: p.tour_datetime
        })),
        
        client_requirements: projectRequirements.map(cr => ({
          id: cr.id,
          category: cr.category,
          requirement_text: cr.requirement_text
        }))
      };
    })
  };

  const prompt = `
You are an AI assistant specialized in commercial real estate project management. Analyze the provided text and suggest intelligent updates to existing project data.

INPUT TEXT TO ANALYZE:
"${text}"

CURRENT PROJECT DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Your task: Generate intelligent suggestions for updating project data based on the input text. 

IMPORTANT INSTRUCTIONS:
1. Only suggest updates for fields that have clear, confident matches in the input text
2. For new client requirements, extract specific, actionable requirements
3. Suggest realistic values that match the field data types
4. Provide clear reasoning for each suggestion

Return ONLY a valid JSON array of suggestions in this exact format:
[
  {
    "id": "unique-suggestion-id",
    "type": "project" | "property" | "client_requirement",
    "action": "create" | "update",
    "entityId": "entity-id-or-null-for-new",
    "entityName": "human-readable-entity-name",
    "field": "field-name-to-update",
    "currentValue": "current-value-or-null",
    "suggestedValue": "new-suggested-value",
    "reasoning": "Clear explanation of why this suggestion was made"
  }
]

Focus on extracting and updating:

**PROJECT FIELDS:**
- Contact information (contact_name, contact_email, contact_phone, contact_title)
- Company details (company_name)
- Financial data (expected_fee, broker_commission, commission_paid_by, payment_due)
- Timeline (desired_move_in_date, start_date)
- Requirements (expected_headcount)
- Status updates

**PROPERTY FIELDS:**
- Basic details (name, address, sf, people_capacity)
- Financial (monthly_cost, expected_monthly_cost, price_per_sf)
- Lease terms (lease_type, lease_structure, contract_term)
- Status (status, current_state, availability, condition)
- Additional info (suggestion, misc_notes, decline_reason)
- Tour details (tour_status, tour_datetime, tour_location)

**RELATED DATA:**
- Client requirements (new requirements based on "need", "require", "must have")

**RELATIONSHIP AWARENESS:**
- Each project contains its own nested properties and requirements
- When suggesting updates, consider the specific project context and its related data
- Avoid duplicate client requirements by checking existing requirements within each project
- Consider property-specific details when making property suggestions within a project context
`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: prompt
    });
    const responseText = result.text || '';

    // Parse the JSON response
    let suggestions: UpdateSuggestion[];
    try {
      // Clean the response to extract just the JSON array
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON array found in Gemini response');
        return [];
      }
      
      suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!Array.isArray(suggestions)) {
        console.warn('Gemini response is not an array');
        return [];
      }

      // Filter and validate suggestions
      return suggestions
        .filter(s => s && typeof s === 'object' && s.id && s.type && s.action)
        .slice(0, 10); // Limit to 10 suggestions
        
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.log('Raw response:', responseText);
      return [];
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to empty suggestions if AI fails
    return [];
  }
};

Deno.serve(async (req) => {
  try {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      );
    }

    // Create Supabase client with Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { inputText }: ProcessRequest = await req.json();

    if (!inputText || !inputText.trim()) {
      return new Response(
        JSON.stringify({ error: 'Input text is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      );
    }

    // First get non-deleted projects to get their IDs
    const projectsResult = await supabaseClient
      .from('projects')
      .select('*')
      .is('deleted_at', null);

    if (projectsResult.error) {
      console.error('Error fetching projects:', projectsResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch projects' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      );
    }

    const projects = projectsResult.data || [];
    const projectIds = projects.map(p => p.id);

    // If no projects found, return empty results
    if (projectIds.length === 0) {
      const data = {
        success: true,
        suggestions: [],
        processed_at: new Date().toISOString(),
        input_length: inputText.length,
      };

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      );
    }

    // Query related data only for non-deleted projects
    const [
      propertiesResult, 
      clientRequirementsResult
    ] = await Promise.all([
      supabaseClient.from('properties').select('*').in('project_id', projectIds),
      supabaseClient.from('client_requirements').select('*').in('project_id', projectIds)
    ]);

    // Check for errors in the related data queries
    const errors = [
      propertiesResult.error,
      clientRequirementsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Error fetching related data:', errors);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch related project data', details: errors }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        },
      );
    }

    const projectData: ProjectData = {
      projects: projects,
      properties: propertiesResult.data || [],
      clientRequirements: clientRequirementsResult.data || []
    };

    // Generate AI-powered suggestions based on the input text and all project data
    const suggestions = await generateAISuggestions(inputText, projectData);

    const data = {
      success: true,
      suggestions,
      processed_at: new Date().toISOString(),
      input_length: inputText.length,
    };

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/project-intelligence' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"inputText":"We need 5,000 sq ft office space at $30/sq ft. Contact: John Smith (john@company.com). Move-in by March 2024. Require parking spaces and conference rooms."}'

*/
