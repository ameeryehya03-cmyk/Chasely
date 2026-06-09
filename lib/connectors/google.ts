// Google Places API connector — legal basis: Google Places API Terms of Service.
// Uses the Places API (New) Text Search + Place Details endpoints.
// All calls are server-side; the API key is never sent to the client.

import { BaseConnector, ConnectorResult } from './base'
import { normalizePhone, normalizeEmail } from '../normalization'

const DUBAI_SEARCH_QUERIES = [
  'real estate agent Dubai Business Bay',
  'real estate agent Dubai Downtown',
  'real estate agent Dubai Marina',
  'real estate agent Dubai JVC Jumeirah Village Circle',
  'real estate agent Dubai Palm Jumeirah',
  'real estate agent Dubai JBR Jumeirah Beach Residence',
  'real estate agent Dubai DIFC',
  'real estate agent Dubai Jumeirah',
  'real estate agent Dubai Creek',
  'real estate agent Dubai Deira',
  'real estate agent Dubai Bur Dubai',
  'real estate agent Dubai Sports City',
  'real estate agent Dubai Silicon Oasis',
  'real estate agent Dubai Mirdif',
  'real estate agent Dubai Arabian Ranches',
  'real estate broker Dubai',
  'property consultant Dubai',
  'Dubai real estate agency',
]

// Rate-limit: 10 QPS for Places API New (free tier). We use 200ms delay.
const DELAY_MS = 250

interface GooglePlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  businessStatus?: string
  regularOpeningHours?: unknown
}

interface TextSearchResponse {
  places: GooglePlace[]
  nextPageToken?: string
}

export class GooglePlacesConnector extends BaseConnector {
  readonly name = 'google'
  readonly legalBasis = 'google_places_api_tos'

  private apiKey: string

  constructor() {
    super()
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) throw new Error('GOOGLE_PLACES_API_KEY env var not set')
    this.apiKey = key
  }

  async run(params?: { queries?: string[] }): Promise<ConnectorResult> {
    const runId = await this.startRun(params)
    const result: ConnectorResult = { added: 0, updated: 0, skipped: 0, failed: 0, errors: [] }

    const queries = params?.queries ?? DUBAI_SEARCH_QUERIES

    try {
      for (const query of queries) {
        await this.processQuery(query, result)
        await sleep(DELAY_MS)
      }
      await this.finishRun(runId, result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await this.failRun(runId, msg)
      result.errors.push(msg)
    }

    return result
  }

  private async processQuery(query: string, result: ConnectorResult): Promise<void> {
    let pageToken: string | undefined

    do {
      const body: Record<string, unknown> = {
        textQuery: query,
        languageCode: 'en',
        regionCode: 'AE',
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: 25.2048, longitude: 55.2708 },
            radius: 50000.0,
          },
        },
      }
      if (pageToken) body.pageToken = pageToken

      const res = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': [
              'places.id',
              'places.displayName',
              'places.formattedAddress',
              'places.nationalPhoneNumber',
              'places.internationalPhoneNumber',
              'places.websiteUri',
              'places.rating',
              'places.userRatingCount',
              'places.businessStatus',
              'nextPageToken',
            ].join(','),
          },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        result.errors.push(`Google Places API error for "${query}": ${res.status} ${text}`)
        result.failed++
        return
      }

      const data: TextSearchResponse = await res.json()

      for (const place of data.places ?? []) {
        await this.upsertPlace(place, result)
        await sleep(50) // brief pause between DB ops
      }

      pageToken = data.nextPageToken
      if (pageToken) await sleep(DELAY_MS)
    } while (pageToken)
  }

  private async upsertPlace(place: GooglePlace, result: ConnectorResult): Promise<void> {
    try {
      // Save raw record
      const { data: raw } = await this.supabase
        .from('raw_records')
        .insert({
          connector: 'google',
          external_id: place.id,
          payload: place as unknown as Record<string, unknown>,
        })
        .select('id')
        .single()

      const phone = normalizePhone(place.internationalPhoneNumber ?? place.nationalPhoneNumber)
      const agentData = {
        full_name: place.displayName?.text ?? null,
        phone,
        website: place.websiteUri ?? null,
        address: place.formattedAddress ?? null,
        city: 'Dubai',
        google_place_id: place.id,
        google_rating: place.rating ?? null,
        google_review_count: place.userRatingCount ?? null,
      }

      // Check if already exists by place_id
      const { data: existing } = await this.supabase
        .from('agents')
        .select('id')
        .eq('google_place_id', place.id)
        .maybeSingle()

      let agentId: string

      if (existing) {
        await this.supabase
          .from('agents')
          .update({ ...agentData, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        agentId = existing.id
        result.updated++
      } else {
        // Also check by phone to detect cross-source duplicates
        let duplicateId: string | null = null
        if (phone) {
          const { data: phoneMatch } = await this.supabase
            .from('agents')
            .select('id')
            .eq('phone', phone)
            .maybeSingle()
          duplicateId = phoneMatch?.id ?? null
        }

        if (duplicateId) {
          // Flag as possible duplicate for review rather than auto-merging
          await this.supabase.from('possible_duplicates').upsert(
            {
              agent_id_a: duplicateId,
              agent_id_b: duplicateId, // will be overwritten after insert
              match_reason: 'phone',
              similarity_score: 0.95,
            },
            { onConflict: 'agent_id_a,agent_id_b' }
          )
          // Still insert the new agent so data isn't lost
        }

        const { data: inserted, error } = await this.supabase
          .from('agents')
          .insert(agentData)
          .select('id')
          .single()
        if (error) throw error
        agentId = inserted.id

        // Create consent_and_outreach row
        await this.supabase.from('consent_and_outreach').upsert(
          { agent_id: agentId, outreach_status: 'new' },
          { onConflict: 'agent_id' }
        )

        // If there was a phone match, record the duplicate properly
        if (duplicateId) {
          await this.supabase.from('possible_duplicates').upsert(
            {
              agent_id_a: duplicateId,
              agent_id_b: agentId,
              match_reason: 'phone',
              similarity_score: 0.95,
            },
            { onConflict: 'agent_id_a,agent_id_b' }
          )
        }

        result.added++
      }

      // Record source link
      await this.supabase.from('agent_sources').upsert(
        {
          agent_id: agentId,
          source_name: 'google',
          external_id: place.id,
          raw_record_id: raw?.id ?? null,
        },
        { onConflict: 'agent_id,source_name' }
      )

      // Record contact provenance for phone
      if (phone) {
        await this.supabase.from('contact_provenance').upsert(
          {
            agent_id: agentId,
            field_name: 'phone',
            source_name: 'google',
            legal_basis: 'google_places_api_tos',
          },
          { onConflict: 'agent_id,field_name' } as never
        )
      }
      if (place.websiteUri) {
        await this.supabase.from('contact_provenance').upsert(
          {
            agent_id: agentId,
            field_name: 'website',
            source_name: 'google',
            legal_basis: 'google_places_api_tos',
          },
          { onConflict: 'agent_id,field_name' } as never
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push(`Failed to upsert place ${place.id}: ${msg}`)
      result.failed++
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
