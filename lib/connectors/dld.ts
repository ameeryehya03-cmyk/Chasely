// DLD/RERA Broker Registry importer.
// Legal basis: UAE public government registry (Dubai Land Department).
// Accepts CSV or XLSX file upload with broker records.
// BRN (Broker Registration Number) is the authoritative key.

import { BaseConnector, ConnectorResult } from './base'
import { normalizeName } from '../normalization'

export interface DldRecord {
  broker_name?: string
  full_name?: string
  name?: string
  brn?: string
  rera_brn?: string
  broker_registration_number?: string
  agency_name?: string
  agency?: string
  company_name?: string
  [key: string]: string | undefined
}

export class DldConnector extends BaseConnector {
  readonly name = 'dld'
  readonly legalBasis = 'uae_public_government_register'

  async run(params?: { records: DldRecord[] }): Promise<ConnectorResult> {
    if (!params?.records?.length) {
      return { added: 0, updated: 0, skipped: 0, failed: 0, errors: ['No records provided'] }
    }

    const runId = await this.startRun({ record_count: params.records.length })
    const result: ConnectorResult = { added: 0, updated: 0, skipped: 0, failed: 0, errors: [] }

    for (const rec of params.records) {
      await this.upsertRecord(rec, result)
    }

    await this.finishRun(runId, result)
    return result
  }

  private async upsertRecord(rec: DldRecord, result: ConnectorResult): Promise<void> {
    try {
      const brn = this.extractBrn(rec)
      const fullName = normalizeName(rec.broker_name ?? rec.full_name ?? rec.name ?? '')
      const agencyName = rec.agency_name ?? rec.agency ?? rec.company_name ?? null

      if (!brn && !fullName) {
        result.skipped++
        return
      }

      // Save raw record
      const { data: raw } = await this.supabase
        .from('raw_records')
        .insert({ connector: 'dld', external_id: brn ?? undefined, payload: rec as unknown as Record<string, unknown> })
        .select('id')
        .single()

      let agentId: string

      // Try to find by BRN first (authoritative key)
      let existing = null
      if (brn) {
        const { data } = await this.supabase
          .from('agents')
          .select('id, full_name, agency_name')
          .eq('rera_brn', brn)
          .maybeSingle()
        existing = data
      }

      // Fall back to name+agency fuzzy match
      if (!existing && fullName) {
        const { data } = await this.supabase
          .from('agents')
          .select('id, full_name, agency_name')
          .ilike('full_name', fullName)
          .maybeSingle()
        existing = data
      }

      if (existing) {
        await this.supabase.from('agents').update({
          rera_brn: brn ?? undefined,
          agency_name: agencyName ?? existing.agency_name,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id)
        agentId = existing.id
        result.updated++
      } else {
        const { data: inserted, error } = await this.supabase
          .from('agents')
          .insert({
            full_name: fullName || null,
            agency_name: agencyName,
            rera_brn: brn ?? undefined,
            city: 'Dubai',
          })
          .select('id')
          .single()
        if (error) throw error
        agentId = inserted.id

        await this.supabase.from('consent_and_outreach').upsert(
          { agent_id: agentId, outreach_status: 'new' },
          { onConflict: 'agent_id' }
        )
        result.added++
      }

      await this.supabase.from('agent_sources').upsert(
        { agent_id: agentId, source_name: 'dld', external_id: brn ?? null, raw_record_id: raw?.id ?? null },
        { onConflict: 'agent_id,source_name' }
      )

      if (brn) {
        await this.supabase.from('contact_provenance').upsert(
          { agent_id: agentId, field_name: 'rera_brn', source_name: 'dld', legal_basis: 'uae_public_government_register' },
          { onConflict: 'agent_id,field_name' } as never
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push(msg)
      result.failed++
    }
  }

  private extractBrn(rec: DldRecord): string | null {
    const raw = rec.brn ?? rec.rera_brn ?? rec.broker_registration_number ?? rec['BRN'] ?? rec['RERA BRN'] ?? null
    return raw?.trim() || null
  }
}
