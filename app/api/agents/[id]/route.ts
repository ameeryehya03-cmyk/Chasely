export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { Agent } from '@/lib/database.types'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient()
  const { id } = params

  const [agentRes, sourcesRes, provenanceRes, outreachRes] = await Promise.all([
    sb.from('agents_enriched').select('*').eq('id', id).single(),
    sb.from('agent_sources').select('*').eq('agent_id', id).order('captured_at', { ascending: false }),
    sb.from('contact_provenance').select('*').eq('agent_id', id).order('captured_at', { ascending: false }),
    sb.from('consent_and_outreach').select('*').eq('agent_id', id).maybeSingle(),
  ])

  if (agentRes.error) return NextResponse.json({ error: agentRes.error.message }, { status: 404 })

  return NextResponse.json({
    agent: agentRes.data,
    sources: sourcesRes.data ?? [],
    provenance: provenanceRes.data ?? [],
    outreach: outreachRes.data,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient()
  const { id } = params
  const body = await req.json()

  const allowed = [
    'full_name', 'agency_name', 'phone', 'email', 'whatsapp',
    'instagram_handle', 'instagram_followers', 'linkedin_url', 'website',
    'rera_brn', 'specialization_areas', 'languages', 'address',
  ]
  const updates: Partial<Agent> = {}
  for (const k of allowed) {
    if (k in body) (updates as Record<string, unknown>)[k] = body[k]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await sb.from('agents').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update outreach status / notes if provided
  if (body.outreach_status || body.outreach_notes !== undefined) {
    await sb.from('consent_and_outreach').upsert(
      {
        agent_id: id,
        ...(body.outreach_status ? { outreach_status: body.outreach_status } : {}),
        ...(body.outreach_notes !== undefined ? { notes: body.outreach_notes } : {}),
      },
      { onConflict: 'agent_id' }
    )
  }

  return NextResponse.json({ agent: data })
}

// GDPR/UAE PDPL: Right to Erasure — hard-delete all data for this agent.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient()
  const { id } = params

  const { error } = await sb.from('agents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true, agent_id: id })
}
