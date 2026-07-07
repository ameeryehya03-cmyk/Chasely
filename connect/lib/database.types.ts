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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          areas: string[] | null
          bio: string | null
          created_at: string | null
          current_brokerage: string | null
          current_split: string | null
          headline: string | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          min_split_pct: number | null
          nationality: string | null
          needs_leads: boolean | null
          needs_visa: boolean | null
          open_to_relocate: boolean | null
          rera_brn: string | null
          rera_card_url: string | null
          specialties: string[] | null
          updated_at: string | null
          verification:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note: string | null
          visa_status: string | null
          years_experience: number | null
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          areas?: string[] | null
          bio?: string | null
          created_at?: string | null
          current_brokerage?: string | null
          current_split?: string | null
          headline?: string | null
          id: string
          is_active?: boolean | null
          languages?: string[] | null
          min_split_pct?: number | null
          nationality?: string | null
          needs_leads?: boolean | null
          needs_visa?: boolean | null
          open_to_relocate?: boolean | null
          rera_brn?: string | null
          rera_card_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note?: string | null
          visa_status?: string | null
          years_experience?: number | null
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          areas?: string[] | null
          bio?: string | null
          created_at?: string | null
          current_brokerage?: string | null
          current_split?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          min_split_pct?: number | null
          nationality?: string | null
          needs_leads?: boolean | null
          needs_visa?: boolean | null
          open_to_relocate?: boolean | null
          rera_brn?: string | null
          rera_card_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note?: string | null
          visa_status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerage_billing: {
        Row: {
          brokerage_id: string
          created_at: string | null
          credit_balance: number
          monthly_reveal_quota: number | null
          period_resets_at: string | null
          plan: Database["public"]["Enums"]["billing_plan"]
          reveals_used_this_period: number
          subscription_active_until: string | null
          updated_at: string | null
        }
        Insert: {
          brokerage_id: string
          created_at?: string | null
          credit_balance?: number
          monthly_reveal_quota?: number | null
          period_resets_at?: string | null
          plan?: Database["public"]["Enums"]["billing_plan"]
          reveals_used_this_period?: number
          subscription_active_until?: string | null
          updated_at?: string | null
        }
        Update: {
          brokerage_id?: string
          created_at?: string | null
          credit_balance?: number
          monthly_reveal_quota?: number | null
          period_resets_at?: string | null
          plan?: Database["public"]["Enums"]["billing_plan"]
          reveals_used_this_period?: number
          subscription_active_until?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokerage_billing_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: true
            referencedRelation: "brokerage_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokerage_billing_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: true
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerage_terms: {
        Row: {
          admin_support: boolean | null
          basic_salary_aed: number | null
          brokerage_id: string
          commission_payout_days: number | null
          commission_split: string
          created_at: string | null
          id: string
          is_current: boolean | null
          leads: Database["public"]["Enums"]["lead_provision"]
          leads_detail: string | null
          marketing_support: string | null
          notes: string | null
          portals_paid: string[] | null
          sim_and_laptop: boolean | null
          split_structure: string | null
          training_provided: boolean | null
          verified_by_admin: boolean | null
          visa: Database["public"]["Enums"]["visa_offering"]
        }
        Insert: {
          admin_support?: boolean | null
          basic_salary_aed?: number | null
          brokerage_id: string
          commission_payout_days?: number | null
          commission_split: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          leads?: Database["public"]["Enums"]["lead_provision"]
          leads_detail?: string | null
          marketing_support?: string | null
          notes?: string | null
          portals_paid?: string[] | null
          sim_and_laptop?: boolean | null
          split_structure?: string | null
          training_provided?: boolean | null
          verified_by_admin?: boolean | null
          visa?: Database["public"]["Enums"]["visa_offering"]
        }
        Update: {
          admin_support?: boolean | null
          basic_salary_aed?: number | null
          brokerage_id?: string
          commission_payout_days?: number | null
          commission_split?: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          leads?: Database["public"]["Enums"]["lead_provision"]
          leads_detail?: string | null
          marketing_support?: string | null
          notes?: string | null
          portals_paid?: string[] | null
          sim_and_laptop?: boolean | null
          split_structure?: string | null
          training_provided?: boolean | null
          verified_by_admin?: boolean | null
          visa?: Database["public"]["Enums"]["visa_offering"]
        }
        Relationships: [
          {
            foreignKeyName: "brokerage_terms_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerage_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokerage_terms_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerages: {
        Row: {
          about: string | null
          created_at: string | null
          emirate: string
          featured: boolean | null
          founded_year: number | null
          hiring: boolean | null
          id: string
          logo_url: string | null
          name: string
          office_location: string | null
          owner_profile_id: string
          rera_orn: string | null
          slug: string
          team_size: number | null
          trade_license_url: string | null
          updated_at: string | null
          verification:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string | null
          emirate?: string
          featured?: boolean | null
          founded_year?: number | null
          hiring?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          office_location?: string | null
          owner_profile_id: string
          rera_orn?: string | null
          slug: string
          team_size?: number | null
          trade_license_url?: string | null
          updated_at?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string | null
          emirate?: string
          featured?: boolean | null
          founded_year?: number | null
          hiring?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          office_location?: string | null
          owner_profile_id?: string
          rera_orn?: string | null
          slug?: string
          team_size?: number | null
          trade_license_url?: string | null
          updated_at?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_note?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokerages_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          amount: number
          balance_after: number
          brokerage_id: string
          created_at: string | null
          created_by: string | null
          event: Database["public"]["Enums"]["credit_event"]
          id: string
          note: string | null
          related_interest_id: string | null
          related_match_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          brokerage_id: string
          created_at?: string | null
          created_by?: string | null
          event: Database["public"]["Enums"]["credit_event"]
          id?: string
          note?: string | null
          related_interest_id?: string | null
          related_match_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          brokerage_id?: string
          created_at?: string | null
          created_by?: string | null
          event?: Database["public"]["Enums"]["credit_event"]
          id?: string
          note?: string | null
          related_interest_id?: string | null
          related_match_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerage_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_related_interest_id_fkey"
            columns: ["related_interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_related_match_id_fkey"
            columns: ["related_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          agent_id: string
          brokerage_id: string
          created_at: string | null
          direction: Database["public"]["Enums"]["interest_direction"]
          id: string
          message: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["interest_status"]
        }
        Insert: {
          agent_id: string
          brokerage_id: string
          created_at?: string | null
          direction: Database["public"]["Enums"]["interest_direction"]
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["interest_status"]
        }
        Update: {
          agent_id?: string
          brokerage_id?: string
          created_at?: string | null
          direction?: Database["public"]["Enums"]["interest_direction"]
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["interest_status"]
        }
        Relationships: [
          {
            foreignKeyName: "interests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerage_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          changed_by: string | null
          created_at: string | null
          from_stage: Database["public"]["Enums"]["match_stage"] | null
          id: string
          match_id: string
          note: string | null
          to_stage: Database["public"]["Enums"]["match_stage"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          from_stage?: Database["public"]["Enums"]["match_stage"] | null
          id?: string
          match_id: string
          note?: string | null
          to_stage: Database["public"]["Enums"]["match_stage"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          from_stage?: Database["public"]["Enums"]["match_stage"] | null
          id?: string
          match_id?: string
          note?: string | null
          to_stage?: Database["public"]["Enums"]["match_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "match_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          agent_id: string
          brokerage_id: string
          created_at: string | null
          id: string
          kinleague_owner: string | null
          placement_fee_expected_aed: number | null
          revealed_at: string | null
          revealed_by: string | null
          source_interest_id: string | null
          stage: Database["public"]["Enums"]["match_stage"]
          stage_notes: string | null
          updated_at: string | null
          whatsapp_handoff_at: string | null
        }
        Insert: {
          agent_id: string
          brokerage_id: string
          created_at?: string | null
          id?: string
          kinleague_owner?: string | null
          placement_fee_expected_aed?: number | null
          revealed_at?: string | null
          revealed_by?: string | null
          source_interest_id?: string | null
          stage?: Database["public"]["Enums"]["match_stage"]
          stage_notes?: string | null
          updated_at?: string | null
          whatsapp_handoff_at?: string | null
        }
        Update: {
          agent_id?: string
          brokerage_id?: string
          created_at?: string | null
          id?: string
          kinleague_owner?: string | null
          placement_fee_expected_aed?: number | null
          revealed_at?: string | null
          revealed_by?: string | null
          source_interest_id?: string | null
          stage?: Database["public"]["Enums"]["match_stage"]
          stage_notes?: string | null
          updated_at?: string | null
          whatsapp_handoff_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerage_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_revealed_by_fkey"
            columns: ["revealed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_source_interest_id_fkey"
            columns: ["source_interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          emailed_at: string | null
          id: string
          payload: Json | null
          profile_id: string
          read_at: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          emailed_at?: string | null
          id?: string
          payload?: Json | null
          profile_id: string
          read_at?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          emailed_at?: string | null
          id?: string
          payload?: Json | null
          profile_id?: string
          read_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          pdpl_consent_at: string | null
          phone_e164: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          pdpl_consent_at?: string | null
          phone_e164?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          pdpl_consent_at?: string | null
          phone_e164?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      agent_directory: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          areas: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_brokerage: string | null
          current_split: string | null
          full_name: string | null
          headline: string | null
          id: string | null
          languages: string[] | null
          min_split_pct: number | null
          nationality: string | null
          needs_leads: boolean | null
          needs_visa: boolean | null
          open_to_relocate: boolean | null
          specialties: string[] | null
          visa_status: string | null
          years_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerage_directory: {
        Row: {
          about: string | null
          created_at: string | null
          emirate: string | null
          featured: boolean | null
          founded_year: number | null
          hiring: boolean | null
          id: string | null
          logo_url: string | null
          name: string | null
          office_location: string | null
          slug: string | null
          team_size: number | null
          website: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string | null
          emirate?: string | null
          featured?: boolean | null
          founded_year?: number | null
          hiring?: boolean | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          office_location?: string | null
          slug?: string | null
          team_size?: number | null
          website?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string | null
          emirate?: string | null
          featured?: boolean | null
          founded_year?: number | null
          hiring?: boolean | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          office_location?: string | null
          slug?: string | null
          team_size?: number | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_type: "real_estate" | "mortgage"
      billing_plan: "free" | "credits" | "subscription"
      credit_event:
        | "purchase"
        | "grant"
        | "reveal_spend"
        | "invite_spend"
        | "refund"
        | "expiry"
        | "adjustment"
      interest_direction: "agent_to_brokerage" | "brokerage_to_agent"
      interest_status: "pending" | "accepted" | "declined" | "withdrawn"
      lead_provision: "no_leads" | "shared_pool" | "dedicated_leads"
      match_stage:
        | "matched"
        | "intro_sent"
        | "interviewing"
        | "offer"
        | "placed"
        | "dead"
      user_role: "agent" | "brokerage" | "admin"
      verification_status: "pending" | "verified" | "rejected"
      visa_offering: "none" | "visa_only" | "visa_plus_basic"
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
      agent_type: ["real_estate", "mortgage"],
      billing_plan: ["free", "credits", "subscription"],
      credit_event: [
        "purchase",
        "grant",
        "reveal_spend",
        "invite_spend",
        "refund",
        "expiry",
        "adjustment",
      ],
      interest_direction: ["agent_to_brokerage", "brokerage_to_agent"],
      interest_status: ["pending", "accepted", "declined", "withdrawn"],
      lead_provision: ["no_leads", "shared_pool", "dedicated_leads"],
      match_stage: [
        "matched",
        "intro_sent",
        "interviewing",
        "offer",
        "placed",
        "dead",
      ],
      user_role: ["agent", "brokerage", "admin"],
      verification_status: ["pending", "verified", "rejected"],
      visa_offering: ["none", "visa_only", "visa_plus_basic"],
    },
  },
} as const
