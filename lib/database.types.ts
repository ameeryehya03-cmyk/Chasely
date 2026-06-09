// Manually maintained types matching supabase/migrations/001_initial_schema.sql
// Run `supabase gen types typescript` after connecting Supabase CLI for auto-gen.

export type OutreachStatus = 'new' | 'contacted' | 'replied' | 'meeting' | 'won' | 'dead'
export type ConnectorStatus = 'running' | 'completed' | 'failed' | 'cancelled'
export type DuplicateReviewStatus = 'pending' | 'merged' | 'dismissed'

export interface Agent {
  id: string
  full_name: string | null
  agency_name: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  instagram_handle: string | null
  instagram_followers: number | null
  linkedin_url: string | null
  website: string | null
  rera_brn: string | null
  specialization_areas: string[]
  languages: string[]
  address: string | null
  city: string
  google_place_id: string | null
  google_rating: number | null
  google_review_count: number | null
  data_flagged_for_review: boolean
  flagged_at: string | null
  created_at: string
  updated_at: string
}

export interface AgentEnriched extends Agent {
  outreach_status: OutreachStatus
  opt_out: boolean | null
  last_contacted_at: string | null
  outreach_notes: string | null
  on_suppression_list: boolean
}

export interface ContactProvenance {
  id: string
  agent_id: string
  field_name: string
  source_name: string
  provider_name: string | null
  legal_basis: string
  captured_at: string
  notes: string | null
}

export interface AgentSource {
  id: string
  agent_id: string
  source_name: string
  external_id: string | null
  source_url: string | null
  raw_record_id: string | null
  captured_at: string
}

export interface ConnectorRun {
  id: string
  connector: string
  started_at: string
  completed_at: string | null
  status: ConnectorStatus
  records_added: number
  records_updated: number
  records_skipped: number
  records_failed: number
  error_message: string | null
  params: Record<string, unknown> | null
}

export interface PossibleDuplicate {
  id: string
  agent_id_a: string
  agent_id_b: string
  similarity_score: number | null
  match_reason: string | null
  status: DuplicateReviewStatus
  created_at: string
  reviewed_at: string | null
}

export interface SuppressionEntry {
  id: string
  agent_id: string | null
  email: string | null
  phone: string | null
  reason: string | null
  added_at: string
  added_by: string
}

export type Database = {
  public: {
    Tables: {
      agents: { Row: Agent; Insert: Partial<Agent>; Update: Partial<Agent> }
      contact_provenance: { Row: ContactProvenance; Insert: Partial<ContactProvenance>; Update: Partial<ContactProvenance> }
      agent_sources: { Row: AgentSource; Insert: Partial<AgentSource>; Update: Partial<AgentSource> }
      raw_records: { Row: { id: string; connector: string; external_id: string | null; payload: Record<string, unknown>; captured_at: string }; Insert: Partial<{ id: string; connector: string; external_id: string | null; payload: Record<string, unknown>; captured_at: string }>; Update: Partial<{ id: string; connector: string; external_id: string | null; payload: Record<string, unknown>; captured_at: string }> }
      consent_and_outreach: { Row: { id: string; agent_id: string; outreach_status: OutreachStatus; consent_basis: string | null; opt_out: boolean; opt_out_at: string | null; last_contacted_at: string | null; notes: string | null; updated_at: string }; Insert: Partial<{ id: string; agent_id: string; outreach_status: OutreachStatus; consent_basis: string | null; opt_out: boolean; opt_out_at: string | null; last_contacted_at: string | null; notes: string | null; updated_at: string }>; Update: Partial<{ id: string; agent_id: string; outreach_status: OutreachStatus; consent_basis: string | null; opt_out: boolean; opt_out_at: string | null; last_contacted_at: string | null; notes: string | null; updated_at: string }> }
      suppression_list: { Row: SuppressionEntry; Insert: Partial<SuppressionEntry>; Update: Partial<SuppressionEntry> }
      connector_runs: { Row: ConnectorRun; Insert: Partial<ConnectorRun>; Update: Partial<ConnectorRun> }
      possible_duplicates: { Row: PossibleDuplicate; Insert: Partial<PossibleDuplicate>; Update: Partial<PossibleDuplicate> }
    }
    Views: {
      agents_enriched: { Row: AgentEnriched }
      stale_agents: { Row: Pick<Agent, 'id' | 'full_name' | 'agency_name' | 'updated_at'> & { age: string } }
    }
  }
}
