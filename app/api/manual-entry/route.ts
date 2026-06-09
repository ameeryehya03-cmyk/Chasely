export const dynamic = 'force-dynamic'
// DXBInteract manual reference entry endpoint.
//
// IMPORTANT — AUTOMATED ACCESS DISABLED BY DESIGN:
// dxbinteract.com is a commercial product of fäm Properties with its own
// Terms of Service and contains personal data of real estate agents.
// Automated scraping, crawling, or API calls against dxbinteract.com are
// NOT implemented and will not be added without a written data-license
// agreement with fäm Properties.
//
// This endpoint only accepts manually entered data, flagged source = 'manual'.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { normalizePhone, normalizeEmail } from '@/lib/normalization'

export async function POST(req: NextRequest) {
  const sb = createServerClient()
  const body = await req.json()

  const {
    full_name, agency_name, phone, email, whatsapp,
    instagram_handle, website, rera_brn, address,
    specialization_areas, languages,
    reference_notes,
  } = body

  if (!full_name) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
  }

  const agentData = {
    full_name,
    agency_name: agency_name || null,
    phone: normalizePhone(phone),
    email: normalizeEmail(email),
    whatsapp: normalizePhone(whatsapp),
    instagram_handle: instagram_handle || null,
    website: website || null,
    rera_brn: rera_brn || null,
    address: address || null,
    city: 'Dubai',
    specialization_areas: specialization_areas ?? [],
    languages: languages ?? [],
  }

  // Check for existing by BRN or phone
  let existing = null
  if (rera_brn) {
    const { data } = await sb.from('agents').select('id').eq('rera_brn', rera_brn).maybeSingle()
    existing = data
  }
  if (!existing && agentData.phone) {
    const { data } = await sb.from('agents').select('id').eq('phone', agentData.phone).maybeSingle()
    existing = data
  }

  let agentId: string

  if (existing) {
    await sb.from('agents').update(agentData).eq('id', existing.id)
    agentId = existing.id
  } else {
    const { data, error } = await sb.from('agents').insert(agentData).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    agentId = data.id
    await sb.from('consent_and_outreach').upsert(
      { agent_id: agentId, outreach_status: 'new' },
      { onConflict: 'agent_id' }
    )
  }

  // Source = manual / dxbinteract reference
  await sb.from('agent_sources').upsert(
    {
      agent_id: agentId,
      source_name: 'manual',
      external_id: null,
      source_url: null,
    },
    { onConflict: 'agent_id,source_name' }
  )

  // Record provenance for each provided field
  const fields = [
    ['phone', agentData.phone],
    ['email', agentData.email],
    ['whatsapp', agentData.whatsapp],
    ['website', agentData.website],
    ['instagram_handle', agentData.instagram_handle],
    ['rera_brn', rera_brn],
  ] as [string, string | null][]

  for (const [field, val] of fields) {
    if (val) {
      await sb.from('contact_provenance').upsert(
        {
          agent_id: agentId,
          field_name: field,
          source_name: 'manual',
          legal_basis: 'manual_entry_user_verified',
          notes: reference_notes ? `Reference: ${reference_notes}` : null,
        },
        { onConflict: 'agent_id,field_name' } as never
      )
    }
  }

  return NextResponse.json({ agent_id: agentId, created: !existing })
}
