export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const sb = createServerClient()

  const { data, error } = await sb
    .from('possible_duplicates')
    .select(`
      *,
      agent_a:agents!possible_duplicates_agent_id_a_fkey(id, full_name, agency_name, phone, email, rera_brn),
      agent_b:agents!possible_duplicates_agent_id_b_fkey(id, full_name, agency_name, phone, email, rera_brn)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ duplicates: data ?? [] })
}

export async function POST(req: NextRequest) {
  const sb = createServerClient()
  const { id, action } = await req.json()

  if (!['dismissed', 'merged'].includes(action)) {
    return NextResponse.json({ error: 'action must be dismissed or merged' }, { status: 400 })
  }

  if (action === 'merged') {
    // Get the duplicate record
    const { data: dup } = await sb
      .from('possible_duplicates')
      .select('*')
      .eq('id', id)
      .single()

    if (dup) {
      // Move all sources from agent_b to agent_a, then delete agent_b
      const { agent_id_a, agent_id_b } = dup
      await sb.from('agent_sources').update({ agent_id: agent_id_a }).eq('agent_id', agent_id_b)
      await sb.from('contact_provenance').update({ agent_id: agent_id_a }).eq('agent_id', agent_id_b)
      await sb.from('agents').delete().eq('id', agent_id_b)
    }
  }

  await sb.from('possible_duplicates').update({
    status: action,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}
