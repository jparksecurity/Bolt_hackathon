export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          variables?: Json
          operationName?: string
          query?: string
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      client_requirements: {
        Row: {
          category: string
          created_at: string | null
          id: string
          project_id: string
          requirement_text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          project_id: string
          requirement_text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          project_id?: string
          requirement_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string | null
          document_url: string
          file_type: string
          id: string
          name: string
          order_index: number
          project_id: string
          source_type: string | null
        }
        Insert: {
          created_at?: string | null
          document_url: string
          file_type: string
          id?: string
          name: string
          order_index: number
          project_id: string
          source_type?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string
          file_type?: string
          id?: string
          name?: string
          order_index?: number
          project_id?: string
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_roadmap: {
        Row: {
          completed_date: string | null
          created_at: string | null
          description: string | null
          expected_date: string | null
          id: string
          order_index: number
          project_id: string
          status: string
          title: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          order_index: number
          project_id: string
          status?: string
          title: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          order_index?: number
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_roadmap_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string
          update_date: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id: string
          update_date?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
          update_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          broker_commission: number | null
          clerk_user_id: string
          commission_paid_by: string | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_title: string | null
          created_at: string | null
          deleted_at: string | null
          desired_move_in_date: string | null
          expected_fee: number | null
          expected_headcount: string | null
          id: string
          payment_due: string | null
          public_share_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          broker_commission?: number | null
          clerk_user_id: string
          commission_paid_by?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_move_in_date?: string | null
          expected_fee?: number | null
          expected_headcount?: string | null
          id?: string
          payment_due?: string | null
          public_share_id?: string | null
          start_date?: string | null
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          broker_commission?: number | null
          clerk_user_id?: string
          commission_paid_by?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_move_in_date?: string | null
          expected_fee?: number | null
          expected_headcount?: string | null
          id?: string
          payment_due?: string | null
          public_share_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          availability: string | null
          condition: string | null
          contract_term: string | null
          created_at: string | null
          current_state: string | null
          decline_reason: string | null
          expected_monthly_cost: string | null
          flier_url: string | null
          id: string
          lease_structure: string | null
          lease_type: string | null
          misc_notes: string | null
          monthly_cost: string | null
          name: string
          order_index: number
          people_capacity: string | null
          price_per_sf: string | null
          project_id: string
          sf: string | null
          status: string
          suggestion: string | null
          tour_datetime: string | null
          tour_location: string | null
          tour_status: string | null
          updated_at: string | null
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          availability?: string | null
          condition?: string | null
          contract_term?: string | null
          created_at?: string | null
          current_state?: string | null
          decline_reason?: string | null
          expected_monthly_cost?: string | null
          flier_url?: string | null
          id?: string
          lease_structure?: string | null
          lease_type?: string | null
          misc_notes?: string | null
          monthly_cost?: string | null
          name: string
          order_index: number
          people_capacity?: string | null
          price_per_sf?: string | null
          project_id: string
          sf?: string | null
          status?: string
          suggestion?: string | null
          tour_datetime?: string | null
          tour_location?: string | null
          tour_status?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          availability?: string | null
          condition?: string | null
          contract_term?: string | null
          created_at?: string | null
          current_state?: string | null
          decline_reason?: string | null
          expected_monthly_cost?: string | null
          flier_url?: string | null
          id?: string
          lease_structure?: string | null
          lease_type?: string | null
          misc_notes?: string | null
          monthly_cost?: string | null
          name?: string
          order_index?: number
          people_capacity?: string | null
          price_per_sf?: string | null
          project_id?: string
          sf?: string | null
          status?: string
          suggestion?: string | null
          tour_datetime?: string | null
          tour_location?: string | null
          tour_status?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_client_requirements: {
        Args: { share_id: string }
        Returns: {
          id: string
          project_id: string
          category: string
          requirement_text: string
          created_at: string
        }[]
      }
      get_public_project: {
        Args: { share_id: string }
        Returns: {
          id: string
          title: string
          status: string
          start_date: string
          desired_move_in_date: string
          expected_fee: number
          broker_commission: number
          commission_paid_by: string
          payment_due: string
          company_name: string
          expected_headcount: string
          contact_name: string
          contact_title: string
          contact_phone: string
          contact_email: string
          created_at: string
          updated_at: string
        }[]
      }
      get_public_project_documents: {
        Args: { share_id: string }
        Returns: {
          id: string
          project_id: string
          name: string
          file_type: string
          document_url: string
          source_type: string
          order_index: number
          created_at: string
        }[]
      }
      get_public_project_roadmap: {
        Args: { share_id: string }
        Returns: {
          created_at: string
          order_index: number
          completed_date: string
          expected_date: string
          status: string
          description: string
          title: string
          project_id: string
          id: string
        }[]
      }
      get_public_project_updates: {
        Args: { share_id: string }
        Returns: {
          id: string
          project_id: string
          content: string
          update_date: string
          created_at: string
        }[]
      }
      get_public_properties: {
        Args: { share_id: string }
        Returns: {
          id: string
          project_id: string
          name: string
          address: string
          sf: string
          people_capacity: string
          price_per_sf: string
          monthly_cost: string
          expected_monthly_cost: string
          contract_term: string
          availability: string
          lease_type: string
          lease_structure: string
          current_state: string
          condition: string
          misc_notes: string
          virtual_tour_url: string
          suggestion: string
          flier_url: string
          tour_datetime: string
          tour_status: string
          tour_location: string
          status: string
          decline_reason: string
          order_index: number
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

