export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          appointment_id: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          report_id: string | null
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          appointment_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          report_id?: string | null
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          appointment_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          report_id?: string | null
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activities_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activities_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activities_report"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activities_task"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          contact_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          organization_id: string | null
          report_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          organization_id?: string | null
          report_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          organization_id?: string | null
          report_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_report"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_relationships: {
        Row: {
          created_at: string
          custom_relationship_label: string | null
          from_contact_id: string
          id: string
          is_active: boolean
          notes: string | null
          organization_id: string | null
          relationship_type: string
          to_contact_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_relationship_label?: string | null
          from_contact_id: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          relationship_type: string
          to_contact_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_relationship_label?: string | null
          from_contact_id?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          relationship_type?: string
          to_contact_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          address_components: Json | null
          city: string | null
          company: string | null
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          email: string | null
          first_name: string
          formatted_address: string | null
          id: string
          is_active: boolean
          last_name: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          place_id: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_components?: Json | null
          city?: string | null
          company?: string | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email?: string | null
          first_name: string
          formatted_address?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          place_id?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_components?: Json | null
          city?: string | null
          company?: string | null
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email?: string | null
          first_name?: string
          formatted_address?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          place_id?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      cover_page_assignments: {
        Row: {
          cover_page_id: string
          created_at: string
          id: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_page_id: string
          created_at?: string
          id?: string
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_page_id?: string
          created_at?: string
          id?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cover_page_assignments_cover_page"
            columns: ["cover_page_id"]
            isOneToOne: false
            referencedRelation: "cover_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_pages: {
        Row: {
          color_palette_key: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          template_slug: string | null
          text_content: Json
          design_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          color_palette_key?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          template_slug?: string | null
          text_content?: Json
          design_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          color_palette_key?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          template_slug?: string | null
          text_content?: Json
          design_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      defects: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          media_guidance: string | null
          recommendation: string | null
          section_key: Database["public"]["Enums"]["section_key"]
          severity: Database["public"]["Enums"]["severity_level"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          media_guidance?: string | null
          recommendation?: string | null
          section_key: Database["public"]["Enums"]["section_key"]
          severity: Database["public"]["Enums"]["severity_level"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          media_guidance?: string | null
          recommendation?: string | null
          section_key?: Database["public"]["Enums"]["section_key"]
          severity?: Database["public"]["Enums"]["severity_level"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          license_number: string | null
          logo_url: string | null
          name: string
          phone: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_individual: boolean
          last_sign_in_at: string | null
          license_number: string | null
          organization_id: string | null
          phone: string | null
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_individual?: boolean
          last_sign_in_at?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone?: string | null
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_individual?: boolean
          last_sign_in_at?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone?: string | null
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          address: string
          archived: boolean
          client_name: string
          contact_id: string | null
          cover_image: string | null
          cover_page_id: string | null
          created_at: string
          email: string | null
          final_comments: string | null
          id: string
          inspection_date: string
          insurance_company: string | null
          organization_id: string | null
          phone_cell: string | null
          phone_home: string | null
          phone_work: string | null
          policy_number: string | null
          preview_template: string
          report_data: Json | null
          report_type: string | null
          sections: Json | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          archived?: boolean
          client_name: string
          contact_id?: string | null
          cover_image?: string | null
          cover_page_id?: string | null
          created_at?: string
          email?: string | null
          final_comments?: string | null
          id?: string
          inspection_date: string
          insurance_company?: string | null
          organization_id?: string | null
          phone_cell?: string | null
          phone_home?: string | null
          phone_work?: string | null
          policy_number?: string | null
          preview_template?: string
          report_data?: Json | null
          report_type?: string | null
          sections?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          archived?: boolean
          client_name?: string
          contact_id?: string | null
          cover_image?: string | null
          cover_page_id?: string | null
          created_at?: string
          email?: string | null
          final_comments?: string | null
          id?: string
          inspection_date?: string
          insurance_company?: string | null
          organization_id?: string | null
          phone_cell?: string | null
          phone_home?: string | null
          phone_work?: string | null
          policy_number?: string | null
          preview_template?: string
          report_data?: Json | null
          report_type?: string | null
          sections?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_cover_page_id_fkey"
            columns: ["cover_page_id"]
            isOneToOne: false
            referencedRelation: "cover_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      section_guidance: {
        Row: {
          created_at: string
          infoFields: Json | null
          items: string[]
          section_key: Database["public"]["Enums"]["section_key"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          infoFields?: Json | null
          items: string[]
          section_key: Database["public"]["Enums"]["section_key"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          infoFields?: Json | null
          items?: string[]
          section_key?: Database["public"]["Enums"]["section_key"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          appointment_id: string | null
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          report_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          report_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          report_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tasks_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tasks_report"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_fields: {
        Row: {
          created_at: string
          field_label: string
          field_name: string
          id: string
          is_active: boolean
          options: Json | null
          organization_id: string | null
          required: boolean
          section_key: string
          sort_order: number
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          field_label: string
          field_name: string
          id?: string
          is_active?: boolean
          options?: Json | null
          organization_id?: string | null
          required?: boolean
          section_key: string
          sort_order?: number
          updated_at?: string
          user_id: string
          widget_type: string
        }
        Update: {
          created_at?: string
          field_label?: string
          field_name?: string
          id?: string
          is_active?: boolean
          options?: Json | null
          organization_id?: string | null
          required?: boolean
          section_key?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: []
      }
      user_custom_sections: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string | null
          section_key: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          section_key: string
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          section_key?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_defects: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          media_guidance: string | null
          recommendation: string | null
          section_key: Database["public"]["Enums"]["section_key"]
          severity: Database["public"]["Enums"]["severity_level"]
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          media_guidance?: string | null
          recommendation?: string | null
          section_key: Database["public"]["Enums"]["section_key"]
          severity: Database["public"]["Enums"]["severity_level"]
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          media_guidance?: string | null
          recommendation?: string | null
          section_key?: Database["public"]["Enums"]["section_key"]
          severity?: Database["public"]["Enums"]["severity_level"]
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_contact_with_related_data: {
        Args: { contact_uuid: string }
        Returns: Json
      }
      get_user_organization_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_organization_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["organization_role"]
      }
      has_organization_role: {
        Args: {
          org_id: string
          required_role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "note"
        | "task_completed"
        | "appointment_created"
        | "report_delivered"
        | "report_created"
        | "contact_created"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
      contact_type: "client" | "realtor" | "vendor" | "contractor" | "other"
      organization_role: "owner" | "admin" | "inspector" | "viewer"
      report_status: "Draft" | "Final"
      section_key:
        | "roof"
        | "exterior"
        | "structure"
        | "heating"
        | "cooling"
        | "plumbing"
        | "electrical"
        | "fireplace"
        | "attic"
        | "interior"
        | "report_details"
      severity_level:
        | "Info"
        | "Maintenance"
        | "Minor"
        | "Moderate"
        | "Major"
        | "Safety"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "call",
        "email",
        "meeting",
        "note",
        "task_completed",
        "appointment_created",
        "report_delivered",
        "report_created",
        "contact_created",
      ],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      contact_type: ["client", "realtor", "vendor", "contractor", "other"],
      organization_role: ["owner", "admin", "inspector", "viewer"],
      report_status: ["Draft", "Final"],
      section_key: [
        "roof",
        "exterior",
        "structure",
        "heating",
        "cooling",
        "plumbing",
        "electrical",
        "fireplace",
        "attic",
        "interior",
        "report_details",
      ],
      severity_level: [
        "Info",
        "Maintenance",
        "Minor",
        "Moderate",
        "Major",
        "Safety",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
