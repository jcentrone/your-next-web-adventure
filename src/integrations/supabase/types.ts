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
      account_tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      accounts: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          created_at: string
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          state: string | null
          tags: string[]
          type: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[]
          type?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          state?: string | null
          tags?: string[]
          type?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
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
      ai_tokens: {
        Row: {
          api_key: string
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          agreement_id: string | null
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
          agreement_id?: string | null
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
          agreement_id?: string | null
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
            foreignKeyName: "appointments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "inspection_agreements"
            referencedColumns: ["id"]
          },
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
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          advance_notice: number | null
          buffer_time: number | null
          default_duration: number | null
          id: string
          layout: string | null
          slug: string
          template: string
          theme_color: string | null
          time_zone: string | null
          user_id: string
          welcome_message: string | null
          working_days: string[] | null
          working_hours: Json | null
        }
        Insert: {
          advance_notice?: number | null
          buffer_time?: number | null
          default_duration?: number | null
          id?: string
          layout?: string | null
          slug: string
          template?: string
          theme_color?: string | null
          time_zone?: string | null
          user_id: string
          welcome_message?: string | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Update: {
          advance_notice?: number | null
          buffer_time?: number | null
          default_duration?: number | null
          id?: string
          layout?: string | null
          slug?: string
          template?: string
          theme_color?: string | null
          time_zone?: string | null
          user_id?: string
          welcome_message?: string | null
          working_days?: string[] | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          appointment_id: string
          event_id: string
          provider: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          event_id: string
          provider: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          event_id?: string
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_tokens: {
        Row: {
          access_token: string
          expires_at: string | null
          provider: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          expires_at?: string | null
          provider: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          expires_at?: string | null
          provider?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
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
      contact_tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_id: string | null
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
          tags: string[]
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          account_id?: string | null
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
          tags?: string[]
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          account_id?: string | null
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
          tags?: string[]
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
          design_json: Json | null
          id: string
          image_url: string | null
          name: string
          report_types: string[]
          template_slug: string | null
          text_content: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          color_palette_key?: string | null
          created_at?: string
          design_json?: Json | null
          id?: string
          image_url?: string | null
          name: string
          report_types?: string[]
          template_slug?: string | null
          text_content?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          color_palette_key?: string | null
          created_at?: string
          design_json?: Json | null
          id?: string
          image_url?: string | null
          name?: string
          report_types?: string[]
          template_slug?: string | null
          text_content?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_report_types: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_routes: {
        Row: {
          created_at: string | null
          end_address: string | null
          estimated_fuel_cost: number | null
          google_maps_url: string | null
          id: string
          is_optimized: boolean | null
          optimized_order: Json | null
          organization_id: string | null
          route_date: string
          start_address: string
          total_distance_miles: number | null
          total_duration_minutes: number | null
          updated_at: string | null
          user_id: string
          waypoints: Json | null
          waze_url: string | null
        }
        Insert: {
          created_at?: string | null
          end_address?: string | null
          estimated_fuel_cost?: number | null
          google_maps_url?: string | null
          id?: string
          is_optimized?: boolean | null
          optimized_order?: Json | null
          organization_id?: string | null
          route_date: string
          start_address: string
          total_distance_miles?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          user_id: string
          waypoints?: Json | null
          waze_url?: string | null
        }
        Update: {
          created_at?: string | null
          end_address?: string | null
          estimated_fuel_cost?: number | null
          google_maps_url?: string | null
          id?: string
          is_optimized?: boolean | null
          optimized_order?: Json | null
          organization_id?: string | null
          route_date?: string
          start_address?: string
          total_distance_miles?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          waypoints?: Json | null
          waze_url?: string | null
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
      email_templates: {
        Row: {
          created_at: string
          is_active: boolean | null
          language: string | null
          organization_id: string
          report_email_body: string
          report_email_subject: string
          template_type:
            | Database["public"]["Enums"]["email_template_type"]
            | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          is_active?: boolean | null
          language?: string | null
          organization_id: string
          report_email_body?: string
          report_email_subject?: string
          template_type?:
            | Database["public"]["Enums"]["email_template_type"]
            | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          is_active?: boolean | null
          language?: string | null
          organization_id?: string
          report_email_body?: string
          report_email_subject?: string
          template_type?:
            | Database["public"]["Enums"]["email_template_type"]
            | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          is_default: boolean
          name: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_default?: boolean
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_default?: boolean
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          expense_date: string
          id: string
          organization_id: string
          receipt_url: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          organization_id: string
          receipt_url?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          organization_id?: string
          receipt_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_agreements: {
        Row: {
          agreement_html: string | null
          appointment_id: string | null
          client_name: string | null
          id: string
          service_id: string | null
          signature_url: string | null
          signed_at: string | null
        }
        Insert: {
          agreement_html?: string | null
          appointment_id?: string | null
          client_name?: string | null
          id?: string
          service_id?: string | null
          signature_url?: string | null
          signed_at?: string | null
        }
        Update: {
          agreement_html?: string | null
          appointment_id?: string | null
          client_name?: string | null
          id?: string
          service_id?: string | null
          signature_url?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_agreements_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_agreements_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          body: string
          clicked: boolean | null
          data: Json | null
          delivered: boolean | null
          error_message: string | null
          id: string
          related_appointment_id: string | null
          related_contact_id: string | null
          related_report_id: string | null
          sent_at: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          clicked?: boolean | null
          data?: Json | null
          delivered?: boolean | null
          error_message?: string | null
          id?: string
          related_appointment_id?: string | null
          related_contact_id?: string | null
          related_report_id?: string | null
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          clicked?: boolean | null
          data?: Json | null
          delivered?: boolean | null
          error_message?: string | null
          id?: string
          related_appointment_id?: string | null
          related_contact_id?: string | null
          related_report_id?: string | null
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          appointment_reminder_times: number[]
          appointment_reminders: boolean
          business_intelligence: boolean
          client_messages: boolean
          created_at: string
          id: string
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sync_notifications: boolean
          system_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_reminder_times?: number[]
          appointment_reminders?: boolean
          business_intelligence?: boolean
          client_messages?: boolean
          created_at?: string
          id?: string
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sync_notifications?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_reminder_times?: number[]
          appointment_reminders?: boolean
          business_intelligence?: boolean
          client_messages?: boolean
          created_at?: string
          id?: string
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sync_notifications?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number | null
          body: string
          created_at: string
          data: Json | null
          id: string
          max_attempts: number | null
          related_appointment_id: string | null
          related_contact_id: string | null
          related_report_id: string | null
          scheduled_for: string
          sent: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          max_attempts?: number | null
          related_appointment_id?: string | null
          related_contact_id?: string | null
          related_report_id?: string | null
          scheduled_for: string
          sent?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          max_attempts?: number | null
          related_appointment_id?: string | null
          related_contact_id?: string | null
          related_report_id?: string | null
          scheduled_for?: string
          sent?: boolean | null
          title?: string
          type?: string
          user_id?: string
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
          email_from_address: string | null
          email_from_name: string | null
          id: string
          license_number: string | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
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
          initials_type: string | null
          initials_url: string | null
          last_sign_in_at: string | null
          license_number: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          provider: string | null
          signature_type: string | null
          signature_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          initials_type?: string | null
          initials_url?: string | null
          last_sign_in_at?: string | null
          license_number?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          provider?: string | null
          signature_type?: string | null
          signature_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          initials_type?: string | null
          initials_url?: string | null
          last_sign_in_at?: string | null
          license_number?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          provider?: string | null
          signature_type?: string | null
          signature_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      report_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          report_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          report_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          report_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_shares_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          address: string
          appointment_id: string | null
          archived: boolean
          client_name: string
          color_scheme: string | null
          contact_id: string | null
          contact_ids: Json | null
          county: string | null
          cover_image: string | null
          cover_template: string | null
          created_at: string
          custom_colors: Json | null
          email: string | null
          fee: number
          final_comments: string | null
          id: string
          inspection_date: string
          insurance_company: string | null
          ofStories: string | null
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
          tags: string[]
          terms_html: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          appointment_id?: string | null
          archived?: boolean
          client_name: string
          color_scheme?: string | null
          contact_id?: string | null
          contact_ids?: Json | null
          county?: string | null
          cover_image?: string | null
          cover_template?: string | null
          created_at?: string
          custom_colors?: Json | null
          email?: string | null
          fee?: number
          final_comments?: string | null
          id?: string
          inspection_date: string
          insurance_company?: string | null
          ofStories?: string | null
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
          tags?: string[]
          terms_html?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          appointment_id?: string | null
          archived?: boolean
          client_name?: string
          color_scheme?: string | null
          contact_id?: string | null
          contact_ids?: Json | null
          county?: string | null
          cover_image?: string | null
          cover_template?: string | null
          created_at?: string
          custom_colors?: Json | null
          email?: string | null
          fee?: number
          final_comments?: string | null
          id?: string
          inspection_date?: string
          insurance_company?: string | null
          ofStories?: string | null
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
          tags?: string[]
          terms_html?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
      route_optimization_settings: {
        Row: {
          always_return_home: boolean | null
          created_at: string | null
          default_enabled: boolean | null
          home_base_address: string
          home_base_formatted_address: string | null
          home_base_lat: number | null
          home_base_lng: number | null
          home_base_place_id: string | null
          id: string
          mileage_rate: number | null
          organization_id: string | null
          preferred_nav_app: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          always_return_home?: boolean | null
          created_at?: string | null
          default_enabled?: boolean | null
          home_base_address: string
          home_base_formatted_address?: string | null
          home_base_lat?: number | null
          home_base_lng?: number | null
          home_base_place_id?: string | null
          id?: string
          mileage_rate?: number | null
          organization_id?: string | null
          preferred_nav_app?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          always_return_home?: boolean | null
          created_at?: string | null
          default_enabled?: boolean | null
          home_base_address?: string
          home_base_formatted_address?: string | null
          home_base_lat?: number | null
          home_base_lng?: number | null
          home_base_place_id?: string | null
          id?: string
          mileage_rate?: number | null
          organization_id?: string | null
          preferred_nav_app?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      route_segments: {
        Row: {
          created_at: string | null
          daily_route_id: string
          distance_miles: number | null
          duration_minutes: number | null
          from_address: string
          from_appointment_id: string | null
          id: string
          segment_order: number
          to_address: string
          to_appointment_id: string | null
        }
        Insert: {
          created_at?: string | null
          daily_route_id: string
          distance_miles?: number | null
          duration_minutes?: number | null
          from_address: string
          from_appointment_id?: string | null
          id?: string
          segment_order: number
          to_address: string
          to_appointment_id?: string | null
        }
        Update: {
          created_at?: string | null
          daily_route_id?: string
          distance_miles?: number | null
          duration_minutes?: number | null
          from_address?: string
          from_appointment_id?: string | null
          id?: string
          segment_order?: number
          to_address?: string
          to_appointment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_segments_daily_route_id_fkey"
            columns: ["daily_route_id"]
            isOneToOne: false
            referencedRelation: "daily_routes"
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
      services: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_action_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          payload: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          payload?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          payload?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      support_articles: {
        Row: {
          content: string
          embedding: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          created_at: string
          escalated: boolean
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          escalated?: boolean
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          escalated?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          confidence: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          confidence?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          confidence?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      terms_conditions: {
        Row: {
          content_html: string
          created_at: string
          file_url: string | null
          id: string
          organization_id: string
          report_type: string | null
          updated_at: string
        }
        Insert: {
          content_html: string
          created_at?: string
          file_url?: string | null
          id?: string
          organization_id: string
          report_type?: string | null
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          file_url?: string | null
          id?: string
          organization_id?: string
          report_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_conditions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          report_types: string[] | null
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
          report_types?: string[] | null
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
          report_types?: string[] | null
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
          is_template: boolean | null
          organization_id: string | null
          report_types: string[] | null
          section_key: string
          sort_order: number
          template_name: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_template?: boolean | null
          organization_id?: string | null
          report_types?: string[] | null
          section_key: string
          sort_order?: number
          template_name?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_template?: boolean | null
          organization_id?: string | null
          report_types?: string[] | null
          section_key?: string
          sort_order?: number
          template_name?: string | null
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
      user_report_templates: {
        Row: {
          created_at: string | null
          description: string | null
          fields_config: Json
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string | null
          report_type: string
          sections_config: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fields_config?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          report_type: string
          sections_config?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fields_config?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          report_type?: string
          sections_config?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_section_order: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          report_type: string
          section_key: string
          section_type: string
          sort_order: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          report_type: string
          section_key: string
          section_type: string
          sort_order: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          report_type?: string
          section_key?: string
          section_type?: string
          sort_order?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analytics_summary: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_category_usage: {
        Args: { category_name: string; user_uuid: string }
        Returns: number
      }
      generate_default_terms_html: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_organization_role: {
        Args: {
          org_id: string
          required_role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_organization_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_support_articles: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
      email_template_type:
        | "report_share"
        | "signup_confirmation"
        | "password_recovery"
        | "magic_link"
        | "invite"
        | "email_change"
        | "reauthentication"
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
      email_template_type: [
        "report_share",
        "signup_confirmation",
        "password_recovery",
        "magic_link",
        "invite",
        "email_change",
        "reauthentication",
      ],
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
