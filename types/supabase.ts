// Placeholder types until `supabase gen types typescript --project-id <id>` is run.
// Replace this file with the auto-generated version once Supabase project is created.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          profile_type: 'artisan' | 'pm_advanced' | 'sme_manager'
          org_id: string | null
          onboarding_completed: boolean
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          profile_type?: 'artisan' | 'pm_advanced' | 'sme_manager'
          org_id?: string | null
          onboarding_completed?: boolean
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          profile_type?: 'artisan' | 'pm_advanced' | 'sme_manager'
          org_id?: string | null
          onboarding_completed?: boolean
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          org_id: string | null
          owner_id: string
          name: string
          description: string | null
          sector: string | null
          approach: 'predictive' | 'agile' | 'hybrid'
          status: 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
          purpose: string | null
          success_criteria: Json
          in_scope: string | null
          out_of_scope: string | null
          start_date: string | null
          target_end_date: string | null
          actual_end_date: string | null
          budget: number | null
          budget_currency: string
          tailoring_answers: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          owner_id: string
          name: string
          description?: string | null
          sector?: string | null
          approach?: 'predictive' | 'agile' | 'hybrid'
          status?: 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
          purpose?: string | null
          success_criteria?: Json
          in_scope?: string | null
          out_of_scope?: string | null
          start_date?: string | null
          target_end_date?: string | null
          actual_end_date?: string | null
          budget?: number | null
          budget_currency?: string
          tailoring_answers?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          owner_id?: string
          name?: string
          description?: string | null
          sector?: string | null
          approach?: 'predictive' | 'agile' | 'hybrid'
          status?: 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
          purpose?: string | null
          success_criteria?: Json
          in_scope?: string | null
          out_of_scope?: string | null
          start_date?: string | null
          target_end_date?: string | null
          actual_end_date?: string | null
          budget?: number | null
          budget_currency?: string
          tailoring_answers?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          project_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
      }
      work_packages: {
        Row: {
          id: string
          project_id: string
          parent_id: string | null
          name: string
          description: string | null
          status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
          owner_id: string | null
          estimated_effort_hours: number | null
          actual_effort_hours: number | null
          estimated_cost: number | null
          actual_cost: number | null
          due_date: string | null
          completed_at: string | null
          tags: string[]
          position: number
          wbs_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          parent_id?: string | null
          name: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
          owner_id?: string | null
          estimated_effort_hours?: number | null
          actual_effort_hours?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          due_date?: string | null
          completed_at?: string | null
          tags?: string[]
          position?: number
          wbs_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          parent_id?: string | null
          name?: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
          owner_id?: string | null
          estimated_effort_hours?: number | null
          actual_effort_hours?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          due_date?: string | null
          completed_at?: string | null
          tags?: string[]
          position?: number
          wbs_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          id: string
          project_id: string
          code: string | null
          title: string
          description: string | null
          category: 'technical' | 'organizational' | 'external' | 'project_management' | 'commercial'
          is_opportunity: boolean
          probability: number | null
          impact: number | null
          score: number
          strategy: string | null
          response_actions: string | null
          trigger_condition: string | null
          status: 'open' | 'mitigating' | 'closed' | 'realized'
          owner_id: string | null
          last_review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          code?: string | null
          title: string
          description?: string | null
          category?: 'technical' | 'organizational' | 'external' | 'project_management' | 'commercial'
          is_opportunity?: boolean
          probability?: number | null
          impact?: number | null
          strategy?: string | null
          response_actions?: string | null
          trigger_condition?: string | null
          status?: 'open' | 'mitigating' | 'closed' | 'realized'
          owner_id?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          code?: string | null
          title?: string
          description?: string | null
          category?: 'technical' | 'organizational' | 'external' | 'project_management' | 'commercial'
          is_opportunity?: boolean
          probability?: number | null
          impact?: number | null
          strategy?: string | null
          response_actions?: string | null
          trigger_condition?: string | null
          status?: 'open' | 'mitigating' | 'closed' | 'realized'
          owner_id?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          id: string
          project_id: string
          name: string
          role: string | null
          organization: string | null
          email: string | null
          phone: string | null
          interest: string | null
          power: number | null
          influence: number | null
          attitude: 'champion' | 'supportive' | 'neutral' | 'resistant' | 'blocker'
          current_engagement: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          desired_engagement: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          engagement_strategy: string | null
          notes: string | null
          owner_id: string | null
          last_contact_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          role?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          interest?: string | null
          power?: number | null
          influence?: number | null
          attitude?: 'champion' | 'supportive' | 'neutral' | 'resistant' | 'blocker'
          current_engagement?: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          desired_engagement?: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          engagement_strategy?: string | null
          notes?: string | null
          owner_id?: string | null
          last_contact_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          role?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          interest?: string | null
          power?: number | null
          influence?: number | null
          attitude?: 'champion' | 'supportive' | 'neutral' | 'resistant' | 'blocker'
          current_engagement?: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          desired_engagement?: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
          engagement_strategy?: string | null
          notes?: string | null
          owner_id?: string | null
          last_contact_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          id: string
          project_id: string
          risk_id: string | null
          title: string
          description: string | null
          severity: string
          status: string
          owner_id: string | null
          raised_date: string | null
          resolution: string | null
          target_close_date: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          risk_id?: string | null
          title: string
          description?: string | null
          severity?: string
          status?: string
          owner_id?: string | null
          raised_date?: string | null
          resolution?: string | null
          target_close_date?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          risk_id?: string | null
          title?: string
          description?: string | null
          severity?: string
          status?: string
          owner_id?: string | null
          raised_date?: string | null
          resolution?: string | null
          target_close_date?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          id: string
          project_id: string
          type: 'project_charter' | 'wbs' | 'stakeholder_register' | 'risk_register' | 'communications_plan' | 'status_report' | 'change_request' | 'lessons_learned'
          title: string
          content: Json
          version: number
          status: string
          generated_by_ai: boolean
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'project_charter' | 'wbs' | 'stakeholder_register' | 'risk_register' | 'communications_plan' | 'status_report' | 'change_request' | 'lessons_learned'
          title: string
          content?: Json
          version?: number
          status?: string
          generated_by_ai?: boolean
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'project_charter' | 'wbs' | 'stakeholder_register' | 'risk_register' | 'communications_plan' | 'status_report' | 'change_request' | 'lessons_learned'
          title?: string
          content?: Json
          version?: number
          status?: string
          generated_by_ai?: boolean
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_reports: {
        Row: {
          id: string
          project_id: string
          period_start: string
          period_end: string
          rag_status: 'green' | 'amber' | 'red'
          headline: string | null
          schedule_variance_days: number | null
          cost_variance_amount: number | null
          scope_stable: boolean
          achievements: Json
          next_period_plan: Json
          decisions_needed: Json
          content: Json
          generated_by_ai: boolean
          sent_to: string[] | null
          sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          period_start: string
          period_end: string
          rag_status?: 'green' | 'amber' | 'red'
          headline?: string | null
          schedule_variance_days?: number | null
          cost_variance_amount?: number | null
          scope_stable?: boolean
          achievements?: Json
          next_period_plan?: Json
          decisions_needed?: Json
          content?: Json
          generated_by_ai?: boolean
          sent_to?: string[] | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          period_start?: string
          period_end?: string
          rag_status?: 'green' | 'amber' | 'red'
          headline?: string | null
          schedule_variance_days?: number | null
          cost_variance_amount?: number | null
          scope_stable?: boolean
          achievements?: Json
          next_period_plan?: Json
          decisions_needed?: Json
          content?: Json
          generated_by_ai?: boolean
          sent_to?: string[] | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          id: string
          project_id: string | null
          user_id: string
          interaction_type: string | null
          prompt_preview: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id: string
          interaction_type?: string | null
          prompt_preview?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string
          interaction_type?: string | null
          prompt_preview?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      project_approach: 'predictive' | 'agile' | 'hybrid'
      project_sector: 'construction' | 'it_software' | 'marketing_events' | 'rd_innovation' | 'transformation' | 'product_launch' | 'regulatory_public' | 'other'
      project_status: 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
      user_profile_type: 'artisan' | 'pm_advanced' | 'sme_manager'
      rag_status: 'green' | 'amber' | 'red'
      wp_status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
    }
    CompositeTypes: Record<string, never>
  }
}
